import { createContext, useCallback, useEffect, useReducer } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { SABANA_LOCATIONS } from '@/constants/locations';
import { computeUncertainty } from '@/utils/uncertaintyService';
import { cancelNotification, scheduleNotification } from '@/utils/notificationsService';
import { PlannedTrip, PlanningState, planningReducer } from './PlanningReducer';

export interface AddTripParams {
  originId: string;
  destinationId: string;
  arrivalTime: string; // "HH:MM" 24-hour
  transport: string;
}

interface PlanningContextProps {
  state: PlanningState;
  addTrip: (params: AddTripParams) => Promise<void>;
  removeTrip: (tripId: string) => Promise<void>;
  loadTrips: () => Promise<void>;
}

export const PlanningContext = createContext({} as PlanningContextProps);

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(total, 23 * 60 + 59));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(planningReducer, { trips: [], loading: false });

  const loadTrips = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const q = query(
        collection(db, 'planned_trips'),
        where('userId', '==', uid),
        where('date', '==', todayString()),
      );
      const snap = await getDocs(q);
      const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlannedTrip));
      trips.sort((a, b) => timeToMinutes(a.arrivalTime) - timeToMinutes(b.arrivalTime));
      dispatch({ type: 'SET_TRIPS', payload: trips });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load trips when the auth user changes
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) loadTrips();
      else dispatch({ type: 'SET_TRIPS', payload: [] });
    });
    return unsub;
  }, [loadTrips]);

  const addTrip = useCallback(async (params: AddTripParams) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const origin = SABANA_LOCATIONS.find((l) => l.id === params.originId);
    const destination = SABANA_LOCATIONS.find((l) => l.id === params.destinationId);
    if (!origin || !destination) return;

    // Compute uncertainty from live Directions API samples
    const uncertainty = await computeUncertainty(origin.coordinate, destination.coordinate);

    // Suggested departure = arrivalTime - estimatedMinutes - marginMinutes (conservative buffer)
    const arrivalMinutes = timeToMinutes(params.arrivalTime);
    const buffer = Math.round(uncertainty.meanSeconds / 60) + uncertainty.marginMinutes;
    const departureMinutes = arrivalMinutes - buffer;
    const departureSuggested = minutesToTime(departureMinutes);

    // Notification fires 30 min before departure
    const today = todayString();
    const [year, month, day] = today.split('-').map(Number);
    const depH = Math.floor(Math.max(0, departureMinutes) / 60);
    const depM = Math.max(0, departureMinutes) % 60;
    const notifDate = new Date(year, month - 1, day, depH, depM, 0);
    notifDate.setMinutes(notifDate.getMinutes() - 30);

    const notificationId = await scheduleNotification({
      title: `🚗 Sale en 30 min — ${destination.label}`,
      body: `Tiempo estimado: ${uncertainty.label}\nSalida sugerida: ${departureSuggested.replace(':', 'h ')}`,
      scheduledAt: notifDate,
      data: { originId: params.originId, destinationId: params.destinationId },
    });

    const docRef = await addDoc(collection(db, 'planned_trips'), {
      userId: uid,
      originId: params.originId,
      originLabel: origin.label,
      destinationId: params.destinationId,
      destinationLabel: destination.label,
      arrivalTime: params.arrivalTime,
      departureSuggested,
      estimatedMinutes: Math.round(uncertainty.meanSeconds / 60),
      marginMinutes: uncertainty.marginMinutes,
      notificationId,
      date: today,
      transport: params.transport,
    });

    dispatch({
      type: 'ADD_TRIP',
      payload: {
        id: docRef.id,
        originId: params.originId,
        originLabel: origin.label,
        destinationId: params.destinationId,
        destinationLabel: destination.label,
        arrivalTime: params.arrivalTime,
        departureSuggested,
        estimatedMinutes: Math.round(uncertainty.meanSeconds / 60),
        marginMinutes: uncertainty.marginMinutes,
        notificationId,
        date: today,
        transport: params.transport,
      },
    });
  }, []);

  const removeTrip = useCallback(
    async (tripId: string) => {
      const trip = state.trips.find((t) => t.id === tripId);
      if (trip?.notificationId) {
        await cancelNotification(trip.notificationId);
      }
      await deleteDoc(doc(db, 'planned_trips', tripId));
      dispatch({ type: 'REMOVE_TRIP', payload: tripId });
    },
    [state.trips],
  );

  return (
    <PlanningContext.Provider value={{ state, addTrip, removeTrip, loadTrips }}>
      {children}
    </PlanningContext.Provider>
  );
}
