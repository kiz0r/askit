import { useQuery } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { getBulkQuizStats } from './api/getBulkQuizStats';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';

const program = (quizIds: readonly QuizId[]) =>
  getBulkQuizStats(quizIds).pipe(
    Effect.retry({
      while: isQuizErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to load stats',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

export const useBulkQuizStatsQuery = (quizIds: readonly QuizId[]) => {
  const isQueryEnabled = quizIds.length > 0;

  return useQuery({
    queryKey: ['bulkQuizStats', quizIds] as const,
    enabled: isQueryEnabled,
    retry: false,
    queryFn: ({ signal, queryKey }) => {
      const [_key, quizIds] = queryKey;

      return Effect.runPromise(
        program(quizIds).pipe(
          Effect.provide(applicationLayer),
          Effect.ensureRequirementsType<never>()
        ),
        { signal }
      );
    },
  });
};
