import { Navigate } from '@tanstack/react-router';
import { useAtom, useAtomValue } from 'jotai';
import * as React from 'react';
import { gameStateAtom, PlayerId, sessionPlayerIdAtom } from '@/entities/game';
import type { QuizAnswerId, QuizQuestionId } from '@/entities/quiz';
import {
  CountdownView,
  FinalResults,
  GameConnectingView,
  GameErrorView,
  PlayerLobby,
  QuestionView,
  useGameSocket,
} from '@/features/game';

type Props = {
  readonly roomCode: string;
};

export const PlayGamePage = (props: Props) => {
  const [sessionPlayerId, setSessionPlayerId] = useAtom(sessionPlayerIdAtom);

  // On a fresh page load the atom is null, so restore the id from sessionStorage.
  const effectivePlayerId = React.useMemo(() => {
    if (sessionPlayerId !== null) {
      return sessionPlayerId;
    }

    const storedValue = sessionStorage.getItem(`game:${props.roomCode}`);
    return storedValue !== null ? PlayerId(storedValue) : null;
  }, [sessionPlayerId, props.roomCode]);

  // Sync the restored value back into the atom so child components see it.
  React.useEffect(() => {
    if (sessionPlayerId === null && effectivePlayerId !== null) {
      setSessionPlayerId(effectivePlayerId);
    }
  }, [sessionPlayerId, effectivePlayerId, setSessionPlayerId]);

  if (effectivePlayerId === null) {
    return <Navigate to='/join' search={{ roomCode: props.roomCode }} />;
  }

  return <PlayScreen roomCode={props.roomCode} playerId={effectivePlayerId} />;
};

type PlayScreenProps = {
  readonly roomCode: string;
  readonly playerId: PlayerId;
};

const PlayScreen = (props: PlayScreenProps) => {
  const gameSocket = useGameSocket(props.roomCode);
  const state = useAtomValue(gameStateAtom);
  const [hasAnswered, setHasAnswered] = React.useState(false);

  const questionId = state.status === 'question' ? state.currentQuestion?.questionId : null;

  React.useEffect(() => {
    setHasAnswered(false);
  }, [questionId]);

  const handleAnswer = React.useCallback(
    (answeredQuestionId: QuizQuestionId, answerIds: readonly QuizAnswerId[]) => {
      gameSocket.send({
        type: 'answer',
        payload: { questionId: answeredQuestionId, answerIds },
      });
      setHasAnswered(true);
    },
    [gameSocket.send]
  );

  switch (state.status) {
    case 'connecting': {
      return <GameConnectingView />;
    }

    case 'lobby': {
      return (
        <PlayerLobby
          roomCode={props.roomCode}
          quizTitle={state.quizTitle}
          players={state.players}
        />
      );
    }

    case 'starting': {
      return <CountdownView duration={state.countdownDuration} quizTitle={state.quizTitle} />;
    }

    case 'question': {
      if (state.currentQuestion === null) {
        return null;
      }

      return (
        <QuestionView
          question={state.currentQuestion}
          hasAnswered={hasAnswered}
          answerResult={state.answerResult}
          questionEnded={state.questionEnded}
          onAnswer={handleAnswer}
        />
      );
    }

    case 'finished': {
      return (
        <FinalResults
          leaderboardEntries={state.finalLeaderboard}
          sessionPlayerId={props.playerId}
          duration={state.duration}
          totalQuestions={state.totalQuestions}
          totalPlayers={state.players.length}
          publicResults={state.publicResults}
        />
      );
    }

    case 'error': {
      return <GameErrorView message={state.errorMessage} />;
    }

    default: {
      const _exhaustiveCheck: never = state.status;
      throw new Error(`Received an unexpected game status: "${state.status}".`);
    }
  }
};
