import { atom, createStore } from 'jotai';
import type { User } from './user/User';

export const store = createStore();

export const userAtom = atom<User | null>(null);
export const isUserLoadingAtom = atom<boolean>(true); // Start as true to wait for initial user check

