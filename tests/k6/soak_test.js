/**
 * SCA-05: 2-Hour Soak Test — Memory Leak Detection
 * Assigned: Sute Dullo | Severity: HIGH
 *
 * PURPOSE: Run sustained load for 2 hours to detect memory leaks,
 * connection pool exhaustion, or gradual performance degradation.
 * THRESHOLD: p95 < 3s, error rate < 1%, no memory leak pattern
 *
 * WARNING: This test runs for ~2.5 hours. Plan accordingly.
 *
 * RUN: k6 run soak_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { BASE_URL, API_URL, THRESHOLDS } from './config.js';

const errorRate = new Rate('errors');
const serverErrors = new Counter('server_5xx_errors');

export const options = {
  stages: [
    { duration: '5m', target: 50 },     // Ramp up to 50 users
    { duration: '2h', target: 50 },     // Sustain for 2 hours
    { duration: '5m', target: 0 },      // Ramp down
  ],
  thresholds: THRESHOLDS.soak,
};

export default function () {
  // Simulate steady-state usage

  // 1. Health check
  const health = http.get(`${API_URL}/health`);
  check(health, { 'health OK': (r) => r.status === 200 }) || errorRate.add(1);
  if (health.status >= 500) serverErrors.add(1);
  sleep(1);

  // 2. Dashboard
  const dashboard = http.get(`${BASE_URL}/dashboard`, { redirects: 5 });
  check(dashboard, { 'dashboard responds': (r) => r.status === 200 || r.status === 302 }) || errorRate.add(1);
  if (dashboard.status >= 500) serverErrors.add(1);
  sleep(2);

  // 3. Projects
  const projects = http.get(`${API_URL}/projects`);
  check(projects, { 'projects responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  if (projects.status >= 500) serverErrors.add(1);
  sleep(1);

  // 4. Issues
  const issues = http.get(`${API_URL}/issues`);
  check(issues, { 'issues responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  if (issues.status >= 500) serverErrors.add(1);
  sleep(2);

  // 5. Teams
  const teams = http.get(`${API_URL}/teams`);
  check(teams, { 'teams responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  if (teams.status >= 500) serverErrors.add(1);
  sleep(3);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const failRate = data.metrics.http_req_failed.values.rate;
  const totalReqs = data.metrics.http_reqs.values.count;
  const fiveXXCount = data.metrics.server_5xx_errors ? data.metrics.server_5xx_errors.values.count : 0;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       SCA-05: 2-HOUR SOAK TEST — RESULTS             ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Duration:           ~2 hours 10 minutes`.padEnd(55) + '║');
  console.log(`║  Sustained VUs:      50`.padEnd(55) + '║');
  console.log(`║  Total Requests:     ${totalReqs}`.padEnd(55) + '║');
  console.log(`║  p95 Response Time:  ${p95.toFixed(0)}ms (threshold: <3000ms)`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}% (threshold: <1%)`.padEnd(55) + '║');
  console.log(`║  5xx Server Errors:  ${fiveXXCount}`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${p95 < 3000 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  CHECK: Compare response times at start vs end.     ║');
  console.log('║  If end times are 2x+ start times = memory leak.   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-05-soak.json': JSON.stringify(data, null, 2),
  };
}
