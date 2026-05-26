export interface PlannedTrip {
  id: string;
  originId: string;
  originLabel: string;
  destinationId: string;
  destinationLabel: string;
  arrivalTime: string;        // "HH:MM" 24-hour
  departureSuggested: string; // "HH:MM" 24-hour
  estimatedMinutes: number;
  marginMinutes: number;
  notificationId: string | null;
  date: string;               // "YYYY-MM-DD"
  transport: string;
}

export interface PlanningState {
  trips: PlannedTrip[];
  loading: boolean;
}

type PlanningAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRIPS'; payload: PlannedTrip[] }
  | { type: 'ADD_TRIP'; payload: PlannedTrip }
  | { type: 'REMOVE_TRIP'; payload: string };

export function planningReducer(state: PlanningState, action: PlanningAction): PlanningState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'REMOVE_TRIP':
      return { ...state, trips: state.trips.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}
