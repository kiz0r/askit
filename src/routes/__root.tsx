import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Provider as StoreProvider } from 'jotai';
import { AppearanceProvider } from '../appearance/AppearanceProvider';
import { ErrorBoundary } from '../error-boundary/ErrorBoundary';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { QueryClientProvider } from '../providers/QueryClientProvider';
import { isDev } from '../settings';
import { store } from '../store';
import { Toaster } from '../toaster/Toaster';

export const Route = createRootRoute({
  component: () => (
    <StoreProvider store={store}>
      <AppearanceProvider>
        <ErrorBoundary onError={() => {}}>
          <QueryClientProvider>
            <Outlet />
          </QueryClientProvider>
          <NotificationCenter />
        </ErrorBoundary>
        {isDev ? <TanStackRouterDevtools position='bottom-right' /> : null}
      </AppearanceProvider>
    </StoreProvider>
  ),
});
