import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { AppHeader } from '@/app/AppHeader';
import { authStateAtom } from '@/entities/user';
import { AuthErrorListener } from '@/features/auth';
import { Skeleton } from '@/shared/ui';

const AppLayout = () => {
  const authState = useAtomValue(authStateAtom);

  // Show loading while checking authentication
  if (authState._tag === 'loading') {
    return (
      <>
        <AppHeader />
        <main className='page-content-container py-8 grow flex flex-col gap-4'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-40 w-full' />
        </main>
      </>
    );
  }

  // Redirect to login if not authenticated or session expired
  if (authState._tag !== 'authenticated') {
    return <Navigate to='/auth/login' />;
  }

  return (
    <AuthErrorListener>
      <AppHeader />
      <main className='page-content-container py-8 grow flex flex-col'>
        <Outlet />
      </main>
    </AuthErrorListener>
  );
};

export const Route = createFileRoute('/(app)/_appLayout')({
  component: AppLayout,
});
