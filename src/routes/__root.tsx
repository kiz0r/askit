import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { UserProvider } from '@/app/providers/UserProvider';
import { ToastProvider } from '@/shared/toasts';
import { TooltipProvider } from '@/shared/ui';

const isDev = import.meta.env.DEV;

export const Route = createRootRoute({
  component: () => (
    <TooltipProvider>
      <UserProvider />
      <Outlet />
      <ToastProvider />

      {isDev ? <TanStackRouterDevtools position='bottom-left' /> : null}
    </TooltipProvider>
  ),
});
