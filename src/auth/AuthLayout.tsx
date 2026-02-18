import { Button, Text } from '@radix-ui/themes';
import { Link as RouterLink, useLocation, useNavigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { AppearanceButton } from '../appearance/AppearanceButton';
import { isUserLoadingAtom } from '../store';
import { useIsUserLoggedIn } from '../user/useIsUserLoggedIn';
import styles from './AuthLayout.module.scss';

type Props = {
  readonly children: React.ReactNode;
};

export const AuthLayout = React.memo((props: Props) => {
  const isUserLoggedIn = useIsUserLoggedIn();
  const isLoading = useAtomValue(isUserLoadingAtom);

  const location = useLocation();
  const navigate = useNavigate();

  const isLoginUrl = React.useMemo(() => location.pathname === '/auth/login', [location.pathname]);

  React.useEffect(() => {
    if (isLoading) {
      // Still loading, wait
      return;
    }

    if (isUserLoggedIn) {
      navigate({ to: '/quizzes' });
    }
  }, [isUserLoggedIn, isLoading, navigate]);

  return (
    <>
      <header className={styles.AuthLayout__Header}>
        <div className={styles.AuthLayout__HeaderContainer}>
          <Text>Ask It!</Text>

          <div className={styles.AuthLayout__HeaderActions}>
            <AppearanceButton />

            <Button asChild>
              <RouterLink to={isLoginUrl ? '/auth/register' : '/auth/login'}>
                {isLoginUrl ? 'Register' : 'Login'}
              </RouterLink>
            </Button>
          </div>
        </div>
      </header>
      <main className={styles.AuthLayout__Main}>
        <div className={styles.AuthLayout__Container}>{props.children}</div>
      </main>
    </>
  );
});
