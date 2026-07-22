import { Duration } from 'effect';
import { UserId } from '@/entities/user';
import type { PlayerId } from './PlayerId';
import { SessionId } from './SessionId';
import type { WsAnswerResult } from './WsAnswerResult';
import type { WsHostAnswerUpdate } from './WsHostAnswerUpdate';
import type { WsLeaderboardEntry } from './WsLeaderboardEntry';
import type { WsPlayer } from './WsPlayer';
import type { WsQuestion } from './WsQuestion';
import type { WsQuestionEnded } from './WsQuestionEnded';

export type HostAnswerDetail = Pick<
  WsHostAnswerUpdate,
  'playerId' | 'nickname' | 'isCorrect' | 'totalScore'
>;

/**
 * Type representing a game status
 */
export type GameStatus = 'connecting' | 'lobby' | 'starting' | 'question' | 'finished' | 'error';

/**
 * Type representing the game state
 */
export type GameState = {
  readonly status: GameStatus;
  readonly roomCode: string;
  readonly sessionId: SessionId;
  readonly hostId: UserId;
  readonly quizTitle: string;
  readonly totalQuestions: number;
  readonly currentQuestionIndex: number;
  readonly players: readonly WsPlayer[];
  readonly answeredPlayerIds: readonly PlayerId[]; // IDs of players who answered the current question
  readonly hostAnswerDetails: readonly HostAnswerDetail[]; // Per-player answer details (populated for host only)
  readonly currentQuestion: WsQuestion | null; // Active question (populated from 'question' message)
  readonly answerResult: WsAnswerResult | null; // Immediate feedback after answering
  readonly questionEnded: WsQuestionEnded | null; // After question ends
  readonly finalLeaderboard: readonly WsLeaderboardEntry[];
  readonly publicResults: boolean; // Whether the final leaderboard is shown to every player
  readonly duration: Duration.Duration;
  readonly countdownDuration: Duration.Duration;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
};

/**
 * The initial game state
 */
export const initialGameState = {
  status: 'connecting',
  roomCode: '',
  sessionId: SessionId(''),
  hostId: UserId(''),
  quizTitle: '',
  totalQuestions: 0,
  currentQuestionIndex: 0,
  players: [],
  answeredPlayerIds: [],
  hostAnswerDetails: [],
  currentQuestion: null,
  answerResult: null,
  questionEnded: null,
  finalLeaderboard: [],
  publicResults: true,
  duration: Duration.zero,
  countdownDuration: Duration.zero,
  errorCode: null,
  errorMessage: null,
} as const satisfies GameState;
