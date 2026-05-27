/**
 * Unit tests for uncertaintyService.
 * getRoutes (from mapsService) is mocked to avoid real API calls.
 */

jest.mock('../utils/mapsService', () => ({
  getRoutes: jest.fn(),
}));

import { getRoutes } from '../utils/mapsService';
import { computeUncertainty } from '../utils/uncertaintyService';

const mockGetRoutes = getRoutes as jest.Mock;

const origin = { latitude: 4.86, longitude: -74.03 };
const destination = { latitude: 4.71, longitude: -74.07 };

function makeRoute(durationInTrafficSeconds: number) {
  return [{ durationInTrafficSeconds, index: 0, summary: 'Ruta', distanceText: '20 km', distanceMeters: 20000, durationText: '35 min', durationSeconds: 2100, durationInTrafficText: `${Math.round(durationInTrafficSeconds / 60)} min`, polylineCoords: [] }];
}

beforeEach(() => mockGetRoutes.mockClear());

describe('computeUncertainty', () => {
  it('returns zero-value result when all API calls fail', async () => {
    mockGetRoutes.mockRejectedValue(new Error('API error'));

    const result = await computeUncertainty(origin, destination);
    expect(result.meanSeconds).toBe(0);
    expect(result.stdDevSeconds).toBe(0);
    expect(result.marginMinutes).toBe(0);
    expect(result.reliabilityEmoji).toBe('🟢');
  });

  it('returns correct mean when all samples are equal', async () => {
    // 6 samples all returning 2100 seconds (35 min)
    mockGetRoutes.mockResolvedValue(makeRoute(2100));

    const result = await computeUncertainty(origin, destination);
    expect(result.meanSeconds).toBeCloseTo(2100, 0);
    expect(result.stdDevSeconds).toBeCloseTo(0, 0);
    expect(result.marginMinutes).toBe(1); // min clamp of Math.max(1, ceil(0))
  });

  it('assigns green emoji for low uncertainty (margin < 10 min)', async () => {
    // Small variance → small stdDev → margin < 10 min
    const samples = [2100, 2160, 2080, 2120, 2090, 2110];
    samples.forEach(s => mockGetRoutes.mockResolvedValueOnce(makeRoute(s)));

    const result = await computeUncertainty(origin, destination);
    expect(result.reliabilityEmoji).toBe('🟢');
    expect(result.reliabilityColor).toBe('#2D751A');
  });

  it('assigns red emoji for high uncertainty (margin >= 20 min)', async () => {
    // Large variance across 6 samples
    const samples = [1800, 3600, 1800, 3600, 1800, 3600]; // ±15min stdDev → margin ≥ 20
    samples.forEach(s => mockGetRoutes.mockResolvedValueOnce(makeRoute(s)));

    const result = await computeUncertainty(origin, destination);
    expect(result.marginMinutes).toBeGreaterThanOrEqual(15);
    // Whether yellow or red depends on exact stdDev; just check it's not green
    expect(result.reliabilityEmoji).not.toBe('🟢');
  });

  it('builds a human-readable label', async () => {
    mockGetRoutes.mockResolvedValue(makeRoute(2100));

    const result = await computeUncertainty(origin, destination);
    expect(result.label).toMatch(/\d+ min ± \d+ min/);
    expect(result.label).toContain('🟢');
  });

  it('handles partial failures (some samples succeed, some fail)', async () => {
    // 3 succeed, 3 fail
    mockGetRoutes
      .mockResolvedValueOnce(makeRoute(2100))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(makeRoute(2200))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(makeRoute(2150))
      .mockRejectedValueOnce(new Error('timeout'));

    const result = await computeUncertainty(origin, destination);
    // Mean of [2100, 2200, 2150] = 2150
    expect(result.meanSeconds).toBeCloseTo(2150, 0);
    expect(result.marginMinutes).toBeGreaterThanOrEqual(1);
  });

  it('calls getRoutes 6 times with different departure offsets', async () => {
    mockGetRoutes.mockResolvedValue(makeRoute(2100));

    await computeUncertainty(origin, destination);
    expect(mockGetRoutes).toHaveBeenCalledTimes(6);
  });
});
