import { cn } from '@/shared/utils';

type Props = {
  readonly current: number;
  readonly limit: number;
  readonly className?: string;
};

const LIMIT_WARNING_THRESHOLD = 0.9;

export const CharCounter = (props: Props) => {
  const isNearLimit = props.current >= props.limit * LIMIT_WARNING_THRESHOLD;
  const isAtLimit = props.current >= props.limit;

  return (
    <span
      aria-live='polite'
      aria-atomic='true'
      className={cn(
        'select-none text-xs font-mono tabular-nums transition-colors',
        isAtLimit
          ? 'text-destructive font-medium'
          : isNearLimit
            ? 'text-amber-500'
            : 'text-muted-foreground',
        props.className
      )}
    >
      {props.current}/{props.limit}
    </span>
  );
};
