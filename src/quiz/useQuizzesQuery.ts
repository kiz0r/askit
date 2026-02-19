import { useQuery } from '@tanstack/react-query';
import { NavigateFn, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import React from 'react';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { isQuizzesLoadingAtom, quizzesAtom } from '../store';
import { fetchQuizzes } from './fetchQuizzes';
import type { Quiz } from './Quiz';
import type { QuizId } from './QuizId';

const fetchQuizzesProgram = (navigateFn: NavigateFn) =>
  fetchQuizzes().pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die,
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to fetch quizzes',
          description: error.message,
          fallback: [] as const,
        })(),
      ParseError: Notify.errorAndSucceed({
        title: 'Failed to fetch quizzes',
        description: 'Failed to parse server response. Please try again later.',
        fallback: [] as const,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Failed to fetch quizzes',
        description: 'Received malformed data from server. Please try again later.',
        fallback: [] as const,
      }),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to fetch quizzes',
        description: 'You are not allowed to fetch quizzes.',
        fallback: [] as const,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Request aborted',
        description: 'Request was aborted. Please try again.',
        fallback: [] as const,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to fetch quizzes',
        description: 'Network error occurred. Please check your connection.',
        fallback: [] as const,
      }),
      SessionExpiredError: () =>
        Effect.sync(() => {
          navigateFn({ to: '/auth/login' });
          return [] as const;
        }),
    })
  );

export const useQuizzesQuery = () => {
  const setQuizzes = useSetAtom(quizzesAtom);
  const setLoading = useSetAtom(isQuizzesLoadingAtom);
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['quizzes'] as const,
    queryFn: ({ signal }) =>
      Effect.runPromise(
        Effect.gen(function* () {
          setLoading(true);

          yield* Effect.addFinalizer(() => {
            setLoading(false);
            return Effect.void;
          });

          return yield* fetchQuizzesProgram(navigate);
        }).pipe(
          Effect.scoped,
          Effect.withConfigProvider(envConfigProvider),
          Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
          Effect.ensureRequirementsType<never>(),
          Effect.ensureErrorType<never>()
        ),
        {
          signal,
        }
      ),
  });

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
