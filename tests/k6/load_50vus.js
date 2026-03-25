/**
 * SCA-02: 50 Concurrent Users — Normal Load
 * Assigned: Sute Dullo | Severity: CRITICAL
 *
 * PURPOSE: Simulate 50 users using the app simultaneously (normal busy day).
 * THRESHOLD: p95 < 2s, error rate < 1%
 *
 * RUN: k6 run load_50vus.js
 * WITH ENV: k6 run -e BASE_URL=https://app.onekof.com load_50vus.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, API_URL, THRESHOLDS } from './config.js';

const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time', true);

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 min
    { duration: '5m', target: 50 },   // Stay at 50 users for 5 min
    { duration: '1m', target: 0 },    // Ramp down to 0
  ],
  thresholds: THRESHOLDS.normalLoad,
};

export default function () {
  // Simulate typical user journey

  // 1. Load login page
  const loginPage = http.get(`${BASE_URL}/auth/signin`);
  pageLoadTime.add(loginPage.timings.duration);
  check(loginPage, {
    'login page status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(1);

  // 2. Load dashboard
  const dashboard = http.get(`${BASE_URL}/dashboard`, { redirects: 5 });
  pageLoadTime.add(dashboard.timings.duration);
  check(dashboard, {
    'dashboard responds': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);
  sleep(2);

  // 3. Browse projects
  const projects = http.get(`${API_URL}/projects`);
  pageLoadTime.add(projects.timings.duration);
  check(projects, {
    'projects API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);
  sleep(1);

  // 4. Health check
  const health = http.get(`${API_URL}/health`);
  check(health, {
    'health check OK': (r) => r.status === 200,
  }) || errorRate.add(1);
  sleep(2);

  // 5. Load issues endpoint
  const issues = http.get(`${API_URL}/issues`);
  pageLoadTime.add(issues.timings.duration);
  check(issues, {
    'issues API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);
  sleep(1);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const failRate = data.metrics.http_req_failed.values.rate;
  const totalReqs = data.metrics.http_reqs.values.count;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       SCA-02: 50 CONCURRENT USERS — RESULTS          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Peak VUs:           50`.padEnd(55) + '║');
  console.log(`║  Total Requests:     ${totalReqs}`.padEnd(55) + '║');
  console.log(`║  p95 Response Time:  ${p95.toFixed(0)}ms (threshold: <2000ms)`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}% (threshold: <1%)`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${p95 < 2000 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-02-load50.json': JSON.stringify(data, null, 2),
  };
}
