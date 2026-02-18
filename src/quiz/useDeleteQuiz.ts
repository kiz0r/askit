import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type NavigateFn, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { deleteQuiz } from './deleteQuiz';
import type { QuizId } from './QuizId';

const deleteQuizProgram = (quizId: QuizId, navigate: NavigateFn) =>
  deleteQuiz(quizId).pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die,
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to delete the quiz',
          description: error.message,
          fallback: null,
        })(),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to delete the quiz',
        description: 'You are not allowed to delete a quiz.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Quiz deletion aborted',
        description: 'Quiz deletion stopped. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to delete a quiz',
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

export const useDeleteQuiz = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['deleteQuiz'] as const,
    mutationFn: (quizId: QuizId) =>
      deleteQuizProgram(quizId, navigate).pipe(
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.withConfigProvider(envConfigProvider),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>(),
        Effect.runPromise
      ),

    onSettled: (result) => {
      if (result == null) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ['quizzes'],
      });

      Notify.success({
        title: 'Quiz deleted',
        description: 'The quiz has been deleted successfully.',
      });
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
};
