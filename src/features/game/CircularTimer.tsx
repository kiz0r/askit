const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const REGULAR_TIMER_COLOR = '#a78bfa';
const WARNING_TIMER_COLOR = '#f97316';
const DANGER_TIMER_COLOR = '#ef4444';
const ANSWERED_TIMER_COLOR = '#22c55e';

const MEDIUM_THRESHOLD = 0.5;
const LOW_THRESHOLD = 0.25;

function getTimerColor(progress: number): string {
  if (progress > MEDIUM_THRESHOLD) {
    return REGULAR_TIMER_COLOR;
  }

  if (progress > LOW_THRESHOLD) {
    return WARNING_TIMER_COLOR;
  }

  return DANGER_TIMER_COLOR;
}

type Props = {
  readonly timeLeft: number;
  readonly totalSeconds: number;
  readonly isAnswered: boolean;
};

export const CircularTimer = (props: Props) => {
  const progress = props.totalSeconds > 0 ? props.timeLeft / props.totalSeconds : 0;
  const ringProgress = props.isAnswered ? 1 : progress;
  const timerColor = props.isAnswered ? ANSWERED_TIMER_COLOR : getTimerColor(progress);

  return (
    <div className='relative size-18 shrink-0'>
      <svg width={72} height={72} className='-rotate-90' aria-hidden>
        <circle
          cx={36}
          cy={36}
          r={RADIUS}
          fill='none'
          stroke='rgba(255 255 255 / 0.08)'
          strokeWidth={4}
        />
        <circle
          cx={36}
          cy={36}
          r={RADIUS}
          fill='none'
          stroke={timerColor}
          strokeWidth={4}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ringProgress)}
          strokeLinecap='round'
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span
        className='absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums'
        style={{ color: timerColor }}
      >
        {props.isAnswered ? '✓' : props.timeLeft}
      </span>
    </div>
  );
};
