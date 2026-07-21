import { useQuery } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { getQuizStats } from './api/getQuizStats';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';

const program = (quizId: QuizId) =>
  getQuizStats(quizId).pipe(
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

export const useQuizStatsQuery = (quizId: QuizId) => {
  return useQuery({
    queryKey: ['quizStats', quizId] as const,
    retry: false,
    queryFn: ({ signal, queryKey }) => {
      const [_key, id] = queryKey;

      return Effect.runPromise(
        program(id).pipe(Effect.provide(applicationLayer), Effect.ensureRequirementsType<never>()),
        { signal }
      );
    },
  });
};
