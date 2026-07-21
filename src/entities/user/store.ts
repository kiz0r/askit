import { atom } from 'jotai';
import { AuthState } from './AuthState';

export const authStateAtom = atom<AuthState>(AuthState.loading());

// Derived atoms for convenience
export const userAtom = atom((get) => {
  const authState = get(authStateAtom);
  return authState._tag === 'authenticated' ? authState.user : null;
});
