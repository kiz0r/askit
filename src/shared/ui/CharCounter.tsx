import * as React from 'react';
import { cn } from '@/shared/utils';

type Props = {
  readonly current: number;
  readonly limit: number;
  readonly className?: string;
};

export const CharCounter = React.memo((props: Props) => {
  const isNearLimit = props.current >= props.limit * 0.9;
  const isAtLimit = props.current >= props.limit;

  return (
    <span
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
});

CharCounter.displayName = 'CharCounter';
