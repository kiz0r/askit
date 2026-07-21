import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DateTime, Effect } from 'effect';
import { useAtomValue, useSetAtom } from 'jotai';
import { KeyRoundIcon, PencilIcon } from 'lucide-react';
import * as React from 'react';
import { isQuizzesLoadingAtom, quizzesAtom } from '@/entities/quiz';
import { AuthState, authStateAtom, userAtom } from '@/entities/user';
import { runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { deactivateAccount } from './api/deactivateAccount';
import { UpdatePasswordForm } from './UpdatePasswordForm';
import { UpdateProfileForm } from './UpdateProfileForm';

const MemberSinceFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

export const ProfileView = () => {
  const user = useAtomValue(userAtom);
  const setAuthState = useSetAtom(authStateAtom);
  const setQuizzes = useSetAtom(quizzesAtom);
  const setQuizzesLoading = useSetAtom(isQuizzesLoadingAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);

  const deactivate = useMutation({
    mutationKey: ['deactivate-account'] as const,
    mutationFn: () => deactivateAccount().pipe(Effect.provide(applicationLayer), runProgram),
    onSuccess: () => {
      // The account is now inactive and its cookies are cleared, so wipe the
      // per-user cache the same way logout does before redirecting.
      queryClient.clear();
      setQuizzes(new Map());
      setQuizzesLoading(false);
      setAuthState(AuthState.unauthenticated());
      navigate({ to: '/auth/login' });
    },
    onError: () => {
      Toast.danger({
        title: 'Deactivation failed',
        description: 'Your account could not be deactivated. Please try again.',
      });
    },
  });

  if (user === null) {
    return null;
  }

  const initials = user.username.at(0)?.toUpperCase() ?? '';
  const memberSince = MemberSinceFormatter.format(DateTime.toDate(user.createdAt));

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardContent className='flex items-center gap-5'>
          <Avatar className='size-16 text-2xl'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='text-lg font-semibold leading-tight truncate'>{user.username}</p>
              <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogTrigger asChild>
                  <Button size='sm' variant='ghost' className='shrink-0 text-muted-foreground'>
                    <PencilIcon className='size-3.5' />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>Update your username.</DialogDescription>
                  </DialogHeader>
                  <UpdateProfileForm onSuccess={() => setProfileOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
            <p className='text-sm text-muted-foreground mt-0.5'>{user.email}</p>
            <p className='text-xs text-muted-foreground mt-2'>Member since {memberSince}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change the password used to sign in.</CardDescription>
          <CardAction>
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <KeyRoundIcon className='size-4' />
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update password</DialogTitle>
                  <DialogDescription>Choose a strong password.</DialogDescription>
                </DialogHeader>
                <UpdatePasswordForm onSuccess={() => setPasswordOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className='ring-destructive/25'>
        <CardHeader>
          <CardTitle className='text-destructive'>Danger zone</CardTitle>
          <CardDescription>
            Deactivate your account. You'll be signed out and won't be able to log back in.
          </CardDescription>
          <CardAction>
            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
              <DialogTrigger asChild>
                <Button variant='destructive' size='sm'>
                  Deactivate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deactivate account?</DialogTitle>
                  <DialogDescription>
                    You'll be signed out immediately and won't be able to log back in.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className='p-2'>
                  <Button size='sm' variant='ghost' onClick={() => setDeactivateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    disabled={deactivate.isPending}
                    onClick={() => deactivate.mutate()}
                  >
                    {deactivate.isPending ? 'Deactivating…' : 'Deactivate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
};
