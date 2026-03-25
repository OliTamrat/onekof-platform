/**
 * SCA-01: Baseline Single-User Performance
 * Assigned: Sute Dullo | Severity: CRITICAL
 *
 * PURPOSE: Establish baseline response times for a single user.
 * THRESHOLD: p95 < 500ms, error rate = 0%
 *
 * RUN: k6 run baseline_test.js
 * WITH ENV: k6 run -e BASE_URL=https://app.onekof.com baseline_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, API_URL, THRESHOLDS } from './config.js';

// Custom metrics for detailed reporting
const loginDuration = new Trend('login_duration', true);
const dashboardDuration = new Trend('dashboard_duration', true);
const projectsListDuration = new Trend('projects_list_duration', true);
const healthCheckDuration = new Trend('health_check_duration', true);
const errorRate = new Rate('errors');

export const options = {
  // Single user, multiple iterations to get reliable averages
  vus: 1,
  iterations: 20,
  thresholds: THRESHOLDS.baseline,
};

export default function () {
  // 1. Health check endpoint
  const healthRes = http.get(`${API_URL}/health`);
  healthCheckDuration.add(healthRes.timings.duration);
  check(healthRes, {
    'health check returns 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.5);

  // 2. Login page load
  const loginPageRes = http.get(`${BASE_URL}/auth/signin`);
  loginDuration.add(loginPageRes.timings.duration);
  check(loginPageRes, {
    'login page loads': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.5);

  // 3. Dashboard page (may redirect to login — that's OK for baseline)
  const dashRes = http.get(`${BASE_URL}/dashboard`, { redirects: 5 });
  dashboardDuration.add(dashRes.timings.duration);
  check(dashRes, {
    'dashboard responds': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(0.5);

  // 4. Projects API endpoint
  const projectsRes = http.get(`${API_URL}/projects`);
  projectsListDuration.add(projectsRes.timings.duration);
  check(projectsRes, {
    'projects API responds': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const avgDuration = data.metrics.http_req_duration.values.avg;
  const failRate = data.metrics.http_req_failed.values.rate;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║         SCA-01: BASELINE PERFORMANCE RESULTS         ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  p95 Response Time:  ${p95.toFixed(0)}ms (threshold: <500ms)`.padEnd(55) + '║');
  console.log(`║  Avg Response Time:  ${avgDuration.toFixed(0)}ms`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}% (threshold: <1%)`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${p95 < 500 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-01-baseline.json': JSON.stringify(data, null, 2),
  };
}
