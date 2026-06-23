// auth.tsx — kontext přihlášení učitele (Google / Firebase Auth).
//
// Po přihlášení založí/aktualizuje profil v users/{uid} (§8 MEMORY.md).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface AuthState {
  /** undefined = ještě se zjišťuje, null = nepřihlášen. */
  user: User | null | undefined;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Zapíše/aktualizuje profil učitele po přihlášení. */
async function upsertUserProfile(user: User): Promise<void> {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) void upsertUserProfile(u);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      async signIn() {
        await signInWithPopup(auth, googleProvider);
      },
      async signOut() {
        await fbSignOut(auth);
      },
    }),
    [user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musí být uvnitř <AuthProvider>');
  return ctx;
}
