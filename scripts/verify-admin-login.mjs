#!/usr/bin/env node
/**
 * End-to-end verification for the admin login endpoint.
 *
 * Performs a real POST to /api/admin/login and asserts that valid credentials
 * succeed (200 + success body + onekof-admin-token cookie) and that invalid
 * credentials are rejected (401). Use this after configuring ADMIN_USERS /
 * ADMIN_SECRET in the target environment and redeploying.
 *
 * Usage:
 *   node scripts/verify-admin-login.mjs --url https://onekof.com --user insa-reviewer --pass 'the-password'
 *
 * Or via environment variables:
 *   ADMIN_LOGIN_URL=https://onekof.com \
 *   ADMIN_LOGIN_USER=insa-reviewer \
 *   ADMIN_LOGIN_PASS='the-password' \
 *   node scripts/verify-admin-login.mjs
 *
 * Exit code 0 = all checks passed, 1 = a check failed.
 */

function arg(name, fallbackEnv) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return process.env[fallbackEnv] || '';
}

const baseUrl = (arg('url', 'ADMIN_LOGIN_URL') || 'http://localhost:3000').replace(/\/$/, '');
const username = arg('user', 'ADMIN_LOGIN_USER');
const password = arg('pass', 'ADMIN_LOGIN_PASS');

if (!username || !password) {
  console.error('Error: username and password are required (--user / --pass or ADMIN_LOGIN_USER / ADMIN_LOGIN_PASS).');
  process.exit(1);
}

const endpoint = `${baseUrl}/api/admin/login`;

async function post(body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'manual',
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json, setCookie: res.headers.get('set-cookie') || '' };
}

function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS ✅' : 'FAIL ❌'}  ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

async function main() {
  console.log(`E2E admin login check against: ${endpoint}\n`);

  let allPassed = true;

  // 1) Valid credentials should succeed.
  const good = await post({ username, password });
  allPassed = check('valid credentials return HTTP 200', good.status === 200, `got ${good.status}`) && allPassed;
  allPassed = check('response body has success:true', good.json?.success === true) && allPassed;
  allPassed = check('admin username echoed back', good.json?.admin?.username === username, good.json?.admin?.username || 'missing') && allPassed;
  allPassed = check('onekof-admin-token cookie is set', good.setCookie.includes('onekof-admin-token=')) && allPassed;

  // 2) Wrong password must be rejected.
  const bad = await post({ username, password: `${password}-wrong` });
  allPassed = check('wrong password is rejected (HTTP 401)', bad.status === 401, `got ${bad.status}`) && allPassed;

  // 3) Missing fields must be a 400.
  const missing = await post({ username });
  allPassed = check('missing password is a 400', missing.status === 400, `got ${missing.status}`) && allPassed;

  console.log(`\n${allPassed ? '✅ All checks passed.' : '❌ Some checks failed.'}`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Request failed:', err.message);
  console.error(`Could not reach ${endpoint} — is the URL correct and the deployment live?`);
  process.exit(1);
});
