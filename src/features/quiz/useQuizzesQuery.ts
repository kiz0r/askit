import { useQuery } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { isQuizzesLoadingAtom, type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { getQuizzes } from './api/getQuizzes';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';

const getQuizzesProgram = getQuizzes().pipe(
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
        title: 'Failed to fetch quizzes',
        description: getDescriptiveErrorMessage(error),
      });
    })
  )
);

export const useQuizzesQuery = () => {
  const setQuizzes = useSetAtom(quizzesAtom);
  const setLoading = useSetAtom(isQuizzesLoadingAtom);

  const query = useQuery({
    queryKey: ['quizzes'] as const,
    staleTime: 30_000, // Consider data fresh for 30 seconds
    retry: false,
    queryFn: ({ signal }) =>
      runProgram(
        getQuizzesProgram.pipe(
          Effect.provide(applicationLayer),
          Effect.ensureRequirementsType<never>()
        ),
        { signal }
      ),
  });

  React.useEffect(() => {
    setLoading(query.isPending);
  }, [query.isPending, setLoading]);

  // Sync data to atom
  React.useEffect(() => {
    if (query.data == null) {
      return;
    }

    const quizzes: /* mutable */ Map<QuizId, Quiz> = new Map();
    for (const quiz of query.data) {
      quizzes.set(quiz.quizId, quiz);
    }

    setQuizzes(quizzes);
  }, [query.data, setQuizzes]);
};
