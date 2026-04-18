import { createFileRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { UserKey, UserPlus } from 'lucide-react';
import * as React from 'react';
import { authStateAtom } from '@/entities/user';
import { AppearanceButton } from '@/shared/appearance';
import { Button, Logo, Spinner } from '@/shared/ui';

const AuthLayout = React.memo(() => {
  const authState = useAtomValue(authStateAtom);
  const location = useLocation();
  const isLoginUrl = React.useMemo(() => location.pathname === '/auth/login', [location.pathname]);

  // Show loading while checking authentication
  if (authState._tag === 'loading') {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (authState._tag === 'authenticated') {
    return <Navigate to='/quizzes' />;
  }

  return (
    <>
      <header className='border-b border-muted-200 '>
        <div className='page-content-container py-2 flex justify-between items-center'>
          <Logo />

          <div className='flex items-center gap-2'>
            <AppearanceButton />

            <Button asChild>
              <Link to={isLoginUrl ? '/auth/register' : '/auth/login'}>
                {isLoginUrl ? (
                  <>
                    Register <UserPlus />
                  </>
                ) : (
                  <>
                    Login <UserKey />
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className='flex grow flex-col justify-center'>
        <div className='page-content-container flex justify-center items-center'>
          <Outlet />
        </div>
      </main>
    </>
  );
});

export const Route = createFileRoute('/auth/_authLayout')({
  component: AuthLayout,
});
