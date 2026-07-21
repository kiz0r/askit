import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { useMutation } from '@tanstack/react-query';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { Controller, useForm } from 'react-hook-form';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { Button, Field, FieldError, FieldLabel, Input } from '@/shared/ui';
import { isUserErrorRecoverable } from './api/isUserErrorRecoverable';
import {
  type UpdatePasswordInput,
  UpdatePasswordInputSchema,
  updatePassword,
} from './api/updatePassword';

const program = (input: UpdatePasswordInput) =>
  updatePassword(input).pipe(
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
          title: 'Failed to update password',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

type Props = {
  readonly onSuccess: () => void;
};

export const UpdatePasswordForm = (props: Props) => {
  const onSuccess = props.onSuccess;
  const form = useForm<UpdatePasswordInput>({
    defaultValues: { currentPassword: '', nextPassword: '' },
    resolver: effectTsResolver(UpdatePasswordInputSchema),
    mode: 'onBlur',
  });

  const mutation = useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      program(input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: () => {
      form.reset();
      onSuccess();

      Toast.success({ title: 'Password updated' });
    },
  });

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={form.handleSubmit((data) => {
        mutation.mutate(data);
      })}
    >
      <Controller
        name='currentPassword'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Current password</FieldLabel>
            <Input {...field} type='password' autoComplete='current-password' />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
      <Controller
        name='nextPassword'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>New password</FieldLabel>
            <Input {...field} type='password' autoComplete='new-password' />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Button
        type='submit'
        className='self-end'
        disabled={!form.formState.isValid}
        loading={mutation.isPending}
      >
        Update password
      </Button>
    </form>
  );
};
