import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const code = (p: string) =>
  readFileSync(join(SRC, p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const ROUTE = 'app/api/patients/route.ts';

/**
 * The patient registry is the one place in this codebase where getting a
 * check wrong exposes health data. These guards pin the decisions from
 * MEDICAL_MODULE_ARCHITECTURE.md rather than trusting them to survive edits.
 */

describe('M1 scope boundary — operations, not an EMR', () => {
  it('has no field for clinical content', () => {
    const src = code(ROUTE);
    // Adding any of these changes the regulatory class of the company. It is
    // a decision, not a schema tweak, and this test is where it gets noticed.
    for (const forbidden of [
      'diagnosis', 'diagnoses', 'prescription', 'medication',
      'labResult', 'imaging', 'clinicalNote',
    ]) {
      expect(src.toLowerCase(), `route must not handle ${forbidden}`)
        .not.toContain(forbidden.toLowerCase());
    }
  });

  it('stores a birth year, never a full birth date', () => {
    const src = code(ROUTE);
    expect(src).toContain('birthYear');
    expect(src).not.toMatch(/\bdateOfBirth\b|\bbirthDate\b/);
  });
});

describe('every handler gates on patient access', () => {
  const src = code(ROUTE);

  it('GET and POST both call requirePatientAccess', () => {
    const handlers = src.split(/export async function /).slice(1);
    expect(handlers.length).toBe(2);
    for (const h of handlers) {
      expect(h).toContain('requirePatientAccess');
    }
  });

  it('gates before touching the patient table', () => {
    const gate = src.indexOf('requirePatientAccess');
    const query = src.indexOf('prisma.patient');
    expect(gate).toBeGreaterThan(-1);
    expect(query).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(query);
  });

  it('requires MANAGE to register a patient, not merely LIMITED', () => {
    const post = src.split('export async function POST')[1];
    expect(post).toMatch(/requirePatientAccess\([^)]*'MANAGE'\)/);
  });
});

describe('identifiers are protected in transit and at rest', () => {
  const src = code(ROUTE);

  it('looks up by blind index rather than decrypting every row', () => {
    expect(src).toContain('blindIndex(identifier)');
  });

  it('encrypts the identifier before storing it', () => {
    expect(src).toMatch(/identifierEncrypted:\s*encryptField/);
  });

  it('redacts identifiers for LIMITED access', () => {
    expect(src).toContain('canSeeIdentifiers');
    // The redacted shape must not carry a name or an identifier at all —
    // LIMITED exists so care work can be coordinated by people who have no
    // business knowing who the patient is.
    const redacted = src.split('function redacted')[1].split('}')[0];
    expect(redacted).not.toContain('identifier');
    expect(redacted).not.toContain('displayName');
  });
});

describe('M4 — reads are audited, and the log never leaks what it protects', () => {
  const src = code(ROUTE);

  it('audits viewing identifying data', () => {
    expect(src).toContain('OrgActions.PATIENT_VIEWED');
  });

  it('does not audit a redacted read as a view', () => {
    // The redacted branch returns before the audit call: someone who cannot
    // see identifiers has not viewed a patient in the sense M4 means.
    const redactedReturn = src.indexOf('patients.map(redacted)');
    const audit = src.indexOf('PATIENT_VIEWED');
    expect(redactedReturn).toBeLessThan(audit);
  });

  it('never writes the identifier into the audit entry', () => {
    // An audit log recording the plaintext it exists to protect defeats the
    // encryption on the row.
    const created = src.split('PATIENT_CREATED')[1].split('});')[0];
    expect(created).not.toMatch(/identifier(?!s)/);
    expect(created).not.toContain('displayName:');
  });
});
