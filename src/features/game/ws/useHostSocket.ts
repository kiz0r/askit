import { Effect, Fiber, Stream } from 'effect';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { gameStateAtom } from '@/entities/game';
import type { GameState } from '@/entities/game/GameState';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import type { ClientMessage } from './ClientMessage';
import { makeHostSocket } from './GameSocket';
import { roomStatusToGameStatus } from './roomStatusToGameStatus';
import type { ServerMessage } from './ServerMessage';

function applyHostMessage(prevState: GameState, message: ServerMessage): GameState {
  switch (message.type) {
    case 'room_state':
      return {
        ...prevState,
        status: roomStatusToGameStatus(message.payload.status, prevState.status),
        roomCode: message.payload.roomCode,
        sessionId: message.payload.sessionId,
        hostId: message.payload.hostId,
        quizTitle: message.payload.quizTitle,
        totalQuestions: message.payload.totalQuestions,
        currentQuestionIndex: message.payload.currentQuestionIndex,
        players: message.payload.players,
        currentQuestion: message.payload.currentQuestion ?? null,
        answeredPlayerIds: message.payload.hostAnswerDetails.map((detail) => detail.playerId),
        hostAnswerDetails: message.payload.hostAnswerDetails.map((detail) => ({
          playerId: detail.playerId,
          nickname: detail.nickname,
          isCorrect: detail.isCorrect,
          totalScore: detail.totalScore,
        })),
        questionEnded: message.payload.questionEnded ?? null,
      };

    case 'player_joined':
      return {
        ...prevState,
        players: [...prevState.players, message.payload.player],
      };

    case 'player_left':
      return {
        ...prevState,
        players: prevState.players.map((player) =>
          player.playerId === message.payload.playerId ? { ...player, isConnected: false } : player
        ),
      };

    case 'game_starting':
      return {
        ...prevState,
        status: 'starting',
        countdownDuration: message.payload.countdownMs,
        totalQuestions: message.payload.totalQuestions,
      };

    case 'question':
      return {
        ...prevState,
        status: 'question',
        currentQuestion: message.payload,
        currentQuestionIndex: message.payload.questionIndex,
        answerResult: null,
        questionEnded: null,
        answeredPlayerIds: [],
        hostAnswerDetails: [],
      };

    case 'answer_result':
      return prevState; // host doesn't submit answers

    case 'player_answered':
      return {
        ...prevState,
        answeredPlayerIds: [...prevState.answeredPlayerIds, message.payload.playerId],
      };

    case 'host_answer_update':
      return {
        ...prevState,
        players: prevState.players.map((player) => {
          if (player.playerId !== message.payload.playerId) {
            return player;
          }

          return { ...player, score: message.payload.totalScore };
        }),
        hostAnswerDetails: [
          ...prevState.hostAnswerDetails,
          {
            playerId: message.payload.playerId,
            nickname: message.payload.nickname,
            isCorrect: message.payload.isCorrect,
            totalScore: message.payload.totalScore,
          },
        ],
      };

    case 'question_ended':
      return { ...prevState, questionEnded: message.payload };

    case 'game_finished':
      return {
        ...prevState,
        status: 'finished',
        finalLeaderboard: message.payload.finalLeaderboard,
        publicResults: message.payload.publicResults,
        duration: message.payload.durationMs,
      };

    case 'error':
      return {
        ...prevState,
        status: 'error',
        errorCode: message.payload.code,
        errorMessage: message.payload.message,
      };

    default: {
      const _exhaustive: never = message;
      return prevState;
    }
  }
}

/**
 * Connects to the game WebSocket for `roomCode` as the host.
 *
 * Authenticates via access_token cookie — no player_id required.
 * Returns a stable `send` callback for sending host commands (start_game, next_question).
 */
export function useHostSocket(roomCode: string): {
  readonly send: (msg: ClientMessage) => void;
} {
  const setGameState = useSetAtom(gameStateAtom);
  const sendRef = React.useRef<(msg: ClientMessage) => void>(() => {});

  React.useEffect(() => {
    const program = Effect.gen(function* () {
      const { stream, send } = yield* makeHostSocket(roomCode);
      sendRef.current = send;

      yield* stream.pipe(
        Stream.runForEach((msg) =>
          Effect.sync(() => {
            if (msg.type === 'error') {
              Toast.danger({
                title: 'Game error',
                description: msg.payload.message,
              });
            }
            setGameState((prev) => applyHostMessage(prev, msg));
          })
        )
      );
    }).pipe(Effect.provide(applicationLayer));

    const fiber = Effect.runFork(program);

    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
  }, [roomCode, setGameState]);

  const send = React.useCallback((msg: ClientMessage) => sendRef.current(msg), []);

  return { send };
}
