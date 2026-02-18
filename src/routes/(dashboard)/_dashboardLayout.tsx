import { Spinner } from '@radix-ui/themes';
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { DashboardLayout } from '../../dashboard/DashboardLayout';
import { isUserLoadingAtom, userAtom } from '../../store';

export const Route = createFileRoute('/(dashboard)/_dashboardLayout')({
  component: () => {
    const user = useAtomValue(userAtom);
    const isUserLoading = useAtomValue(isUserLoadingAtom);

    // Show loading while checking authentication
    if (isUserLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spinner size='3' />
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (user === null) {
      return <Navigate to='/auth/login' />;
    }

    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  },
});
