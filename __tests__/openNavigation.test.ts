/**
 * Unit tests for openNavigation.
 * Mocks react-native Linking to avoid opening real URLs.
 */

import { Linking, Platform } from 'react-native';
import { openNavigation } from '../utils/openNavigation';

const mockOpenURL = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  mockOpenURL.mockClear();
  jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);
});

afterEach(() => jest.restoreAllMocks());

describe('openNavigation', () => {
  it('calls Linking.openURL exactly once', async () => {
    await openNavigation({ latitude: 4.71, longitude: -74.07 }, 'Universidad');
    expect(mockOpenURL).toHaveBeenCalledTimes(1);
  });

  it('URL contains the destination coordinates', async () => {
    await openNavigation({ latitude: 4.86, longitude: -74.03 }, 'Chía');
    const url = mockOpenURL.mock.calls[0][0] as string;
    expect(url).toContain('4.86');
    expect(url).toContain('-74.03');
  });

  it('uses geo: scheme on Android', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });

    await openNavigation({ latitude: 4.71, longitude: -74.07 }, 'Cajicá');
    const url = mockOpenURL.mock.calls[0][0] as string;
    expect(url).toMatch(/^geo:/);
  });

  it('uses maps:// scheme on iOS', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });

    await openNavigation({ latitude: 4.71, longitude: -74.07 }, 'Cajicá');
    const url = mockOpenURL.mock.calls[0][0] as string;
    expect(url).toMatch(/^maps:\/\//);
  });

  it('encodes special characters in the label', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });

    await openNavigation({ latitude: 4.71, longitude: -74.07 }, 'Universidad & Café');
    const url = mockOpenURL.mock.calls[0][0] as string;
    // encodeURIComponent encodes '&' as '%26' and space as '%20'
    expect(url).not.toContain('Universidad & Café');
    expect(url).toContain('Universidad');
  });
});
