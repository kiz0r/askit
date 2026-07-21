import { createFileRoute } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { gameStateAtom } from '@/entities/game';
import {
  CountdownView,
  FinalResults,
  HostLobby,
  HostQuestionView,
  useHostSocket,
} from '@/features/game';
import { Spinner } from '@/shared/ui';

function renderLoadingView() {
  return (
    <div className='flex items-center justify-center grow gap-3'>
      <Spinner />
      <span className='text-muted-foreground text-sm'>Connecting…</span>
    </div>
  );
}

function renderErrorView(errorMessage: string | null) {
  return (
    <div className='flex flex-col items-center justify-center grow gap-3 p-6 text-center'>
      <p className='text-destructive font-semibold text-lg'>Something went wrong</p>
      <p className='text-muted-foreground text-sm'>{errorMessage ?? 'Unknown error'}</p>
    </div>
  );
}

const GameHostPage = () => {
  const params = Route.useParams();
  const hostSocket = useHostSocket(params.roomCode);
  const state = useAtomValue(gameStateAtom);

  const handleStartGame = React.useCallback(() => {
    hostSocket.send({ type: 'start_game' });
  }, [hostSocket.send]);

  const handleNextQuestion = React.useCallback(() => {
    hostSocket.send({ type: 'next_question' });
  }, [hostSocket.send]);

  switch (state.status) {
    case 'connecting': {
      return renderLoadingView();
    }

    case 'lobby': {
      return (
        <HostLobby
          roomCode={params.roomCode}
          quizTitle={state.quizTitle}
          players={state.players}
          onStartGame={handleStartGame}
          isStarting={false}
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
        <HostQuestionView
          question={state.currentQuestion}
          players={state.players}
          answeredPlayerIds={state.answeredPlayerIds}
          hostAnswerDetails={state.hostAnswerDetails}
          questionEnded={state.questionEnded}
          onNextQuestion={handleNextQuestion}
        />
      );
    }

    case 'finished': {
      return (
        <FinalResults
          leaderboardEntries={state.finalLeaderboard}
          sessionPlayerId={null}
          duration={state.duration}
          totalQuestions={state.totalQuestions}
        />
      );
    }

    case 'error': {
      return renderErrorView(state.errorMessage);
    }

    default: {
      const _exhaustiveCheck: never = state.status;
      throw new Error(`Received an unexpected game status: "${state.status}".`);
    }
  }
};

export const Route = createFileRoute('/(game)/_gameLayout/host/$roomCode')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Hosting game' }],
  }),
  component: GameHostPage,
});
