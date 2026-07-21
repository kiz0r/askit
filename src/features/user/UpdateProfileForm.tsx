import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { SessionExpiredError, userAtom } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { Button, Field, FieldLabel, Input } from '@/shared/ui';
import { isUserErrorRecoverable } from './api/isUserErrorRecoverable';
import { updateProfile } from './api/updateProfile';

const program = (username: string) =>
  updateProfile({ username }).pipe(
    Effect.retry({
      while: isUserErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to update profile',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

function validateUsername(username: string, originalUsername: string) {
  const isMatch = username === originalUsername;
  if (isMatch) {
    return false;
  }

  return true;
}

type Props = {
  readonly onSuccess: () => void;
};

export const UpdateProfileForm = (props: Props) => {
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  const [username, setUsername] = React.useState(() => user?.username ?? '');

  const mutation = useMutation({
    mutationFn: (username: string) =>
      program(username).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getUser'] as const,
      });

      props.onSuccess();
      Toast.success({ title: 'Profile updated' });
    },
  });

  if (user === null) {
    return null;
  }

  const isFormValid = validateUsername(username, user.username);

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(username);
      }}
    >
      <Field>
        <FieldLabel>Username</FieldLabel>
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete='off'
          autoFocus
        />
      </Field>

      <Button
        type='submit'
        className='self-end'
        disabled={!isFormValid}
        loading={mutation.isPending}
      >
        Update
      </Button>
    </form>
  );
};
