import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AuthLayout } from '../../auth/AuthLayout';

export const Route = createFileRoute('/auth/_authLayout')({
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
});
