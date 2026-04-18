import { atom } from 'jotai';
import { AuthState } from './AuthState';

export const authStateAtom = atom<AuthState>(AuthState.loading());

// Derived atoms for convenience
export const userAtom = atom((get) => {
  const auth = get(authStateAtom);
  return auth._tag === 'authenticated' ? auth.user : null;
});

export const isUserLoadingAtom = atom((get) => {
  const auth = get(authStateAtom);
  return auth._tag === 'loading';
});
