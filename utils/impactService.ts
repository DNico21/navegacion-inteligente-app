import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

export interface ImpactMetrics {
  timeSavedMin: number;
  co2SavedKg: number;
  safetyPercent: number;
  totalTrips: number;
}

const EMPTY: ImpactMetrics = {
  timeSavedMin: 0,
  co2SavedKg: 0,
  safetyPercent: 0,
  totalTrips: 0,
};

/**
 * Fetches all planned trips for the current user and calculates
 * cumulative triple-impact metrics:
 *
 *  - CO₂: marginMinutes × 0.06 kg  (30 km/h avg × 0.12 kg CO₂/km ÷ 60 min)
 *  - Time saved: total marginMinutes across all trips
 *  - Safety: % of trips with marginMinutes ≤ 10 (predictable, low-stress routes)
 */
export async function fetchCumulativeImpact(): Promise<ImpactMetrics> {
  const uid = auth.currentUser?.uid;
  if (!uid) return EMPTY;

  try {
    const snap = await getDocs(
      query(collection(db, 'planned_trips'), where('userId', '==', uid))
    );

    if (snap.empty) return EMPTY;

    const trips = snap.docs.map(d => d.data());
    const totalMarginMin = trips.reduce((s, t) => s + (t.marginMinutes ?? 0), 0);
    const predictable = trips.filter(t => (t.marginMinutes ?? 99) <= 10).length;

    return {
      timeSavedMin: totalMarginMin,
      co2SavedKg: Math.round(totalMarginMin * 0.06 * 10) / 10,
      safetyPercent: Math.round((predictable / trips.length) * 100),
      totalTrips: trips.length,
    };
  } catch {
    return EMPTY;
  }
}
