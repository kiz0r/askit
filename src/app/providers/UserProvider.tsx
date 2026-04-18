import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { AuthState, authStateAtom } from '@/entities/user';
import { getUser } from '@/features/user';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';

const program = getUser().pipe(
  Effect.map((user): AuthState => AuthState.authenticated(user)),
  Effect.catchTags({
    // 401 = user not logged in, just set unauthenticated (no toast, no retry)
    SessionExpiredError: () => Effect.succeed(AuthState.unauthenticated()),
    NotOkError: toast.handle('error', {
      title: 'Failed to retrieve user data',
      fallback: AuthState.unauthenticated(),
    }),
    FetchError: toast.handle('error', {
      title: 'Failed to fetch user data',
      description: 'Please check your internet connection.',
      fallback: AuthState.unauthenticated(),
    }),
    AbortError: toast.handle('info', {
      title: 'Request aborted',
      description: 'User data request was aborted.',
      fallback: AuthState.unauthenticated(),
    }),
  }),
  Effect.ensureErrorType<never>()
);

export const UserProvider = React.memo(() => {
  const setAuthState = useSetAtom(authStateAtom);

  const query = useQuery({
    queryKey: ['getUser'] as const,
    refetchOnWindowFocus: true,
    queryFn: () =>
      program.pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
  });

  React.useEffect(() => {
    if (query.data == null) {
      return;
    }

    setAuthState(query.data);
  }, [query.data, setAuthState]);

  return null;
});
