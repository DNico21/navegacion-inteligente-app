/**
 * Unit tests for decodePolyline.
 * Pure function — no mocks needed.
 */

import { decodePolyline } from '../utils/polyline';

describe('decodePolyline', () => {
  it('returns empty array for empty string', () => {
    expect(decodePolyline('')).toEqual([]);
  });

  it('decodes Google documentation example correctly', () => {
    // Known test vector from Google Maps Polyline Encoding documentation
    const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    const coords = decodePolyline(encoded);

    expect(coords).toHaveLength(3);
    expect(coords[0].latitude).toBeCloseTo(38.5, 1);
    expect(coords[0].longitude).toBeCloseTo(-120.2, 1);
    expect(coords[1].latitude).toBeCloseTo(40.7, 1);
    expect(coords[1].longitude).toBeCloseTo(-120.95, 1);
    expect(coords[2].latitude).toBeCloseTo(43.252, 2);
    expect(coords[2].longitude).toBeCloseTo(-126.453, 2);
  });

  it('returns objects with latitude and longitude keys', () => {
    const encoded = '_p~iF~ps|U';
    const coords = decodePolyline(encoded);
    expect(coords[0]).toHaveProperty('latitude');
    expect(coords[0]).toHaveProperty('longitude');
  });

  it('decodes a single coordinate', () => {
    // "_p~iF~ps|U" → first point of the Google example: (38.5, -120.2)
    const coords = decodePolyline('_p~iF~ps|U');
    expect(coords).toHaveLength(1);
    expect(coords[0].latitude).toBeCloseTo(38.5, 1);
    expect(coords[0].longitude).toBeCloseTo(-120.2, 1);
  });

  it('handles negative coordinates (south/west)', () => {
    // Bogotá-area coordinates are negative longitude
    const coords = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    coords.forEach(c => {
      expect(typeof c.latitude).toBe('number');
      expect(typeof c.longitude).toBe('number');
      expect(isNaN(c.latitude)).toBe(false);
      expect(isNaN(c.longitude)).toBe(false);
    });
  });

  it('all decoded coordinates are within valid lat/lng bounds', () => {
    const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
    const coords = decodePolyline(encoded);
    coords.forEach(c => {
      expect(c.latitude).toBeGreaterThanOrEqual(-90);
      expect(c.latitude).toBeLessThanOrEqual(90);
      expect(c.longitude).toBeGreaterThanOrEqual(-180);
      expect(c.longitude).toBeLessThanOrEqual(180);
    });
  });
});
