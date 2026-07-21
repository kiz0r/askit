import { DateTime, Duration } from 'effect';
import * as React from 'react';
import type { WsQuestion } from '@/entities/game';

type QuestionTimer = {
  readonly timeLeft: number;
  readonly totalSeconds: number;
  readonly progress: number;
};

export function useQuestionTimer(question: WsQuestion): QuestionTimer {
  const startedAtMs = DateTime.toEpochMillis(question.startedAt);
  const timeLimitMs = Duration.toMillis(question.timeLimitMs);
  const elapsed = DateTime.toEpochMillis(DateTime.unsafeNow()) - startedAtMs;
  const remaining = Math.max(0, timeLimitMs - elapsed);

  const [timeLeft, setTimeLeft] = React.useState(Math.ceil(remaining / 1000));

  React.useEffect(() => {
    setTimeLeft(
      Math.ceil(
        Math.max(0, timeLimitMs - (DateTime.toEpochMillis(DateTime.unsafeNow()) - startedAtMs)) /
          1000
      )
    );

    const interval = setInterval(() => {
      const ms = timeLimitMs - (DateTime.toEpochMillis(DateTime.unsafeNow()) - startedAtMs);
      setTimeLeft(Math.ceil(Math.max(0, ms) / 1_000));

      if (ms <= 0) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [startedAtMs, timeLimitMs]);

  const totalSeconds = Math.ceil(timeLimitMs / 1_000);
  const progress = timeLeft / totalSeconds;

  return { timeLeft, totalSeconds, progress };
}
