import { Effect, Fiber, Queue } from 'effect';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { gameStateAtom } from '@/entities/game';
import type { GameState } from '@/entities/game/GameState';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import type { ClientMessage } from './ClientMessage';
import { makeGameSocket } from './GameSocket';
import { roomStatusToGameStatus } from './roomStatusToGameStatus';
import type { ServerMessage } from './ServerMessage';

function applyMessage(prevState: GameState, message: ServerMessage): GameState {
  switch (message.type) {
    case 'room_state': {
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
        questionEnded: message.payload.questionEnded ?? null,
      };
    }

    case 'player_joined': {
      return {
        ...prevState,
        players: [...prevState.players, message.payload.player],
      };
    }

    case 'player_left': {
      return {
        ...prevState,
        players: prevState.players.map((player) =>
          player.playerId === message.payload.playerId ? { ...player, isConnected: false } : player
        ),
      };
    }

    case 'game_starting': {
      return {
        ...prevState,
        status: 'starting',
        countdownDuration: message.payload.countdownMs,
        totalQuestions: message.payload.totalQuestions,
      };
    }

    case 'question': {
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
    }

    case 'answer_result': {
      return {
        ...prevState,
        answerResult: message.payload,
      };
    }

    case 'player_answered': {
      return {
        ...prevState,
        answeredPlayerIds: [...prevState.answeredPlayerIds, message.payload.playerId],
      };
    }

    case 'question_ended': {
      return { ...prevState, questionEnded: message.payload };
    }

    case 'game_finished': {
      return {
        ...prevState,
        status: 'finished',
        finalLeaderboard: message.payload.finalLeaderboard,
        publicResults: message.payload.publicResults,
        duration: message.payload.durationMs,
      };
    }

    case 'error': {
      return {
        ...prevState,
        status: 'error',
        errorCode: message.payload.code,
        errorMessage: message.payload.message,
      };
    }

    case 'host_answer_update': {
      // Players never receive this; ignore defensively in case of routing overlap.
      return prevState;
    }

    default: {
      const _exhaustiveCheck: never = message;
      return prevState;
    }
  }
}

export function useGameSocket(roomCode: string): {
  readonly send: (msg: ClientMessage) => void;
} {
  const setGameState = useSetAtom(gameStateAtom);
  const outbound = React.useMemo(() => Effect.runSync(Queue.unbounded<ClientMessage>()), []);

  React.useEffect(() => {
    const onMessage = (msg: ServerMessage) =>
      Effect.sync(() => {
        if (msg.type === 'error' && msg.payload.code === 'ANSWER_ERROR') {
          Toast.danger({
            title: 'Answer failed',
            description: 'Your answer could not be submitted. Try again.',
          });
          return;
        }

        if (msg.type === 'error' && msg.payload.code === 'ALREADY_ANSWERED') {
          Toast.danger({
            title: 'Answer failed',
            description: 'You have already answered this question.',
          });
          return;
        }

        if (msg.type === 'error' && msg.payload.code === 'QUESTION_NOT_ACTIVE') {
          Toast.danger({
            title: 'Answer failed',
            description: 'This question is no longer active.',
          });
          return;
        }

        setGameState((prev) => applyMessage(prev, msg));
      });

    const program = makeGameSocket(roomCode, outbound, onMessage).pipe(
      Effect.provide(applicationLayer)
    );

    const fiber = Effect.runFork(program);

    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
  }, [roomCode, outbound, setGameState]);

  const send = React.useCallback(
    (msg: ClientMessage) => {
      Queue.unsafeOffer(outbound, msg);
    },
    [outbound]
  );

  return { send };
}
