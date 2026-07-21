import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { SessionExpiredError } from '@/entities/user';
import { Toast } from '@/shared/toasts';

type Props = {
  readonly children: React.ReactNode;
};

export const AuthErrorListener = (props: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isHandlingRef = React.useRef(false);

  React.useEffect(() => {
    const handleSessionExpired = () => {
      if (isHandlingRef.current) {
        return;
      }
      isHandlingRef.current = true;

      // Cancel all pending queries first
      queryClient.cancelQueries();

      Toast.neutral({
        title: 'Session expired',
        description: 'Your session has expired. Please log in again.',
      });

      // Navigate first
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
  }, [queryClient, navigate]);

  return props.children;
};
