import { useAtomValue } from 'jotai';
import * as React from 'react';
import { gameStateAtom } from '@/entities/game';
import {
  CountdownView,
  FinalResults,
  GameConnectingView,
  GameErrorView,
  HostLobby,
  HostQuestionView,
  useHostSocket,
} from '@/features/game';

type Props = {
  readonly roomCode: string;
};

export const HostGamePage = (props: Props) => {
  const hostSocket = useHostSocket(props.roomCode);
  const state = useAtomValue(gameStateAtom);

  const handleStartGame = React.useCallback(() => {
    hostSocket.send({ type: 'start_game' });
  }, [hostSocket.send]);

  const handleNextQuestion = React.useCallback(() => {
    hostSocket.send({ type: 'next_question' });
  }, [hostSocket.send]);

  switch (state.status) {
    case 'connecting': {
      return <GameConnectingView />;
    }

    case 'lobby': {
      return (
        <HostLobby
          roomCode={props.roomCode}
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
