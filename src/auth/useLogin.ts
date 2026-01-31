import { useMutation } from '@tanstack/react-query';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import { Notify } from '../notifications/Notify';
import { envConfigProvider } from '../settings';
import { userAtom } from '../store';
import { type LoginCredentials, loginUser } from './loginUser';

const loginProgram = (credentials: LoginCredentials) =>
  loginUser(credentials).pipe(
    Effect.catchTags({
      ConfigError: Effect.die, // Configuration errors are fatal here
      NotOkError: Notify.errorAndSucceed({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        fallback: null,
      }),
      NotAllowedError: Notify.errorAndSucceed({
        title: 'Login failed',
        description: 'Login not allowed. Please contact support.',
        fallback: null,
      }),
      ParseError: Notify.errorAndSucceed({
        title: 'Login failed',
        description: 'Failed to parse server response. Please try again later.',
        fallback: null,
      }),
      MalformedJsonError: Notify.errorAndSucceed({
        title: 'Login failed',
        description: 'Received malformed data from server. Please try again later.',
        fallback: null,
      }),
      AbortError: Notify.infoAndSucceed({
        title: 'Login aborted',
        description: 'Login request was aborted. Please try again.',
        fallback: null,
      }),
      FetchError: Notify.errorAndSucceed({
        title: 'Login failed',
        description: 'Network error occurred while trying to login.',
        fallback: null,
      }),
    })
  );

export function useLoginUser() {
  const setUser = useSetAtom(userAtom);

  const mutation = useMutation({
    mutationKey: ['login'] as const,
    mutationFn: (credentials: LoginCredentials) =>
      loginProgram(credentials).pipe(
        Effect.withConfigProvider(envConfigProvider),
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.ensureErrorType<never>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      const user = result ?? null;

      setUser(user);
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
}
