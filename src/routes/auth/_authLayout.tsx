import { createFileRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { UserKeyIcon, UserPlusIcon } from 'lucide-react';
import { authStateAtom } from '@/entities/user';
import { AppearanceButton } from '@/shared/appearance';
import { Button, Logo } from '@/shared/ui';

const AuthLayout = () => {
  const authState = useAtomValue(authStateAtom);
  const location = useLocation();
  const isLoginUrl = location.pathname === '/auth/login';

  // Redirect to dashboard once we know the user is already authenticated.
  // The form below is static, so it's shown immediately while auth is still resolving.
  if (authState._tag === 'authenticated') {
    return <Navigate to='/quizzes' />;
  }

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-muted-200 bg-background'>
        <div className='page-content-container py-2 flex justify-between items-center'>
          <Logo />

          <div className='flex items-center gap-2'>
            <AppearanceButton />

            <Button asChild>
              <Link to={isLoginUrl ? '/auth/register' : '/auth/login'}>
                {isLoginUrl ? (
                  <>
                    Register <UserPlusIcon />
                  </>
                ) : (
                  <>
                    Login <UserKeyIcon />
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
};

export const Route = createFileRoute('/auth/_authLayout')({
  component: AuthLayout,
});
