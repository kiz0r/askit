import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Provider as StoreProvider } from 'jotai';
import { ErrorBoundary } from '../app/error-boundary/ErrorBoundary';
import { AppearanceProvider } from '../appearance/AppearanceProvider';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { QueryClientProvider } from '../providers/QueryClientProvider';
import { isDev } from '../settings';
import { store } from '../store';
import { UserProvider } from '../user/UserProvider';

export const Route = createRootRoute({
  component: () => (
    <StoreProvider store={store}>
      <AppearanceProvider>
        <ErrorBoundary>
          <QueryClientProvider>
            <UserProvider />
            <Outlet />
          </QueryClientProvider>
          <NotificationCenter />
        </ErrorBoundary>
        {isDev ? <TanStackRouterDevtools position='bottom-right' /> : null}
      </AppearanceProvider>
    </StoreProvider>
  ),
});
