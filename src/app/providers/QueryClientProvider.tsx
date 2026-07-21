import { QueryClientProvider as BaseQueryClientProvider, QueryClient } from '@tanstack/react-query';
import * as React from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

type Props = {
  readonly children: React.ReactNode;
};

export const QueryClientProvider = (props: Props) => {
  return <BaseQueryClientProvider client={queryClient}>{props.children}</BaseQueryClientProvider>;
};
