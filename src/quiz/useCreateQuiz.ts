import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type NavigateFn, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { createQuiz } from './createQuiz';
import type { QuizFormInput } from './QuizFormInput';

const createQuizProgram = (input: QuizFormInput, navigate: NavigateFn) =>
  createQuiz(input).pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die,
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to create a quiz',
          description: error.message,
          fallback: null,
        })(),
      ParseError: Notify.errorAndSucceed({
        title: 'Failed to create a quiz',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Failed to create a quiz',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to create a quiz',
        description: 'You are not allowed to create a quiz.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Quiz creation aborted',
        description: 'Quiz creation stopped. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to create a quiz',
        description: 'Network error occurred. Please check your connection.',
        fallback: null,
      }),
      SessionExpiredError: () =>
        Effect.sync(() => {
          navigate({ to: '/auth/login' });
          return null;
        }),
    })
  );

export const useCreateQuiz = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['createQuiz'] as const,
    mutationFn: (input: QuizFormInput) =>
      createQuizProgram(input, navigate).pipe(
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.withConfigProvider(envConfigProvider),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      if (result == null) {
        // Error cases are handled in the program, so we can just return here.
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ['quizzes'] as const,
      });

      Notify.success({
        title: 'Quiz created successfully',
      });
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
};
