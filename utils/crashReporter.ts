import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

async function logCrash(error: Error, isFatal: boolean): Promise<void> {
  try {
    await addDoc(collection(db, 'app_errors'), {
      message: error.message,
      stack: error.stack ?? null,
      isFatal,
      userId: auth.currentUser?.uid ?? null,
      timestamp: serverTimestamp(),
    });
  } catch {
    // last-resort logging; nothing else we can do
  }
}

export function initCrashReporter(): void {
  const prevHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    logCrash(error, isFatal ?? false);
    prevHandler(error, isFatal);
  });
}
