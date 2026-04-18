import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import type { QuizId } from '@/entities/quiz';
import { SessionExpiredError } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
import { getQuiz } from './api/getQuiz';

const fetchQuizProgram = (quizId: QuizId) =>
  getQuiz(quizId).pipe(
    Effect.catchTags({
      NotOkError: toast.handle('error', {
        title: 'Failed to fetch quiz',
        description: (error) => error.message,
        fallback: null,
      }),
      NotAllowedError: toast.handle('error', {
        title: 'Failed to fetch quiz',
        description: 'You are not allowed to fetch quiz.',
        fallback: null,
      }),
      AbortError: toast.handle('info', {
        title: 'Request aborted',
        description: 'Request was aborted. Please try again.',
        fallback: null,
      }),
      FetchError: toast.handle('error', {
        title: 'Failed to fetch quiz',
        description: 'Network error occurred. Please check your connection.',
        fallback: null,
      }),
      QuizNotFoundError: toast.handle('error', {
        title: 'Quiz not found',
        description: 'The requested quiz does not exist.',
        fallback: null,
      }),
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

export const useQuizQuery = (quizId: QuizId) => {
  return useQuery({
    queryKey: ['quiz', quizId] as const,
    queryFn: ({ signal, queryKey }) => {
      const [_key, quizId] = queryKey;
      const program = fetchQuizProgram(quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<SessionExpiredError>()
      );

      return Effect.runPromise(program, {
        signal,
      });
    },
  });
};
