import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { LogOutIcon, SettingsIcon } from 'lucide-react';
import { userAtom } from '@/entities/user';
import { useLogout } from '@/features/auth';
import { AppearanceButton } from '@/shared/appearance';
import {
  Avatar,
  AvatarFallback,
  Button,
  Logo,
  NavLink,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from '@/shared/ui';

export const AppHeader = () => {
  const user = useAtomValue(userAtom);
  const logout = useLogout();

  const initials = user === null ? null : user.username.charAt(0);

  return (
    <header className='sticky top-0 z-40 border-b border-muted-200 bg-background'>
      <div className='page-content-container flex h-16 justify-between items-center'>
        <div className='flex items-center gap-6'>
          <Logo />
          <nav className='flex items-center gap-1'>
            <NavLink to='/quizzes'>My Quizzes</NavLink>
            <NavLink to='/analytics'>Analytics</NavLink>
            <NavLink to='/history'>History</NavLink>
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <AppearanceButton />

          {initials === null ? (
            <Skeleton className='size-9 rounded-full' />
          ) : (
            <Popover>
              <PopoverTrigger>
                <Avatar>
                  <AvatarFallback className='uppercase bg-primary text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className='max-w-48 p-0'>
                <div className='flex flex-col gap-1 p-1'>
                  <Button size='sm' variant='ghost' className='justify-start' asChild>
                    <Link to='/profile'>
                      <SettingsIcon className='size-4' />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='justify-start'
                    loading={logout.isPending}
                    onClick={() => logout.mutate()}
                  >
                    <LogOutIcon className='size-4' />
                    Log out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
};
