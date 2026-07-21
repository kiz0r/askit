import { atom } from 'jotai';
import { type GameState, initialGameState } from './GameState';
import type { PlayerId } from './PlayerId';

export const gameStateAtom = atom<GameState>(initialGameState);

export const sessionPlayerIdAtom = atom<PlayerId | null>(null);
