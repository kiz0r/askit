import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { AuthState, authStateAtom, SessionExpiredError } from '@/entities/user';
import { Toast } from '@/shared/toasts';

type Props = {
  readonly children: React.ReactNode;
};

export const AuthErrorListener = (props: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAuthState = useSetAtom(authStateAtom);
  const isHandlingRef = React.useRef(false);

  React.useEffect(() => {
    const handleSessionExpired = () => {
      if (isHandlingRef.current) {
        return;
      }
      isHandlingRef.current = true;

      queryClient.cancelQueries();

      // Reset the auth state so the route guard redirects to login. Without this the
      // state stays `authenticated`, and the login route bounces straight back here.
      setAuthState(AuthState.unauthenticated());

      Toast.neutral({
        title: 'Session expired',
        description: 'Your session has expired. Please log in again.',
      });

      navigate({ to: '/auth/login' }).then(() => {
        queryClient.clear();
        isHandlingRef.current = false;
      });
    };

    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      const isUpdated = event.type === 'updated';
      const isError = event.query.state.status === 'error';
      const isSessionExpired = event.query.state.error instanceof SessionExpiredError;

      if (!(isUpdated && isError && isSessionExpired)) {
        return;
      }

      handleSessionExpired();
    });

    const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
      const isUpdated = event.type === 'updated';
      const isError = event.mutation?.state.status === 'error';
      const isSessionExpired = event.mutation?.state.error instanceof SessionExpiredError;

      if (!(isUpdated && isError && isSessionExpired)) {
        return;
      }

      handleSessionExpired();
    });

    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [queryClient, navigate, setAuthState]);

  return props.children;
};
