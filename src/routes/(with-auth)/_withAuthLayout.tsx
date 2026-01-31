import { ExitIcon } from '@radix-ui/react-icons';
import { Avatar, Button, Popover, Separator, Spinner, Text } from '@radix-ui/themes';
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { AppearanceSelect } from '../../appearance/AppearanceSelect';
import { useLogout } from '../../auth/useLogout';
import { isUserLoadingAtom, userAtom } from '../../store';
import styles from './Header.module.scss';

const AppHeader = React.memo(() => {
  const user = useAtomValue(userAtom);

  const logout = useLogout();

  const userInitials = React.useMemo(() => {
    if (user === null) {
      // Should not happen
      return null;
    }

    return user.username.charAt(0);
  }, [user]);

  if (user === null) {
    // Should not happen
    return null;
  }

  return (
    <header className={styles.Header}>
      <div className={styles.Header__Container}>
        <Text size='6'>🚧</Text>
        <div className={styles.Header__RightContent}>
          <Popover.Root>
            <Popover.Trigger>
              <div className={styles.Header__AvatarContainer}>
                <Avatar fallback={userInitials ?? '—'} radius='full' />
              </div>
            </Popover.Trigger>
            <Popover.Content className={styles.Header__PopoverContent}>
              <div className={styles.Header__UserInfo}>
                <Text size='2' weight='bold'>
                  {user.username}
                </Text>
                <Text size='2' color='gray'>
                  {user.email}
                </Text>
              </div>
              <Separator size='4' />

              <div className={styles.Header__PopoverActions}>
                <AppearanceSelect />
              </div>

              <Separator size='4' />

              <div className={styles.Header__PopoverActions}>
                <Button
                  size='1'
                  variant='surface'
                  color='red'
                  loading={logout.isLoading}
                  onClick={() => {
                    logout.execute();
                  }}
                >
                  Log out
                  <ExitIcon />
                </Button>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    </header>
  );
});

export const Route = createFileRoute('/(with-auth)/_withAuthLayout')({
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
      <>
        <AppHeader />
        <Outlet />
      </>
    );
  },
});
