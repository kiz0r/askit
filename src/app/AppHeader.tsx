import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { LogOut, Plus } from 'lucide-react';
import * as React from 'react';
import { userAtom } from '@/entities/user';
import { useLogout } from '@/features/auth';
import { AppearanceSelect } from '@/shared/appearance';
import {
  Avatar,
  AvatarFallback,
  Button,
  Logo,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui';

export const AppHeader = React.memo(() => {
  const user = useAtomValue(userAtom);
  const logout = useLogout();

  const userInitials = React.useMemo(() => {
    if (user === null) {
      return null;
    }
    return user.username.charAt(0).toUpperCase();
  }, [user]);

  if (user === null) {
    // Should never happen because it is a protected route and user must be authenticated.
    return null;
  }

  return (
    <header className='border-b border-muted-200'>
      <div className='page-content-container flex justify-between items-center py-4'>
        <Logo />

        <div className='flex items-center gap-4'>
          <Button asChild>
            <Link to='/quiz/new' className='flex items-center gap-2'>
              <Plus className='w-4 h-4' />
              Create Quiz
            </Link>
          </Button>

          <Popover>
            <PopoverTrigger>
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className='max-w-48 p-0'>
              <div className='flex flex-col'>
                <div className='p-2.5'>
                  <p className='font-semibold'>{user.username}</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{user.email}</p>
                </div>

                <div className='flex flex-col gap-2 p-2.5 border-t border-t-foreground/10'>
                  <AppearanceSelect />
                  <Button
                    size='sm'
                    variant='secondary'
                    loading={logout.isPending}
                    onClick={() => {
                      logout.mutate();
                    }}
                  >
                    Log out
                    <LogOut />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
});
