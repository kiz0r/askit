import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import { AuthState, authStateAtom } from '@/entities/user';
import { withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
import { logoutUser } from './api/logoutUser';

const logoutProgram = logoutUser().pipe(
  withStandardErrors({ action: 'logout', fallback: null }),
  Effect.tap((payload) => {
    if (payload == null) {
      // Error happened → notification is already shown
      return;
    }

    toast.success({ title: 'You have been logged out successfully.' });
  })
);

export const useLogout = () => {
  const setAuthState = useSetAtom(authStateAtom);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ['logout'] as const,
    mutationFn: () =>
      logoutProgram.pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>(),
        Effect.runPromise
      ),
    onSettled: () => {
      setAuthState(AuthState.unauthenticated());
      navigate({ to: '/auth/login' });
    },
  });

  return mutation;
};
