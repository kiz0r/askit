import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import { isQuizzesLoadingAtom, quizzesAtom } from '@/entities/quiz';
import { AuthState, authStateAtom } from '@/entities/user';
import { runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { logoutUser } from './api/logoutUser';

const program = logoutUser().pipe(Effect.catchAll(() => Effect.void));

export const useLogout = () => {
  const setAuthState = useSetAtom(authStateAtom);
  const setQuizzes = useSetAtom(quizzesAtom);
  const setQuizzesLoading = useSetAtom(isQuizzesLoadingAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ['logout'] as const,
    mutationFn: () =>
      program.pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>(),
        runProgram
      ),
    onSettled: () => {
      // Server data is scoped per user but cached under user-agnostic query
      // keys (e.g. ['quizzes']), so it must be wiped on logout — otherwise
      // the next login can briefly show the previous user's cached data.
      queryClient.clear();
      setQuizzes(new Map());
      setQuizzesLoading(false);
      setAuthState(AuthState.unauthenticated());
      navigate({ to: '/auth/login' });
    },
  });

  return mutation;
};
