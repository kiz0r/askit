import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import React from 'react';
import { withAuthRetry } from '../auth/withAuthRetry';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { isUserLoadingAtom, userAtom } from '../store';
import { getUser } from './getUser';

const fetchUserProgram = () =>
  getUser().pipe(
    withAuthRetry,
    Effect.catchTags({
      ConfigError: Effect.die, // Configuration errors are fatal here
      SessionExpiredError: () => Effect.succeed('SESSION_EXPIRED' as const),
      NotOkError: (error) =>
        Notify.errorAndSucceed({
          title: 'Failed to fetch user',
          description: `Server returned ${error.response.status}. Please try again.`,
          fallback: null,
        })(),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Failed to fetch user',
        description: 'Not allowed. Please contact support.',
        fallback: null,
      }),
      ParseError: Notify.errorAndSucceed({
        title: 'Failed to fetch user',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Failed to fetch user',
        description: 'Received malformed data from server. Please try again later.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Request aborted',
        description: 'Request was aborted. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Failed to fetch user',
        description: 'Network error occurred. Please check your connection.',
        fallback: null,
      }),
    })
  );

/**
 * Hook to synchronize user state with the server.
 */
export function useSyncUser() {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(isUserLoadingAtom);

  const query = useQuery({
    queryKey: ['user'] as const,
    queryFn: ({ signal }) =>
      Effect.runPromise(
        fetchUserProgram().pipe(
          Effect.withConfigProvider(envConfigProvider),
          Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
          Effect.ensureErrorType<never>(),
          Effect.ensureRequirementsType<never>()
        ),
        {
          signal,
        }
      ),
  });

  // Sync loading state with React Query's pending state
  React.useEffect(() => {
    setLoading(query.isPending);
  }, [query.isPending, setLoading]);

  React.useEffect(() => {
    if (query.data == null) {
      return;
    }

    if (query.data === 'SESSION_EXPIRED') {
      setUser(null);
      navigate({ to: '/auth/login' });
      return;
    }

    setUser(query.data);
  }, [query.data, navigate, setUser]);
}
