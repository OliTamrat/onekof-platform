/**
 * k6 Test Configuration — Onekof Platform
 * Shared configuration for all load test scripts
 *
 * USAGE: Update BASE_URL and TEST_CREDENTIALS before running tests.
 * Ask the Test Lead for the correct values for your environment.
 */

// ============================================================
// ENVIRONMENT CONFIGURATION — UPDATE THESE BEFORE TESTING
// ============================================================
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const API_URL = `${BASE_URL}/api`;

// Test account credentials (Test Lead provides these)
export const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'testuser@onekof.com',
  password: __ENV.TEST_PASSWORD || 'TestPassword123!',
};

// ============================================================
// THRESHOLDS — Pass/fail criteria from the QA Field Guide
// ============================================================
export const THRESHOLDS = {
  baseline: {
    http_req_duration: ['p(95)<500'],   // SCA-01: p95 < 500ms
    http_req_failed: ['rate<0.01'],     // SCA-01: error rate < 1%
  },
  normalLoad: {
    http_req_duration: ['p(95)<2000'],  // SCA-02: p95 < 2s
    http_req_failed: ['rate<0.01'],     // SCA-02: error rate < 1%
  },
  heavyLoad: {
    http_req_duration: ['p(95)<5000'],  // SCA-03: p95 < 5s
    http_req_failed: ['rate<0.01'],     // SCA-03: error rate < 1%
  },
  spike: {
    http_req_duration: ['p(95)<10000'], // SCA-04: some degradation OK
    http_req_failed: ['rate<0.05'],     // SCA-04: error rate < 5%
  },
  soak: {
    http_req_duration: ['p(95)<3000'],  // SCA-05: p95 < 3s sustained
    http_req_failed: ['rate<0.01'],     // SCA-05: error rate < 1%
  },
};

// ============================================================
// HELPER: Login and get auth token
// ============================================================
import http from 'k6/http';

export function login(email, password) {
  const loginRes = http.post(`${API_URL}/auth/callback/credentials`, JSON.stringify({
    email: email || TEST_USER.email,
    password: password || TEST_USER.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
    redirects: 0,
  });

  // Extract session cookie from Set-Cookie header
  const cookies = loginRes.headers['Set-Cookie'];
  if (cookies) {
    // NextAuth sets session token in cookie
    const sessionMatch = cookies.match(/next-auth\.session-token=([^;]+)/);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }
  return null;
}

/**
 * Get auth headers for API requests
 */
export function authHeaders(sessionToken) {
  return {
    'Content-Type': 'application/json',
    'Cookie': `next-auth.session-token=${sessionToken}`,
  };
}
