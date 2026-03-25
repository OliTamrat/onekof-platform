/**
 * SCA-06: Large Data Query Performance
 * Assigned: Sute Dullo | Severity: HIGH
 *
 * PURPOSE: Test API response times when querying large datasets.
 * THRESHOLD: Response time < 800ms for paginated queries.
 *
 * RUN: k6 run large_data_query.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { API_URL } from './config.js';

const queryDuration = new Trend('query_duration', true);
const errorRate = new Rate('errors');

export const options = {
  vus: 5,
  iterations: 50,
  thresholds: {
    query_duration: ['p(95)<800'],      // SCA-06: < 800ms
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 1. Paginated projects query (page 1, large limit)
  const projects = http.get(`${API_URL}/projects?page=1&limit=100`);
  queryDuration.add(projects.timings.duration);
  check(projects, {
    'projects query responds': (r) => r.status === 200 || r.status === 401,
    'projects query < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);
  sleep(0.5);

  // 2. Issues with filters
  const issues = http.get(`${API_URL}/issues?page=1&limit=50&status=TODO`);
  queryDuration.add(issues.timings.duration);
  check(issues, {
    'filtered issues responds': (r) => r.status === 200 || r.status === 401,
    'filtered issues < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);
  sleep(0.5);

  // 3. Teams list
  const teams = http.get(`${API_URL}/teams`);
  queryDuration.add(teams.timings.duration);
  check(teams, {
    'teams query responds': (r) => r.status === 200 || r.status === 401,
    'teams query < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);
  sleep(0.5);

  // 4. Budgets endpoint
  const budgets = http.get(`${API_URL}/budgets`);
  queryDuration.add(budgets.timings.duration);
  check(budgets, {
    'budgets query responds': (r) => r.status === 200 || r.status === 401,
    'budgets query < 800ms': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);
  sleep(1);
}

export function handleSummary(data) {
  const p95 = data.metrics.query_duration.values['p(95)'];
  const failRate = data.metrics.http_req_failed.values.rate;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       SCA-06: LARGE DATA QUERY — RESULTS             ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  p95 Query Time:     ${p95.toFixed(0)}ms (threshold: <800ms)`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}%`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${p95 < 800 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-06-large-query.json': JSON.stringify(data, null, 2),
  };
}
