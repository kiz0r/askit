import { Link } from '@tanstack/react-router';
import { Duration } from 'effect';
import type { PlayerId, WsLeaderboardEntry } from '@/entities/game';
import { Button } from '@/shared/ui';
import { cn, formatDuration } from '@/shared/utils';

type Props = {
  readonly leaderboardEntries: readonly WsLeaderboardEntry[];
  readonly sessionPlayerId: PlayerId | null;
  readonly duration: Duration.Duration;
  readonly totalQuestions: number;
};

function getGrade(percentage: number) {
  if (percentage >= 80) {
    return {
      label: 'Excellent!',
      color: '#22c55e',
      emoji: '🏆',
    } as const;
  }

  if (percentage >= 60) {
    return {
      label: 'Good job!',
      color: '#a78bfa',
      emoji: '👍',
    } as const;
  }

  return {
    label: 'Keep practicing',
    color: '#f97316',
    emoji: '📚',
  } as const;
}

type ScoreRingProps = {
  readonly percentage: number;
  readonly score: number;
  readonly color: string;
};

const ScoreRing = (props: ScoreRingProps) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(props.percentage / 100, 1));

  return (
    <div className='relative size-[120px]'>
      <svg width={120} height={120} className='-rotate-90' aria-hidden>
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill='none'
          stroke='rgba(255 255 255 / 0.08)'
          strokeWidth={6}
        />
        <circle
          cx={60}
          cy={60}
          r={radius}
          fill='none'
          stroke={props.color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-xl font-black tabular-nums' style={{ color: props.color }}>
          {props.score}
        </span>
        <span className='text-xs text-white/40'>pts</span>
      </div>
    </div>
  );
};

const PODIUM_COLORS = ['text-amber-400', 'text-slate-400', 'text-amber-700'] as const;
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'] as const;

export const FinalResults = (props: Props) => {
  const isHost = props.sessionPlayerId === null;
  const playerEntry = props.leaderboardEntries.find(
    (player) => player.playerId === props.sessionPlayerId
  );
  const playerScore = playerEntry?.score ?? 0;
  const maxScore = props.totalQuestions * 1000;
  const percentage = maxScore > 0 ? Math.round((playerScore / maxScore) * 100) : 0;
  const grade = getGrade(percentage);

  return (
    <div className='flex flex-col grow items-center justify-center gap-6 p-6 bg-zinc-950 text-zinc-50'>
      <div className='flex flex-col items-center gap-3 text-center'>
        {isHost ? (
          <p className='text-2xl font-black text-violet-400'>Game Over</p>
        ) : (
          <>
            <div
              className='flex items-center justify-center rounded-full text-3xl'
              style={{
                width: 72,
                height: 72,
                backgroundColor: `${grade.color}22`,
                border: `2px solid ${grade.color}55`,
              }}
            >
              {grade.emoji}
            </div>

            <p className='text-2xl font-black' style={{ color: grade.color }}>
              {grade.label}
            </p>

            <ScoreRing percentage={percentage} score={playerScore} color={grade.color} />
          </>
        )}

        <p className='text-sm text-white/40'>
          {formatDuration(props.duration)} · {props.leaderboardEntries.length} players
        </p>
      </div>

      <div className='w-full max-w-sm flex flex-col gap-1.5 rounded-2xl p-4 bg-white/3 border border-white/8'>
        {props.leaderboardEntries.map((player) => {
          const isMe = player.playerId === props.sessionPlayerId;

          return (
            <div
              key={player.playerId}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors border',
                isMe ? 'font-semibold bg-violet-700/10 border-violet-700/25' : 'border-transparent'
              )}
            >
              <span
                className={cn(
                  'w-6 text-center font-bold tabular-nums text-xs',
                  player.rank <= 3 ? PODIUM_COLORS[player.rank - 1] : 'text-white/35'
                )}
              >
                {player.rank <= 3 ? MEDAL_EMOJIS[player.rank - 1] : player.rank}
              </span>
              <span className={cn('flex-1', isMe ? 'text-violet-400' : 'text-zinc-50')}>
                {player.nickname}
                {isMe ? <span className='ml-1.5 text-xs text-white/35'>(you)</span> : null}
              </span>
              <span className='font-bold tabular-nums text-zinc-50'>{player.score}</span>
            </div>
          );
        })}
      </div>

      {isHost ? (
        <Button asChild variant='outline' className='w-full max-w-sm'>
          <Link to='/quizzes'>Back to dashboard</Link>
        </Button>
      ) : (
        <div className='flex flex-col gap-2 w-full max-w-sm'>
          <Button asChild className='w-full'>
            <Link to='/join'>Join another game</Link>
          </Button>
          <Button asChild variant='outline' className='w-full'>
            <Link to='/auth/login'>Log in</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
