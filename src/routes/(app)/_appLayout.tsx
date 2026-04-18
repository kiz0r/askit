import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { AppHeader } from '@/app/AppHeader';
import { authStateAtom } from '@/entities/user';
import { AuthErrorListener } from '@/features/auth';
import { Spinner } from '@/shared/ui';

const AppLayout = React.memo(() => {
  const authState = useAtomValue(authStateAtom);

  // Show loading while checking authentication
  if (authState._tag === 'loading') {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner />
      </div>
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
});

export const Route = createFileRoute('/(app)/_appLayout')({
  component: AppLayout,
});
