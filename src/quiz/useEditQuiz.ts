import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type NavigateFn, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { editQuiz } from './editQuiz';
import type { QuizFormInput } from './QuizFormInput';
import type { QuizId } from './QuizId';

const editQuizProgram = (quizId: QuizId, input: QuizFormInput, navigate: NavigateFn) =>
  editQuiz(quizId, input).pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die,
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to edit a quiz',
          description: error.message,
          fallback: null,
        })(),
      ParseError: Notify.errorAndSucceed({
        title: 'Failed to edit a quiz',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Failed to edit a quiz',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to edit a quiz',
        description: 'You are not allowed to edit a quiz.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Quiz editing aborted',
        description: 'Quiz editing stopped. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to edit a quiz',
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

export const useEditQuiz = (quizId: QuizId) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['editQuiz', quizId] as const,
    mutationFn: (input: QuizFormInput) =>
      editQuizProgram(quizId, input, navigate).pipe(
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
      queryClient.invalidateQueries({
        queryKey: ['quiz', quizId] as const,
      });

      Notify.success({
        title: 'Quiz edited successfully',
      });
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
};
