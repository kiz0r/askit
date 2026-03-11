import { ExitIcon, PlusIcon } from '@radix-ui/react-icons';
import { Avatar, Button, Popover, Text } from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { AppearanceSelect } from '../appearance/AppearanceSelect';
import { useLogout } from '../auth/useLogout';
import { userAtom } from '../store';
import styles from './DashboardHeader.module.scss';

export const DashboardHeader = React.memo(() => {
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
    <header className={styles.DashboardHeader}>
      <div className={styles.DashboardHeader__Container}>
        <div className={styles.DashboardHeader__Logo}>
          <Text size='4' weight='bold'>
            Ask it!
          </Text>
        </div>

        <div className={styles.DashboardHeader__RightContent}>
          <Button asChild variant='solid'>
            <RouterLink to='/quiz/new'>
              <PlusIcon />
              Create Quiz
            </RouterLink>
          </Button>
          <Popover.Root>
            <Popover.Trigger>
              <div className={styles.DashboardHeader__AvatarContainer}>
                <Avatar fallback={userInitials ?? '—'} radius='full' />
              </div>
            </Popover.Trigger>
            <Popover.Content className={styles.DashboardHeader__PopoverContent}>
              <div className={styles.DashboardHeader__UserInfo}>
                <Text size='2' weight='bold'>
                  {user.username}
                </Text>
                <Text size='2' color='gray'>
                  {user.email}
                </Text>
              </div>

              <div className={styles.DashboardHeader__PopoverActions}>
                <AppearanceSelect />

                <Button
                  size='1'
                  variant='surface'
                  color='gray'
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
