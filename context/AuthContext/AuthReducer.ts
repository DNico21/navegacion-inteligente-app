import { AuthState } from './AuthContext';

type AuthAction =
  | { type: 'login'; payload: any }
  | { type: 'logout' }
  | { type: 'updateUser'; payload: any };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'login':
      return { ...state, user: action.payload };
    case 'logout':
      return { ...state, user: undefined };
    case 'updateUser':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}
