import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

export type AnalyticsEventName =
  | 'screen_view'
  | 'login'
  | 'register'
  | 'route_search'
  | 'trip_planned'
  | 'mood_checkin'
  | 'breathing_started'
  | 'wellness_opened'
  | 'zen_chat_opened';

export async function logEvent(
  name: AnalyticsEventName,
  params: Record<string, string | number | boolean> = {},
): Promise<void> {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      event: name,
      userId: auth.currentUser?.uid ?? null,
      params,
      timestamp: serverTimestamp(),
    });
  } catch {
    // analytics failures are non-critical; swallow silently
  }
}
