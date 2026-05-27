/**
 * Unit tests for notificationsService.
 * expo-notifications is fully mocked.
 */

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleNotification,
  cancelNotification,
} from '../utils/notificationsService';

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// ── requestNotificationPermissions ────────────────────────────────────────────

describe('requestNotificationPermissions', () => {
  it('returns true when permission is already granted', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    expect(await requestNotificationPermissions()).toBe(true);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('requests permission when not yet granted and returns true if approved', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' });
    expect(await requestNotificationPermissions()).toBe(true);
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
  });

  it('returns false when user denies permission', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'denied' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });
    expect(await requestNotificationPermissions()).toBe(false);
  });
});

// ── scheduleNotification ──────────────────────────────────────────────────────

describe('scheduleNotification', () => {
  it('returns null when permission is denied', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'denied' });
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });

    const future = new Date(Date.now() + 60_000);
    const id = await scheduleNotification({
      title: 'Test', body: 'Cuerpo', scheduledAt: future,
    });
    expect(id).toBeNull();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('returns null when scheduledAt is in the past', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });

    const past = new Date(Date.now() - 60_000);
    const id = await scheduleNotification({
      title: 'Test', body: 'Cuerpo', scheduledAt: past,
    });
    expect(id).toBeNull();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('schedules and returns notification ID for future date', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockSchedule.mockResolvedValueOnce('notif-id-abc');

    const future = new Date(Date.now() + 60_000);
    const id = await scheduleNotification({
      title: '🚗 Sale en 30 min', body: 'Tiempo estimado: 42 min', scheduledAt: future,
    });
    expect(id).toBe('notif-id-abc');
    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  it('passes title, body and date to expo-notifications', async () => {
    mockGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockSchedule.mockResolvedValueOnce('notif-xyz');

    const future = new Date(Date.now() + 120_000);
    await scheduleNotification({
      title: 'Salida', body: 'Prepárate', scheduledAt: future, data: { tripId: '1' },
    });

    const call = mockSchedule.mock.calls[0][0];
    expect(call.content.title).toBe('Salida');
    expect(call.content.body).toBe('Prepárate');
    expect(call.content.data).toEqual({ tripId: '1' });
    expect(call.trigger.date).toEqual(future);
  });
});

// ── cancelNotification ────────────────────────────────────────────────────────

describe('cancelNotification', () => {
  it('calls cancelScheduledNotificationAsync with the given ID', async () => {
    mockCancel.mockResolvedValueOnce(undefined);
    await cancelNotification('notif-id-to-cancel');
    expect(mockCancel).toHaveBeenCalledWith('notif-id-to-cancel');
  });
});
