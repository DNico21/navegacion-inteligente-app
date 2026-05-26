import { createContext, useReducer, useCallback } from 'react';
import { RouteResult, getRoutes, getOptimalDeparture } from '@/utils/mapsService';
import { LocationPoint, DEFAULT_ORIGIN, DEFAULT_DESTINATION } from '@/constants/locations';
import { routeReducer } from './RouteReducer';

export interface RouteState {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteResult[];
  selectedRouteIndex: number;
  loading: boolean;
  error: string | null;
  suggestion: string | null;
}

const routeStateDefault: RouteState = {
  origin: DEFAULT_ORIGIN,
  destination: DEFAULT_DESTINATION,
  routes: [],
  selectedRouteIndex: 0,
  loading: false,
  error: null,
  suggestion: null,
};

interface RouteContextProps {
  state: RouteState;
  selectedRoute: RouteResult | null;
  setOrigin: (point: LocationPoint) => void;
  setDestination: (point: LocationPoint) => void;
  selectRoute: (index: number) => void;
  fetchRoutes: (departureTime?: Date) => Promise<void>;
}

export const RouteContext = createContext({} as RouteContextProps);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(routeReducer, routeStateDefault);

  const setOrigin = useCallback((point: LocationPoint) => {
    dispatch({ type: 'SET_ORIGIN', payload: point });
  }, []);

  const setDestination = useCallback((point: LocationPoint) => {
    dispatch({ type: 'SET_DESTINATION', payload: point });
  }, []);

  const selectRoute = useCallback((index: number) => {
    dispatch({ type: 'SELECT_ROUTE', payload: index });
  }, []);

  const fetchRoutes = useCallback(async (departureTime: Date = new Date()) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const routes = await getRoutes(
        state.origin.coordinate,
        state.destination.coordinate,
        departureTime
      );
      dispatch({ type: 'SET_ROUTES', payload: routes });

      // Calcula la sugerencia de horario óptimo en paralelo
      getOptimalDeparture(
        state.origin.coordinate,
        state.destination.coordinate,
        5, 9
      ).then((optimal) => {
        if (optimal && routes[0]) {
          const saving = Math.round(
            (routes[0].durationInTrafficSeconds - optimal.durationSeconds) / 60
          );
          if (saving > 3) {
            dispatch({
              type: 'SET_SUGGESTION',
              payload: `Sale a las ${optimal.label} para ahorrar ~${saving} min y evitar el mayor congestionamiento.`,
            });
          } else {
            dispatch({ type: 'SET_SUGGESTION', payload: null });
          }
        }
      });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [state.origin, state.destination]);

  const selectedRoute = state.routes[state.selectedRouteIndex] ?? null;

  return (
    <RouteContext.Provider value={{ state, selectedRoute, setOrigin, setDestination, selectRoute, fetchRoutes }}>
      {children}
    </RouteContext.Provider>
  );
}
