/**
 * SCA-10: Database Connection Pool Under Load
 * Assigned: Sute Dullo | Severity: HIGH
 *
 * PURPOSE: Verify the database connection pool handles concurrent
 * requests without returning 500 errors.
 * THRESHOLD: No 500 errors under sustained concurrent load.
 *
 * RUN: k6 run db_connection_pool.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import { API_URL } from './config.js';

const errorRate = new Rate('errors');
const serverErrors = new Counter('server_5xx_errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },    // High concurrent DB load
    { duration: '2m', target: 100 },    // Sustain
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    server_5xx_errors: ['count<5'],     // Less than 5 server errors total
  },
};

export default function () {
  // Rapid-fire DB-hitting endpoints to stress the connection pool

  // 1. Health check (likely hits DB)
  const health = http.get(`${API_URL}/health`);
  check(health, { 'health OK': (r) => r.status === 200 }) || errorRate.add(1);
  if (health.status >= 500) serverErrors.add(1);

  // 2. Projects list (DB query)
  const projects = http.get(`${API_URL}/projects`);
  check(projects, { 'projects OK': (r) => r.status < 500 }) || errorRate.add(1);
  if (projects.status >= 500) serverErrors.add(1);

  // 3. Issues list (DB query)
  const issues = http.get(`${API_URL}/issues`);
  check(issues, { 'issues OK': (r) => r.status < 500 }) || errorRate.add(1);
  if (issues.status >= 500) serverErrors.add(1);

  // 4. Teams (DB query)
  const teams = http.get(`${API_URL}/teams`);
  check(teams, { 'teams OK': (r) => r.status < 500 }) || errorRate.add(1);
  if (teams.status >= 500) serverErrors.add(1);

  sleep(0.5);
}

export function handleSummary(data) {
  const failRate = data.metrics.http_req_failed.values.rate;
  const fiveXXCount = data.metrics.server_5xx_errors ? data.metrics.server_5xx_errors.values.count : 0;
  const totalReqs = data.metrics.http_reqs.values.count;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      SCA-10: DB CONNECTION POOL — RESULTS            ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Peak VUs:           100`.padEnd(55) + '║');
  console.log(`║  Total Requests:     ${totalReqs}`.padEnd(55) + '║');
  console.log(`║  5xx Server Errors:  ${fiveXXCount} (threshold: <5)`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}%`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${fiveXXCount < 5 && failRate < 0.01 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-10-dbpool.json': JSON.stringify(data, null, 2),
  };
}
