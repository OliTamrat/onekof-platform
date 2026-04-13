#!/usr/bin/env node
/**
 * Generate bcrypt hash for ADMIN_USERS environment variable.
 *
 * Usage:
 *   node scripts/generate-admin-hash.mjs
 *   node scripts/generate-admin-hash.mjs "mypassword"
 *
 * Output: a ready-to-paste ADMIN_USERS JSON string for .env files.
 */

import { hash } from 'bcryptjs';
import { createInterface } from 'readline';

const BCRYPT_ROUNDS = 12;

async function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const password = process.argv[2] || await prompt('Enter admin password: ');
  if (!password) {
    console.error('Error: password is required');
    process.exit(1);
  }

  const username = process.argv[3] || await prompt('Enter admin username (default: admin): ') || 'admin';
  const name = process.argv[4] || await prompt('Enter display name (default: Administrator): ') || 'Administrator';
  const role = process.argv[5] || 'OWNER';

  const hashed = await hash(password, BCRYPT_ROUNDS);

  const adminUsers = [{ username, password: hashed, role, name }];
  const json = JSON.stringify(adminUsers);

  console.log('\n--- Copy this into your .env file ---\n');
  console.log(`ADMIN_USERS='${json}'`);
  console.log('\n--- Individual hash (for reference) ---\n');
  console.log(hashed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
