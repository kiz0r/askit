import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import * as React from 'react';
import { gameStateAtom, type PlayerId, sessionPlayerIdAtom } from '@/entities/game';
import type { QuizAnswerId, QuizQuestionId } from '@/entities/quiz';
import {
  CountdownView,
  FinalResults,
  PlayerLobby,
  QuestionView,
  useGameSocket,
} from '@/features/game';
import { Spinner } from '@/shared/ui';

const PlayPage = () => {
  const params = Route.useParams();
  const sessionPlayerId = useAtomValue(sessionPlayerIdAtom);
  const setSessionPlayerId = useSetAtom(sessionPlayerIdAtom);

  // On fresh page load, sessionPlayerIdAtom is null — restore from sessionStorage synchronously
  const effectivePlayerId = React.useMemo(() => {
    if (sessionPlayerId !== null) {
      return sessionPlayerId;
    }
    const stored = sessionStorage.getItem(`game:${params.roomCode}`);
    return stored ? (stored as PlayerId) : null;
  }, [sessionPlayerId, params.roomCode]);

  // Sync restored value back into atom so child components see it
  React.useEffect(() => {
    if (sessionPlayerId === null && effectivePlayerId !== null) {
      setSessionPlayerId(effectivePlayerId);
    }
  }, [sessionPlayerId, effectivePlayerId, setSessionPlayerId]);

  if (effectivePlayerId === null) {
    return <Navigate to='/join' search={{ roomCode: params.roomCode }} />;
  }

  return <PlayScreen roomCode={params.roomCode} playerId={effectivePlayerId} />;
};

type PlayScreenProps = {
  readonly roomCode: string;
  readonly playerId: PlayerId;
};

const PlayScreen = (props: PlayScreenProps) => {
  const roomCode = props.roomCode;
  const playerId = props.playerId;
  const gameSocket = useGameSocket(roomCode);
  const state = useAtomValue(gameStateAtom);
  const [hasAnswered, setHasAnswered] = React.useState(false);

  const questionId = state.status === 'question' ? state.currentQuestion?.questionId : null;

  React.useEffect(() => {
    setHasAnswered(false);
  }, [questionId]);

  const handleAnswer = React.useCallback(
    (questionId: QuizQuestionId, answerIds: readonly QuizAnswerId[]) => {
      gameSocket.send({ type: 'answer', payload: { questionId, answerIds: [...answerIds] } });
      setHasAnswered(true);
    },
    [gameSocket.send]
  );

  switch (state.status) {
    case 'connecting':
      return (
        <div className='flex items-center justify-center grow gap-3'>
          <Spinner />
          <span className='text-muted-foreground text-sm'>Connecting…</span>
        </div>
      );

    case 'lobby':
      return (
        <PlayerLobby roomCode={roomCode} quizTitle={state.quizTitle} players={state.players} />
      );

    case 'starting':
      return <CountdownView duration={state.countdownDuration} quizTitle={state.quizTitle} />;

    case 'question':
      if (!state.currentQuestion) {
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

    case 'finished':
      return (
        <FinalResults
          leaderboardEntries={state.finalLeaderboard}
          sessionPlayerId={playerId}
          duration={state.duration}
          totalQuestions={state.totalQuestions}
        />
      );

    case 'error':
      return (
        <div className='flex flex-col items-center justify-center grow gap-3 p-6 text-center'>
          <p className='text-destructive font-semibold text-lg'>Something went wrong</p>
          <p className='text-muted-foreground text-sm'>{state.errorMessage ?? 'Unknown error'}</p>
        </div>
      );
  }
};

export const Route = createFileRoute('/(game)/_gameLayout/play/$roomCode')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Playing' }],
  }),
  component: PlayPage,
});
