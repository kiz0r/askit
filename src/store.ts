import { atom, createStore } from 'jotai';
import type { Quiz } from './quiz/Quiz';
import type { QuizId } from './quiz/QuizId';
import type { User } from './user/User';

export const store = createStore();

export const userAtom = atom<User | null>(null);
export const isUserLoadingAtom = atom<boolean>(true); // Start as true to wait for initial user check

export const quizzesAtom = atom<ReadonlyMap<QuizId, Quiz>>(new Map());
export const isQuizzesLoadingAtom = atom<boolean>(false);
