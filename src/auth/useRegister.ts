import { useMutation } from '@tanstack/react-query';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { envConfigProvider } from '../settings';
import { userAtom } from '../store';
import { type RegisterCredentials, registerUser } from './registerUser';

const fetchUserProgram = (credentials: RegisterCredentials) =>
  registerUser(credentials).pipe(
    Effect.catchTags({
      ConfigError: () => Effect.die('Configuration error occurred while fetching user.'),
      NotOkError: () => {
        toast.error('Registration failed', {
          description: 'Invalid email or password. Please try again.',
        });
        return Effect.succeed(null);
      },
      NotAllowedError: () => {
        toast.error('Registration failed', {
          description: 'Registration not allowed. Please contact support.',
        });
        return Effect.succeed(null);
      },
      ParseError: () => {
        toast.error('Registration failed', {
          description: 'Failed to parse server response. Please try again later.',
        });
        return Effect.succeed(null);
      },
      MalformedJsonError: () => {
        toast.error('Registration failed', {
          description: 'Received malformed data from server. Please try again later.',
        });
        return Effect.succeed(null);
      },
      AbortError: () => {
        toast.info('Registration failed', {
          description: 'Registration request was aborted. Please try again.',
        });
        return Effect.succeed(null);
      },
      FetchError: () => {
        toast.error('Registration failed', {
          description: 'Network error occurred while trying to register user.',
        });
        return Effect.succeed(null);
      },
    }),
    Effect.tap((payload) => {
      if (payload == null) {
        return;
      }

      toast.success(`Welcome, ${payload.username}!`);
    })
  );

export function useRegisterUser() {
  const setUser = useSetAtom(userAtom);

  const mutation = useMutation({
    mutationKey: ['register'] as const,
    mutationFn: (credentials: RegisterCredentials) =>
      fetchUserProgram(credentials).pipe(
        Effect.withConfigProvider(envConfigProvider),
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.ensureErrorType<never>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (data) => {
      const user = data ?? null;

      setUser(user);
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
}
