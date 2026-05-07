import { atom } from 'jotai';
import type { Quiz } from './Quiz';
import type { QuizId } from './QuizId';

export const quizzesAtom = atom<ReadonlyMap<QuizId, Quiz>>(new Map());
export const isQuizzesLoadingAtom = atom<boolean>(false);
export const favoriteQuizIdsAtom = atom<ReadonlySet<QuizId>>(new Set<QuizId>());
