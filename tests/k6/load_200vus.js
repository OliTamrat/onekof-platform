/**
 * SCA-03: 200 Concurrent Users — Heavy Load
 * Assigned: Sute Dullo | Severity: CRITICAL
 *
 * PURPOSE: Simulate 200 users — peak capacity for a government agency.
 * THRESHOLD: p95 < 5s, error rate < 1%
 *
 * RUN: k6 run load_200vus.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, API_URL, THRESHOLDS } from './config.js';

const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time', true);

export const options = {
  stages: [
    { duration: '3m', target: 200 },   // Ramp up to 200 users over 3 min
    { duration: '5m', target: 200 },   // Sustain 200 users for 5 min
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: THRESHOLDS.heavyLoad,
};

export default function () {
  // 1. Login page
  const loginPage = http.get(`${BASE_URL}/auth/signin`);
  pageLoadTime.add(loginPage.timings.duration);
  check(loginPage, { 'login page OK': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(1);

  // 2. Dashboard
  const dashboard = http.get(`${BASE_URL}/dashboard`, { redirects: 5 });
  pageLoadTime.add(dashboard.timings.duration);
  check(dashboard, { 'dashboard responds': (r) => r.status === 200 || r.status === 302 }) || errorRate.add(1);
  sleep(2);

  // 3. Projects API
  const projects = http.get(`${API_URL}/projects`);
  pageLoadTime.add(projects.timings.duration);
  check(projects, { 'projects responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  sleep(1);

  // 4. Issues API
  const issues = http.get(`${API_URL}/issues`);
  pageLoadTime.add(issues.timings.duration);
  check(issues, { 'issues responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  sleep(1);

  // 5. Health check
  const health = http.get(`${API_URL}/health`);
  check(health, { 'health OK': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(2);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const failRate = data.metrics.http_req_failed.values.rate;
  const totalReqs = data.metrics.http_reqs.values.count;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      SCA-03: 200 CONCURRENT USERS — RESULTS          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Peak VUs:           200`.padEnd(55) + '║');
  console.log(`║  Total Requests:     ${totalReqs}`.padEnd(55) + '║');
  console.log(`║  p95 Response Time:  ${p95.toFixed(0)}ms (threshold: <5000ms)`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}% (threshold: <1%)`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${p95 < 5000 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-03-load200.json': JSON.stringify(data, null, 2),
  };
}
