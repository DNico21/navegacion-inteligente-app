import { RouteState } from './RouteContext';

export type RouteAction =
  | { type: 'SET_ORIGIN'; payload: RouteState['origin'] }
  | { type: 'SET_DESTINATION'; payload: RouteState['destination'] }
  | { type: 'SET_ROUTES'; payload: RouteState['routes'] }
  | { type: 'SELECT_ROUTE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUGGESTION'; payload: string | null };

export function routeReducer(state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case 'SET_ORIGIN':
      return { ...state, origin: action.payload };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    case 'SET_ROUTES':
      return { ...state, routes: action.payload, loading: false, error: null };
    case 'SELECT_ROUTE':
      return { ...state, selectedRouteIndex: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SUGGESTION':
      return { ...state, suggestion: action.payload };
    default:
      return state;
  }
}
