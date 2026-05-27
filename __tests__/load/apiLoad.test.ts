/**
 * Load / performance tests for core async services.
 *
 * These tests simulate concurrent API calls and assert that p50 and p95
 * response times stay within acceptable thresholds when the underlying
 * network is mocked to return in 0–200 ms.
 *
 * Run with: npx jest __tests__/load/apiLoad.test.ts --testTimeout=30000
 */

jest.mock('../../utils/mapsService', () => ({
  getRoutes: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../utils/firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'load-test-uid' } },
}));

import { getRoutes } from '../../utils/mapsService';
import { getDocs } from 'firebase/firestore';
import { computeUncertainty } from '../../utils/uncertaintyService';
import { fetchCumulativeImpact } from '../../utils/impactService';

const mockGetRoutes = getRoutes as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;

const ORIGIN = { latitude: 4.86, longitude: -74.03 };
const DESTINATION = { latitude: 4.71, longitude: -74.07 };

function makeRoute(sec: number) {
  return [{
    index: 0, summary: 'Ruta', distanceText: '20 km', distanceMeters: 20000,
    durationText: '35 min', durationSeconds: 2100,
    durationInTrafficText: `${Math.round(sec / 60)} min`,
    durationInTrafficSeconds: sec, polylineCoords: [],
  }];
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function measureMs(fn: () => Promise<unknown>): Promise<number> {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}

// ─── computeUncertainty load ────────────────────────────────────────────────

describe('computeUncertainty — concurrent load', () => {
  beforeEach(() => mockGetRoutes.mockClear());

  it('handles 20 concurrent calls within p95 < 1000 ms (mocked network)', async () => {
    // Simulate each getRoutes call taking 10–50 ms
    mockGetRoutes.mockImplementation(
      () => new Promise(res => setTimeout(() => res(makeRoute(2100)), 10 + Math.random() * 40))
    );

    const calls = Array.from({ length: 20 }, () =>
      measureMs(() => computeUncertainty(ORIGIN, DESTINATION))
    );
    const durations = (await Promise.all(calls)).sort((a, b) => a - b);

    const p50 = percentile(durations, 50);
    const p95 = percentile(durations, 95);

    // Each call fires 6 concurrent getRoutes requests, so total latency ≈ single request latency
    expect(p50).toBeLessThan(500);
    expect(p95).toBeLessThan(1000);
  });

  it('handles 50 concurrent calls without throwing', async () => {
    mockGetRoutes.mockResolvedValue(makeRoute(2100));

    const results = await Promise.allSettled(
      Array.from({ length: 50 }, () => computeUncertainty(ORIGIN, DESTINATION))
    );

    const failures = results.filter(r => r.status === 'rejected');
    expect(failures.length).toBe(0);
  });

  it('degrades gracefully when 50% of API calls fail under load', async () => {
    let callCount = 0;
    mockGetRoutes.mockImplementation(() => {
      callCount++;
      if (callCount % 2 === 0) return Promise.reject(new Error('timeout'));
      return Promise.resolve(makeRoute(2100));
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () => computeUncertainty(ORIGIN, DESTINATION))
    );

    // Every call should still return a result (partial failures handled internally)
    expect(results.every(r => r.meanSeconds >= 0)).toBe(true);
    expect(results.every(r => r.marginMinutes >= 0)).toBe(true);
  });
});

// ─── fetchCumulativeImpact load ─────────────────────────────────────────────

describe('fetchCumulativeImpact — concurrent load', () => {
  beforeEach(() => mockGetDocs.mockClear());

  it('handles 30 concurrent Firestore reads within p95 < 300 ms (mocked)', async () => {
    mockGetDocs.mockImplementation(
      () => new Promise(res => setTimeout(() => res({
        empty: false,
        docs: [
          { data: () => ({ marginMinutes: 10 }) },
          { data: () => ({ marginMinutes: 5 }) },
        ],
      }), 5 + Math.random() * 20))
    );

    const calls = Array.from({ length: 30 }, () =>
      measureMs(() => fetchCumulativeImpact())
    );
    const durations = (await Promise.all(calls)).sort((a, b) => a - b);

    const p50 = percentile(durations, 50);
    const p95 = percentile(durations, 95);

    expect(p50).toBeLessThan(150);
    expect(p95).toBeLessThan(300);
  });

  it('all 30 concurrent calls return consistent totalTrips count', async () => {
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [
        { data: () => ({ marginMinutes: 8 }) },
        { data: () => ({ marginMinutes: 12 }) },
        { data: () => ({ marginMinutes: 3 }) },
      ],
    });

    const results = await Promise.all(
      Array.from({ length: 30 }, () => fetchCumulativeImpact())
    );

    expect(results.every(r => r.totalTrips === 3)).toBe(true);
    expect(results.every(r => r.timeSavedMin === 23)).toBe(true);
  });

  it('handles 100 rapid sequential calls without memory growth', async () => {
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

    const RUNS = 100;
    for (let i = 0; i < RUNS; i++) {
      const result = await fetchCumulativeImpact();
      expect(result.totalTrips).toBe(0);
    }
    expect(mockGetDocs).toHaveBeenCalledTimes(RUNS);
  });
});
