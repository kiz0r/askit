import { useQuery } from '@tanstack/react-query';
import { NavigateFn, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { getQuiz } from './getQuiz';
import type { QuizId } from './QuizId';

const fetchQuizProgram = (quizId: QuizId, navigateFn: NavigateFn) =>
  getQuiz(quizId).pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die,
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to fetch quiz',
          description: error.message,
          fallback: null,
        })(),
      ParseError: Notify.errorAndSucceed({
        title: 'Failed to fetch quiz',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Failed to fetch quiz',
        description: 'Received malformed data from server. Please try again later.',
        fallback: null,
      }),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to fetch quiz',
        description: 'You are not allowed to fetch quiz.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Request aborted',
        description: 'Request was aborted. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to fetch quiz',
        description: 'Network error occurred. Please check your connection.',
        fallback: null,
      }),
      QuizNotFoundError: Notify.errorAndSucceed({
        title: 'Quiz not found',
        description: 'The requested quiz does not exist.',
        fallback: null,
      }),
      SessionExpiredError: () =>
        Effect.sync(() => {
          navigateFn({ to: '/auth/login' });
          return null;
        }),
    })
  );

export const useQuizQuery = (quizId: QuizId) => {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['quiz', quizId] as const,
    queryFn: ({ signal, queryKey }) => {
      const [_key, quizId] = queryKey;
      const program = fetchQuizProgram(quizId, navigate).pipe(
        Effect.scoped,
        Effect.withConfigProvider(envConfigProvider),
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>()
      );

      return Effect.runPromise(program, {
        signal,
      });
    },
  });

  return {
    quiz: query.data ?? null,
    isLoading: query.isPending,
  } as const;
};
