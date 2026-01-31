import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { envConfigProvider } from '../settings';
import { userAtom } from '../store';
import { logoutUser } from './logoutUser';

const logoutProgram = logoutUser().pipe(
  Effect.catchTags({
    ConfigError: () => Effect.die('Configuration error occurred while logging out.'),
    NotOkError: () => {
      toast.error('Logout failed', {
        description: 'Invalid email or password. Please try again.',
      });
      return Effect.succeed(null);
    },
    ParseError: () => {
      toast.error('Logout failed', {
        description: 'Failed to parse server response. Please try again later.',
      });
      return Effect.succeed(null);
    },
    MalformedJsonError: () => {
      toast.error('Logout failed', {
        description: 'Received malformed data from server. Please try again later.',
      });
      return Effect.succeed(null);
    },
    NotAllowedError: () => {
      toast.error('Logout failed', {
        description: 'Logout not allowed. Please contact support.',
      });
      return Effect.succeed(null);
    },
    AbortError: () => {
      toast.info('Logout failed', {
        description: 'Logout request was aborted. Please try again.',
      });
      return Effect.succeed(null);
    },
    FetchError: () => {
      toast.error('Logout failed', {
        description: 'Network error occurred while trying to logout user.',
      });
      return Effect.succeed(null);
    },
  }),
  Effect.tap((payload) => {
    if (payload == null) {
      return;
    }

    toast.success('You have been logged out successfully.');
  })
);

export const useLogout = () => {
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ['logout'] as const,
    mutationFn: () =>
      logoutProgram.pipe(
        Effect.withConfigProvider(envConfigProvider),
        Effect.provideService(Fetch.Fetch, Fetch.FetchLive),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<never>(),
        Effect.runPromise
      ),
    onSettled: () => {
      // Reset user state on logout
      setUser(null);
      navigate({ to: '/auth/login' });
    },
  });

  return {
    execute: mutation.mutateAsync,
    isLoading: mutation.isPending,
  } as const;
};
