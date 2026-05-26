import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export interface ScheduleNotificationParams {
  title: string;
  body: string;
  scheduledAt: Date;
  data?: Record<string, unknown>;
}

export async function scheduleNotification(
  params: ScheduleNotificationParams,
): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;
  if (params.scheduledAt <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.scheduledAt,
    },
  });
  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
