import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const read = (p: string) => readFileSync(join(SRC, p), 'utf8');
// Comments describing an old bug must not satisfy a guard against it.
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const INVITATIONS = 'app/api/organizations/[organizationId]/invitations/route.ts';
const ACCEPT = 'app/api/invitations/accept/route.ts';
const ORG_MEMBERS = 'app/api/organizations/[organizationId]/members/route.ts';

/**
 * The OrgAuditLog action catalogue defined membership actions that no route
 * ever wrote. Onekof sells to government institutions on an INSA-aligned
 * audit story, so "the catalogue lists it" must mean "the log contains it".
 */
describe('membership lifecycle is audited', () => {
  it('records invitations being sent', () => {
    const src = code(INVITATIONS);
    expect(src).toContain('OrgActions.INVITATION_SENT');
    expect(src).toMatch(/import\s*\{[^}]*logOrgAction[^}]*\}/);
  });

  it('records invitations being revoked', () => {
    expect(code(INVITATIONS)).toContain('OrgActions.INVITATION_REVOKED');
  });

  it('records invitations being accepted', () => {
    expect(code(ACCEPT)).toContain('OrgActions.INVITATION_ACCEPTED');
  });

  it('keeps who issued the invitation on the acceptance entry', () => {
    // The actor on acceptance is the invitee. Without invitedBy the trail
    // shows people joining with no record of who let them in.
    expect(code(ACCEPT)).toContain('invitedBy');
  });
});

describe('cross-tenant scoping on membership routes', () => {
  it('scopes invitation revocation to the organization in the path', () => {
    const src = code(INVITATIONS);
    // The delete previously ran on the id alone, so an admin of one
    // organization could revoke another organization's invitation.
    expect(src).toMatch(/findFirst\(\{[\s\S]*?organizationId[\s\S]*?\}\)/);
    expect(src).not.toMatch(/invitation\.delete\(\{\s*where:\s*\{\s*id:\s*invitationId\s*\}/);
  });

  it('rejects a member-list request whose path org differs from the caller org', () => {
    const src = code(ORG_MEMBERS);
    // resolveUserOrganization authorizes against the subdomain header, not
    // the path id; without this comparison the two can disagree.
    expect(src).toMatch(/organizationId\s*!==\s*ctx\.organizationId/);
  });

  it('compares the organizations before querying members', () => {
    const src = code(ORG_MEMBERS);
    const guardAt = src.indexOf('ctx.organizationId');
    const queryAt = src.indexOf('organizationMember.findMany');
    expect(guardAt).toBeGreaterThan(-1);
    expect(queryAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(queryAt);
  });
});

describe('team lifecycle is audited', () => {
  it('records team creation', () => {
    expect(code('app/api/teams/route.ts')).toContain('OrgActions.TEAM_CREATED');
  });

  it('records team deletion', () => {
    // Teams are soft-deleted; the audit entry is the record that survives
    // independently of the row.
    expect(code('app/api/teams/[id]/route.ts')).toContain('OrgActions.TEAM_DELETED');
  });
});

describe('organization membership changes are audited', () => {
  const route = code('app/api/organization-members/route.ts');

  it('records role changes with the previous role', () => {
    expect(route).toContain('OrgActions.ORG_MEMBER_ROLE_CHANGED');
    // "X is now an ADMIN" is far less useful to an investigator than
    // "X was a MEMBER and was made an ADMIN by Y".
    expect(route).toMatch(/before:\s*\{\s*role:\s*target\.role\s*\}/);
  });

  it('records removals with the role that was revoked', () => {
    expect(route).toContain('OrgActions.ORG_MEMBER_REMOVED');
  });

  it('audits after the mutation, never instead of it', () => {
    const update = route.indexOf('organizationMember.update');
    const audit = route.indexOf('ORG_MEMBER_ROLE_CHANGED');
    expect(update).toBeGreaterThan(-1);
    expect(update).toBeLessThan(audit);
  });
});

describe('team membership changes are audited', () => {
  it('records team member removal', () => {
    const route = code('app/api/teams/[id]/members/[userId]/route.ts');
    expect(route).toContain('OrgActions.TEAM_MEMBER_REMOVED');
    // Teams carry project access, so the revoked team role is the useful fact.
    expect(route).toMatch(/before:\s*\{[^}]*role:\s*memberToRemove\.role/);
  });
});

describe('audit logging never breaks the caller', () => {
  it('swallows its own failures', async () => {
    const src = read('lib/security/org-audit.ts');
    expect(src).toContain('catch');
    // logOrgAction is deliberately called without await at the call sites, so
    // a slow or failing audit write cannot delay or fail a member operation.
    expect(src).toContain('Audit logging must never break the caller');
  });
});
