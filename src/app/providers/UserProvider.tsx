import { useQuery } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { AuthState, authStateAtom, SessionExpiredError } from '@/entities/user';
import { getUser } from '@/features/user';
import { isUserErrorRecoverable } from '@/features/user/api/isUserErrorRecoverable';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';

const program = getUser().pipe(
  Effect.map((user): AuthState => AuthState.authenticated(user)),
  Effect.retry({
    while: isUserErrorRecoverable,
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
        title: 'Failed to retrieve user data',
        description: getDescriptiveErrorMessage(error),
      });
    })
  )
);

export const UserProvider = () => {
  const setAuthState = useSetAtom(authStateAtom);

  const query = useQuery({
    queryKey: ['getUser'] as const,
    refetchOnWindowFocus: true,
    retry: false,
    queryFn: ({ signal }) =>
      runProgram(
        program.pipe(Effect.provide(applicationLayer), Effect.ensureRequirementsType<never>()),
        {
          signal,
        }
      ),
  });

  React.useEffect(() => {
    if (query.data !== undefined) {
      setAuthState(query.data);
      return;
    }

    // A failed profile probe (e.g. an expired session on load or on refetch) means
    // the user is not authenticated. Setting the state lets the route guard redirect
    // to login, which the query-cache listener cannot do while it is unmounted.
    if (query.isError) {
      setAuthState(AuthState.unauthenticated());
    }
  }, [query.data, query.isError, setAuthState]);

  return null;
};
