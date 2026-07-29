import { Duration, Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { type GameState, initialGameState } from '@/entities/game';
import { type ServerMessage, ServerMessageSchema } from './ServerMessage';
import { applyMessage } from './useGameSocket';
import { applyHostMessage } from './useHostSocket';

/**
 * The reducer is the whole client-side game: every screen renders from the state
 * it produces. Frames are written in wire format and decoded, so a test failure
 * means either the fold or the contract broke, which are the two ways the game
 * screen can go wrong without anything throwing.
 */
const decode = Schema.decodeUnknownSync(ServerMessageSchema);

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const HOST_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const P1 = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const P2 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
const QUESTION_ID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const ANSWER_ID = '6ba7b813-9dad-11d1-80b4-00c04fd430c8';

const p1 = { playerId: P1, nickname: 'p1', score: 0, isConnected: true };
const p2 = { playerId: P2, nickname: 'p2', score: 0, isConnected: true };

const roomState = (status: string, players: unknown[] = [p1]) =>
  decode({
    type: 'room_state',
    payload: {
      sessionId: SESSION_ID,
      roomCode: 'ABC123',
      status,
      hostId: HOST_ID,
      players,
      quizTitle: 'Quiz',
      totalQuestions: 2,
      currentQuestionIndex: 0,
      currentQuestion: null,
      hostAnswerDetails: [],
      questionEnded: null,
    },
  });

const questionFrame = decode({
  type: 'question',
  payload: {
    questionIndex: 1,
    totalQuestions: 2,
    questionId: QUESTION_ID,
    text: '2 + 2?',
    answers: [{ answerId: ANSWER_ID, text: '4' }],
    timeLimitMs: 30000,
    startedAt: '2026-07-29T10:00:00',
    allowMultipleAnswers: false,
  },
});

const fold = (
  reducer: (s: GameState, m: ServerMessage) => GameState,
  messages: readonly ServerMessage[],
  from: GameState = initialGameState
) => messages.reduce(reducer, from);

describe('applyMessage (player)', () => {
  it('drives a whole game from lobby to results', () => {
    const state = fold(applyMessage, [
      roomState('waiting'),
      decode({ type: 'game_starting', payload: { countdownMs: 3000, totalQuestions: 2 } }),
      questionFrame,
      decode({
        type: 'answer_result',
        payload: {
          isCorrect: true,
          correctAnswerIds: [ANSWER_ID],
          pointsEarned: 900,
          timeTakenMs: 1200,
        },
      }),
      decode({
        type: 'question_ended',
        payload: {
          questionId: QUESTION_ID,
          correctAnswerIds: [ANSWER_ID],
          answerDistribution: { [ANSWER_ID]: 1 },
          leaderboard: [{ rank: 1, playerId: P1, nickname: 'p1', score: 900, change: 0 }],
        },
      }),
      decode({
        type: 'game_finished',
        payload: {
          finalLeaderboard: [{ rank: 1, playerId: P1, nickname: 'p1', score: 900, change: 0 }],
          totalQuestions: 2,
          durationMs: 60000,
          publicResults: true,
        },
      }),
    ]);

    expect(state.status).toBe('finished');
    expect(state.roomCode).toBe('ABC123');
    expect(state.answerResult?.pointsEarned).toBe(900);
    expect(state.questionEnded?.correctAnswerIds).toEqual([ANSWER_ID]);
    expect(state.finalLeaderboard).toHaveLength(1);
    expect(Duration.toMillis(state.duration)).toBe(60000);
  });

  it('reconnecting into the countdown yields the starting screen', () => {
    // The status the server sends here used to decode to nothing, which left a
    // reconnecting client stuck on the previous screen.
    expect(fold(applyMessage, [roomState('starting')]).status).toBe('starting');
  });

  it('folds revealing into the question screen', () => {
    expect(fold(applyMessage, [roomState('revealing')]).status).toBe('question');
  });

  it('clears the previous question when a new one arrives', () => {
    // Build the stale state through the reducer itself, so the test starts from
    // a state the client can actually be in.
    const midGame = fold(applyMessage, [
      roomState('waiting'),
      questionFrame,
      decode({ type: 'player_answered', payload: { playerId: P1 } }),
      decode({
        type: 'answer_result',
        payload: {
          isCorrect: true,
          correctAnswerIds: [ANSWER_ID],
          pointsEarned: 900,
          timeTakenMs: 10,
        },
      }),
      decode({
        type: 'question_ended',
        payload: {
          questionId: QUESTION_ID,
          correctAnswerIds: [ANSWER_ID],
          answerDistribution: { [ANSWER_ID]: 1 },
          leaderboard: [],
        },
      }),
    ]);
    expect(midGame.answerResult).not.toBeNull();
    expect(midGame.answeredPlayerIds).toHaveLength(1);

    const next = applyMessage(
      midGame,
      decode({
        type: 'question',
        payload: {
          questionIndex: 2,
          totalQuestions: 2,
          questionId: QUESTION_ID,
          text: '3 + 3?',
          answers: [{ answerId: ANSWER_ID, text: '6' }],
          timeLimitMs: 30000,
          startedAt: '2026-07-29T10:01:00',
          allowMultipleAnswers: false,
        },
      })
    );

    expect(next.answerResult).toBeNull();
    expect(next.questionEnded).toBeNull();
    expect(next.answeredPlayerIds).toEqual([]);
    expect(next.hostAnswerDetails).toEqual([]);
    expect(next.currentQuestionIndex).toBe(2);
  });

  it('marks a player as disconnected instead of dropping them', () => {
    const state = fold(applyMessage, [
      roomState('waiting', [p1, p2]),
      decode({ type: 'player_left', payload: { playerId: P2, nickname: 'p2' } }),
    ]);

    expect(state.players).toHaveLength(2);
    expect(state.players.find((p) => p.playerId === P2)?.isConnected).toBe(false);
  });

  it('ignores the host-only answer feed', () => {
    const before = fold(applyMessage, [roomState('waiting')]);
    const after = applyMessage(
      before,
      decode({
        type: 'host_answer_update',
        payload: {
          playerId: P1,
          nickname: 'p1',
          isCorrect: true,
          answerIds: [ANSWER_ID],
          timeTakenMs: 900,
          totalScore: 900,
        },
      })
    );

    expect(after).toBe(before);
  });

  it('surfaces a server error as the error status', () => {
    const state = fold(applyMessage, [
      decode({ type: 'error', payload: { code: 'ALREADY_ANSWERED', message: 'nope' } }),
    ]);

    expect(state.status).toBe('error');
    expect(state.errorCode).toBe('ALREADY_ANSWERED');
  });
});

describe('applyHostMessage (host)', () => {
  it('records the answer feed and updates the player score', () => {
    const state = fold(applyHostMessage, [
      roomState('waiting', [p1, p2]),
      decode({
        type: 'host_answer_update',
        payload: {
          playerId: P1,
          nickname: 'p1',
          isCorrect: true,
          answerIds: [ANSWER_ID],
          timeTakenMs: 900,
          totalScore: 900,
        },
      }),
    ]);

    expect(state.hostAnswerDetails).toEqual([
      { playerId: P1, nickname: 'p1', isCorrect: true, totalScore: 900 },
    ]);
    expect(state.players.find((p) => p.playerId === P1)?.score).toBe(900);
    expect(state.players.find((p) => p.playerId === P2)?.score).toBe(0);
  });
});
