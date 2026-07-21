import { useQuery } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { getQuiz } from './api/getQuiz';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';

const program = (quizId: QuizId) =>
  getQuiz(quizId).pipe(
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
          title: 'Failed to fetch quiz',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

export const useQuizQuery = (quizId: QuizId) => {
  return useQuery({
    queryKey: ['quiz', quizId] as const,
    retry: false,
    queryFn: ({ signal, queryKey }) => {
      const [_key, quizId] = queryKey;

      return Effect.runPromise(
        program(quizId).pipe(
          Effect.provide(applicationLayer),
          Effect.ensureRequirementsType<never>()
        ),
        {
          signal,
        }
      );
    },
  });
};
