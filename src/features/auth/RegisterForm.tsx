import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthState, authStateAtom } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import {
  Button,
  Field,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui';
import { AuthCard } from './AuthCard';
import { isAuthErrorRecoverable } from './api/isAuthErrorRecoverable';
import {
  type RegisterCredentials,
  RegisterCredentialsSchema,
  registerUser,
} from './api/registerUser';

const program = (credentials: RegisterCredentials) =>
  registerUser(credentials).pipe(
    Effect.retry({
      while: isAuthErrorRecoverable,
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

        Toast.danger({
          title: 'Registration failed',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

export const RegisterForm = () => {
  const setAuthState = useSetAtom(authStateAtom);
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterCredentials>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    resolver: effectTsResolver(RegisterCredentialsSchema),
  });

  const registerMutation = useMutation({
    mutationKey: ['register'] as const,
    mutationFn: (credentials: RegisterCredentials) =>
      program(credentials).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: (user) => {
      setAuthState(AuthState.authenticated(user));
      navigate({
        to: '/quizzes',
      });
    },
    onError: () => {
      setAuthState(AuthState.unauthenticated());
    },
  });

  return (
    <AuthCard
      title='Registration'
      description='Create a new account to get started.'
      footer={
        <div className='grow flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>
            Already have an account?
            <Button asChild variant='link' className='py-0 px-1 text-foreground'>
              <Link to='/auth/login'>Sign in now!</Link>
            </Button>
          </p>
        </div>
      }
    >
      <form
        className='flex flex-col gap-3'
        onSubmit={form.handleSubmit((data) => {
          registerMutation.mutate(data);
        })}
      >
        <Controller
          name='username'
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input {...field} type='text' autoComplete='off' />
            </Field>
          )}
        />

        <Controller
          name='email'
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input {...field} type='email' autoComplete='off' />
            </Field>
          )}
        />

        <Controller
          name='password'
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete='off'
                />
                <InputGroupAddon align='inline-end'>
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    onClick={() => setPasswordVisible((prev) => !prev)}
                  >
                    {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
        />

        <Button
          type='submit'
          loading={registerMutation.isPending}
          disabled={!form.formState.isValid}
        >
          Create Account
        </Button>
      </form>
    </AuthCard>
  );
};
