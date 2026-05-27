/**
 * Unit tests for impactService.fetchCumulativeImpact.
 * Firestore (firebase/firestore) and firebaseConfig are mocked to avoid real network calls.
 */

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../utils/firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid-123' } },
}));

import { getDocs } from 'firebase/firestore';
import { fetchCumulativeImpact } from '../utils/impactService';

const mockGetDocs = getDocs as jest.Mock;

function makeSnap(trips: { marginMinutes?: number }[]) {
  return {
    empty: trips.length === 0,
    docs: trips.map(t => ({ data: () => t })),
  };
}

beforeEach(() => {
  mockGetDocs.mockClear();
});

describe('fetchCumulativeImpact', () => {
  it('returns EMPTY when there is no authenticated user', async () => {
    // Temporarily override auth to have no user
    const config = require('../utils/firebaseConfig');
    const original = config.auth.currentUser;
    config.auth.currentUser = null;

    const result = await fetchCumulativeImpact();
    expect(result.totalTrips).toBe(0);
    expect(result.timeSavedMin).toBe(0);
    expect(result.co2SavedKg).toBe(0);
    expect(result.safetyPercent).toBe(0);

    config.auth.currentUser = original;
  });

  it('returns EMPTY when the user has no planned trips', async () => {
    mockGetDocs.mockResolvedValue(makeSnap([]));

    const result = await fetchCumulativeImpact();
    expect(result.totalTrips).toBe(0);
    expect(result.timeSavedMin).toBe(0);
    expect(result.co2SavedKg).toBe(0);
    expect(result.safetyPercent).toBe(0);
  });

  it('computes correct timeSavedMin as sum of all marginMinutes', async () => {
    mockGetDocs.mockResolvedValue(
      makeSnap([{ marginMinutes: 10 }, { marginMinutes: 5 }, { marginMinutes: 20 }])
    );

    const result = await fetchCumulativeImpact();
    expect(result.timeSavedMin).toBe(35);
    expect(result.totalTrips).toBe(3);
  });

  it('computes CO₂ as marginMinutes × 0.06 kg rounded to 1 decimal', async () => {
    mockGetDocs.mockResolvedValue(makeSnap([{ marginMinutes: 10 }]));

    const result = await fetchCumulativeImpact();
    // 10 × 0.06 = 0.6
    expect(result.co2SavedKg).toBeCloseTo(0.6, 1);
  });

  it('rounds CO₂ correctly for fractional values', async () => {
    // 17 × 0.06 = 1.02 → rounded to 1 decimal = 1.0
    mockGetDocs.mockResolvedValue(makeSnap([{ marginMinutes: 17 }]));

    const result = await fetchCumulativeImpact();
    expect(result.co2SavedKg).toBe(1.0);
  });

  it('computes safetyPercent as % of trips with marginMinutes ≤ 10', async () => {
    mockGetDocs.mockResolvedValue(
      makeSnap([
        { marginMinutes: 5 },   // predictable
        { marginMinutes: 10 },  // predictable (boundary)
        { marginMinutes: 11 },  // NOT predictable
        { marginMinutes: 30 },  // NOT predictable
      ])
    );

    const result = await fetchCumulativeImpact();
    expect(result.safetyPercent).toBe(50); // 2/4 = 50%
  });

  it('returns 100% safety when all trips are predictable', async () => {
    mockGetDocs.mockResolvedValue(
      makeSnap([{ marginMinutes: 3 }, { marginMinutes: 7 }, { marginMinutes: 10 }])
    );

    const result = await fetchCumulativeImpact();
    expect(result.safetyPercent).toBe(100);
  });

  it('returns 0% safety when no trips are predictable', async () => {
    mockGetDocs.mockResolvedValue(
      makeSnap([{ marginMinutes: 15 }, { marginMinutes: 25 }])
    );

    const result = await fetchCumulativeImpact();
    expect(result.safetyPercent).toBe(0);
  });

  it('treats missing marginMinutes as 0 for timeSaved and CO₂', async () => {
    mockGetDocs.mockResolvedValue(
      makeSnap([{ marginMinutes: 10 }, {}])  // second trip has no marginMinutes
    );

    const result = await fetchCumulativeImpact();
    // Only 10 min counted for the trip without the field
    expect(result.timeSavedMin).toBe(10);
  });

  it('treats missing marginMinutes as 99 for safety (not predictable)', async () => {
    mockGetDocs.mockResolvedValue(makeSnap([{}]));

    const result = await fetchCumulativeImpact();
    expect(result.safetyPercent).toBe(0); // 99 > 10, not predictable
    expect(result.totalTrips).toBe(1);
  });

  it('returns EMPTY and does not throw when Firestore throws', async () => {
    mockGetDocs.mockRejectedValue(new Error('Firestore offline'));

    const result = await fetchCumulativeImpact();
    expect(result).toEqual({ timeSavedMin: 0, co2SavedKg: 0, safetyPercent: 0, totalTrips: 0 });
  });
});
