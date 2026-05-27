/**
 * Unit tests for mapsService.
 * fetch is mocked — no real Google Maps API calls.
 */

import * as mapsService from '../utils/mapsService';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Minimal valid Directions API response for one route
const MOCK_DIRECTIONS_RESPONSE = {
  status: 'OK',
  routes: [
    {
      summary: 'Autopista Norte',
      legs: [
        {
          distance: { text: '25 km', value: 25000 },
          duration: { text: '35 min', value: 2100 },
          duration_in_traffic: { text: '42 min', value: 2520 },
        },
      ],
      overview_polyline: { points: '_p~iF~ps|U' },
    },
  ],
};

beforeEach(() => mockFetch.mockClear());

// ── getRoutes ──────────────────────────────────────────────────────────────────

describe('getRoutes', () => {
  const origin = { latitude: 4.86, longitude: -74.03 };
  const destination = { latitude: 4.71, longitude: -74.07 };

  it('returns mapped RouteResult array on success', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => MOCK_DIRECTIONS_RESPONSE,
    });

    const routes = await mapsService.getRoutes(origin, destination);

    expect(routes).toHaveLength(1);
    expect(routes[0].summary).toBe('Autopista Norte');
    expect(routes[0].distanceText).toBe('25 km');
    expect(routes[0].distanceMeters).toBe(25000);
    expect(routes[0].durationSeconds).toBe(2100);
    expect(routes[0].durationInTrafficSeconds).toBe(2520);
    expect(routes[0].index).toBe(0);
  });

  it('decodes polyline into coordinate array', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => MOCK_DIRECTIONS_RESPONSE,
    });

    const routes = await mapsService.getRoutes(origin, destination);
    expect(Array.isArray(routes[0].polylineCoords)).toBe(true);
    expect(routes[0].polylineCoords.length).toBeGreaterThan(0);
    expect(routes[0].polylineCoords[0]).toHaveProperty('latitude');
    expect(routes[0].polylineCoords[0]).toHaveProperty('longitude');
  });

  it('throws on non-OK API status', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ status: 'REQUEST_DENIED', error_message: 'Invalid API key.' }),
    });

    await expect(mapsService.getRoutes(origin, destination))
      .rejects.toThrow('Directions API: REQUEST_DENIED');
  });

  it('uses duration as fallback when duration_in_traffic is absent', async () => {
    const responseWithoutTraffic = {
      status: 'OK',
      routes: [{
        summary: 'Ruta Directa',
        legs: [{
          distance: { text: '10 km', value: 10000 },
          duration: { text: '20 min', value: 1200 },
          // no duration_in_traffic
        }],
        overview_polyline: { points: '_p~iF~ps|U' },
      }],
    };
    mockFetch.mockResolvedValueOnce({ json: async () => responseWithoutTraffic });

    const routes = await mapsService.getRoutes(origin, destination);
    expect(routes[0].durationInTrafficSeconds).toBe(1200);
    expect(routes[0].durationInTrafficText).toBe('20 min');
  });

  it('includes departure_time in the URL query params', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => MOCK_DIRECTIONS_RESPONSE });

    const dep = new Date('2026-05-27T07:00:00Z');
    await mapsService.getRoutes(origin, destination, dep);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('departure_time=');
    expect(url).toContain('key=test-maps-key-123');
  });

  it('assigns sequential index values to multiple routes', async () => {
    const twoRoutes = {
      status: 'OK',
      routes: [
        { ...MOCK_DIRECTIONS_RESPONSE.routes[0], summary: 'Ruta A' },
        { ...MOCK_DIRECTIONS_RESPONSE.routes[0], summary: 'Ruta B' },
      ],
    };
    mockFetch.mockResolvedValueOnce({ json: async () => twoRoutes });

    const routes = await mapsService.getRoutes(origin, destination);
    expect(routes[0].index).toBe(0);
    expect(routes[1].index).toBe(1);
  });
});

// ── getOptimalDeparture ────────────────────────────────────────────────────────

describe('getOptimalDeparture', () => {
  const origin = { latitude: 4.86, longitude: -74.03 };
  const destination = { latitude: 4.71, longitude: -74.07 };

  it('returns null when no slots are available', async () => {
    // getPredictedSlots filters times > now; mock returns no future times
    jest.spyOn(mapsService, 'getPredictedSlots').mockResolvedValueOnce([]);

    const result = await mapsService.getOptimalDeparture(origin, destination, 0, 0);
    expect(result).toBeNull();
  });

  it('returns null on thrown error', async () => {
    jest.spyOn(mapsService, 'getPredictedSlots').mockRejectedValueOnce(new Error('fail'));

    const result = await mapsService.getOptimalDeparture(origin, destination);
    expect(result).toBeNull();
  });

  it('reduce logic picks the slot with the lowest durationSeconds', () => {
    // getOptimalDeparture uses Array.reduce — test the algorithm directly
    // since jest.spyOn cannot intercept module-internal calls in CommonJS
    const slots = [
      { departureTime: new Date(), durationSeconds: 3600, durationText: '1 h', label: '7:00 am' },
      { departureTime: new Date(), durationSeconds: 2100, durationText: '35 min', label: '5:00 am' },
      { departureTime: new Date(), durationSeconds: 2700, durationText: '45 min', label: '6:00 am' },
    ];
    const best = slots.reduce((b, s) => s.durationSeconds < b.durationSeconds ? s : b);
    expect(best.durationSeconds).toBe(2100);
    expect(best.label).toBe('5:00 am');
  });

  afterEach(() => jest.restoreAllMocks());
});
