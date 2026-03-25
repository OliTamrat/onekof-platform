/**
 * SCA-04: Spike Test — 500 Users in 30 Seconds
 * Assigned: Sute Dullo | Severity: HIGH
 *
 * PURPOSE: Simulate a sudden traffic surge (e.g. government announcement).
 * THRESHOLD: Error rate < 5% at peak, recovery within 60 seconds.
 *
 * WARNING: This test puts significant load on the server.
 * Confirm with Test Lead that the test environment is ready.
 *
 * RUN: k6 run spike_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, API_URL, THRESHOLDS } from './config.js';

const errorRate = new Rate('errors');
const spikeResponseTime = new Trend('spike_response_time', true);

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal baseline load
    { duration: '30s', target: 500 },   // SPIKE: 50 -> 500 in 30 seconds
    { duration: '1m', target: 500 },    // Hold spike for 1 minute
    { duration: '30s', target: 50 },    // Drop back to normal
    { duration: '2m', target: 50 },     // Recovery observation period
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: THRESHOLDS.spike,
};

export default function () {
  // Light requests to measure response under load

  // 1. Health check (fastest endpoint)
  const health = http.get(`${API_URL}/health`);
  spikeResponseTime.add(health.timings.duration);
  check(health, { 'health OK': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.5);

  // 2. Login page
  const login = http.get(`${BASE_URL}/auth/signin`);
  spikeResponseTime.add(login.timings.duration);
  check(login, { 'login page OK': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.5);

  // 3. Dashboard
  const dashboard = http.get(`${BASE_URL}/dashboard`, { redirects: 5 });
  spikeResponseTime.add(dashboard.timings.duration);
  check(dashboard, { 'dashboard responds': (r) => r.status === 200 || r.status === 302 }) || errorRate.add(1);
  sleep(0.5);

  // 4. API endpoint
  const projects = http.get(`${API_URL}/projects`);
  spikeResponseTime.add(projects.timings.duration);
  check(projects, { 'projects responds': (r) => r.status === 200 || r.status === 401 }) || errorRate.add(1);
  sleep(0.5);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const failRate = data.metrics.http_req_failed.values.rate;
  const totalReqs = data.metrics.http_reqs.values.count;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        SCA-04: SPIKE TEST (500 VUs) — RESULTS        ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Peak VUs:           500`.padEnd(55) + '║');
  console.log(`║  Total Requests:     ${totalReqs}`.padEnd(55) + '║');
  console.log(`║  p95 Response Time:  ${p95.toFixed(0)}ms`.padEnd(55) + '║');
  console.log(`║  Error Rate:         ${(failRate * 100).toFixed(2)}% (threshold: <5%)`.padEnd(55) + '║');
  console.log(`║  RESULT:             ${failRate < 0.05 ? 'PASS' : 'FAIL'}`.padEnd(55) + '║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  NOTE: Manually verify recovery time < 60s from     ║');
  console.log('║  the k6 real-time output during the test run.       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/sca-04-spike.json': JSON.stringify(data, null, 2),
  };
}
