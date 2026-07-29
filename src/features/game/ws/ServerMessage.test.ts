import { Either, Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { ServerMessageSchema } from './ServerMessage';

const decode = Schema.decodeUnknownEither(ServerMessageSchema);

/**
 * Frames exactly as the backend serialises them, camelCased by the Pydantic
 * aliases. These are the contract: if the server ever renames or drops a field,
 * decoding fails here rather than silently dropping the frame at runtime, which
 * is how a stale `room_state` union went unnoticed before.
 */
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const HOST_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const PLAYER_ID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const QUESTION_ID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const ANSWER_ID = '6ba7b813-9dad-11d1-80b4-00c04fd430c8';

const player = {
  playerId: PLAYER_ID,
  nickname: 'p1',
  score: 0,
  isConnected: true,
};

const question = {
  questionIndex: 1,
  totalQuestions: 3,
  questionId: QUESTION_ID,
  text: '2 + 2?',
  answers: [{ answerId: ANSWER_ID, text: '4' }],
  timeLimitMs: 30000,
  startedAt: '2026-07-29T10:00:00',
  allowMultipleAnswers: false,
};

describe('ServerMessageSchema', () => {
  it.each([['waiting'], ['starting'], ['question'], ['revealing'], ['finished']])(
    'accepts room_state in %s status',
    (status) => {
      const frame = {
        type: 'room_state',
        payload: {
          sessionId: SESSION_ID,
          roomCode: 'ABC123',
          status,
          hostId: HOST_ID,
          players: [player],
          quizTitle: 'Quiz',
          totalQuestions: 3,
          currentQuestionIndex: 0,
          currentQuestion: null,
          hostAnswerDetails: [],
          questionEnded: null,
        },
      };

      expect(Either.isRight(decode(frame))).toBe(true);
    }
  );

  it('rejects a status the server never sends', () => {
    const frame = {
      type: 'room_state',
      payload: {
        sessionId: SESSION_ID,
        roomCode: 'ABC123',
        status: 'in_progress',
        hostId: HOST_ID,
        players: [],
        quizTitle: 'Quiz',
        totalQuestions: 3,
        currentQuestionIndex: 0,
      },
    };

    expect(Either.isLeft(decode(frame))).toBe(true);
  });

  it('defaults the optional room_state fields a player never receives', () => {
    const frame = {
      type: 'room_state',
      payload: {
        sessionId: SESSION_ID,
        roomCode: 'ABC123',
        status: 'waiting',
        hostId: HOST_ID,
        players: [],
        quizTitle: 'Quiz',
        totalQuestions: 3,
        currentQuestionIndex: 0,
      },
    };

    const decoded = decode(frame);
    expect(Either.isRight(decoded)).toBe(true);
    if (Either.isRight(decoded) && decoded.right.type === 'room_state') {
      expect(decoded.right.payload.hostAnswerDetails).toEqual([]);
    }
  });

  it('accepts a question without any correctness marker', () => {
    const decoded = decode({ type: 'question', payload: question });
    expect(Either.isRight(decoded)).toBe(true);
    if (Either.isRight(decoded) && decoded.right.type === 'question') {
      expect(decoded.right.payload.answers[0]).not.toHaveProperty('isCorrect');
    }
  });

  it('accepts game_finished and defaults publicResults', () => {
    const decoded = decode({
      type: 'game_finished',
      payload: {
        finalLeaderboard: [{ rank: 1, playerId: PLAYER_ID, nickname: 'p1', score: 900, change: 0 }],
        totalQuestions: 3,
        durationMs: 60000,
      },
    });

    expect(Either.isRight(decoded)).toBe(true);
    if (Either.isRight(decoded) && decoded.right.type === 'game_finished') {
      expect(decoded.right.payload.publicResults).toBe(true);
    }
  });

  it('rejects a frame of an unknown type', () => {
    expect(Either.isLeft(decode({ type: 'leaderboard', payload: {} }))).toBe(true);
  });
});
