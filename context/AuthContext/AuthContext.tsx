import { createContext, useEffect, useReducer } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/utils/firebaseConfig';
import { authReducer } from './AuthReducer';

export interface AuthState {
  user?: any;
}

const authStateDefault: AuthState = {
  user: undefined,
};

interface AuthContextProps {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signInWithGoogle: (idToken: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser: any) => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, authStateDefault);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          dispatch({ type: 'login', payload: { ...user, ...userDoc.data() } });
        } else {
          dispatch({ type: 'login', payload: user });
        }
      } else {
        dispatch({ type: 'logout' });
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const docSnap = await getDoc(doc(db, 'Users', user.uid));
      if (docSnap.exists()) {
        dispatch({ type: 'login', payload: { ...user, ...docSnap.data() } });
      } else {
        dispatch({ type: 'login', payload: user });
      }
      return true;
    } catch (error: any) {
      console.log('signIn error:', error.message);
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const spaceIndex = fullName.trim().indexOf(' ');
      const firstname = spaceIndex === -1 ? fullName.trim() : fullName.slice(0, spaceIndex).trim();
      const lastname = spaceIndex === -1 ? '' : fullName.slice(spaceIndex + 1).trim();

      await setDoc(doc(db, 'Users', user.uid), {
        firstname,
        lastname,
        fullName: fullName.trim(),
        email,
      });

      dispatch({ type: 'login', payload: { uid: user.uid, email, firstname, lastname, fullName: fullName.trim() } });
      return true;
    } catch (error: any) {
      console.log('signUp error:', error.message);
      return false;
    }
  };

  const signInWithGoogle = async (idToken: string): Promise<boolean> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const { user } = await signInWithCredential(auth, credential);
      const docSnap = await getDoc(doc(db, 'Users', user.uid));
      if (docSnap.exists()) {
        dispatch({ type: 'login', payload: { ...user, ...docSnap.data() } });
      } else {
        const displayName = user.displayName ?? '';
        const spaceIdx = displayName.indexOf(' ');
        const firstname = spaceIdx === -1 ? displayName : displayName.slice(0, spaceIdx);
        const lastname = spaceIdx === -1 ? '' : displayName.slice(spaceIdx + 1);
        await setDoc(doc(db, 'Users', user.uid), {
          firstname,
          lastname,
          fullName: displayName,
          email: user.email ?? '',
        });
        dispatch({ type: 'login', payload: { ...user, firstname, lastname, fullName: displayName } });
      }
      return true;
    } catch (error: any) {
      console.log('signInWithGoogle error:', error.message);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    dispatch({ type: 'logout' });
  };

  const updateUser = async (updatedUser: any): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error('No hay usuario autenticado');
      await setDoc(doc(db, 'Users', auth.currentUser.uid), updatedUser, { merge: true });
      dispatch({ type: 'updateUser', payload: updatedUser });
    } catch (error) {
      console.error('updateUser error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signUp, signInWithGoogle, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
