import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import * as React from 'react';
import { gameStateAtom, initialGameState, sessionPlayerIdAtom } from '@/entities/game';
import { Logo } from '@/shared/ui';
import { generateArrayFromLength } from '@/shared/utils';

const GameLayout = () => {
  const setGameState = useSetAtom(gameStateAtom);
  const setSessionPlayerId = useSetAtom(sessionPlayerIdAtom);
  const state = useAtomValue(gameStateAtom);
  const sessionPlayerId = useAtomValue(sessionPlayerIdAtom);

  // Keep a ref so the cleanup closure always sees the latest roomCode
  const roomCodeRef = React.useRef(state.roomCode);
  roomCodeRef.current = state.roomCode;

  React.useEffect(() => {
    return () => {
      if (roomCodeRef.current) {
        sessionStorage.removeItem(`game:${roomCodeRef.current}`);
      }

      setGameState(initialGameState);
      setSessionPlayerId(null);
    };
  }, [setGameState, setSessionPlayerId]);

  const question = state.currentQuestion;
  const showProgress = question !== null && state.status === 'question';

  const playerScore = sessionPlayerId
    ? (state.players.find((player) => player.playerId === sessionPlayerId)?.score ?? 0)
    : null;

  return (
    <main className='dark min-h-screen flex flex-col bg-zinc-950 text-white'>
      <header className='sticky top-0 z-40 flex items-center gap-3 px-6 py-4 border-b border-white/6 shrink-0 bg-zinc-950'>
        <Logo />

        {showProgress && question !== null ? (
          <>
            <div className='flex flex-1 gap-1'>
              {generateArrayFromLength(question.totalQuestions, (_, index) => (
                <div
                  key={index}
                  className='h-1 flex-1 rounded-sm transition-colors duration-300'
                  style={{
                    background:
                      index < question.questionIndex - 1
                        ? '#6d28d9'
                        : index === question.questionIndex - 1
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>

            {playerScore !== null ? (
              <div className='flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shrink-0 bg-white/5 border border-white/10'>
                <span className='text-white/40'>SCORE</span>
                <span className='font-bold tabular-nums text-violet-400'>{playerScore}</span>
              </div>
            ) : (
              <div className='flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shrink-0 bg-white/5 border border-white/10'>
                <span className='text-white/40'>ANSWERED</span>
                <span className='font-bold tabular-nums text-violet-400'>
                  {state.answeredPlayerIds.length}/{state.players.length}
                </span>
              </div>
            )}

            <span className='text-xs shrink-0 tabular-nums text-white/40'>
              {question.questionIndex} / {question.totalQuestions}
            </span>
          </>
        ) : (
          <div className='flex-1' />
        )}
      </header>

      <Outlet />
    </main>
  );
};

export const Route = createFileRoute('/(game)/_gameLayout')({
  component: GameLayout,
});
