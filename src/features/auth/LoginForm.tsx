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
import { type LoginCredentials, LoginCredentialsSchema, loginUser } from './api/loginUser';

const program = (credentials: LoginCredentials) =>
  loginUser(credentials).pipe(
    Effect.retry({
      while: isAuthErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.intersect(Schedule.recurs(3)),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        Toast.danger({ title: 'Login failed', description: getDescriptiveErrorMessage(error) });
      })
    )
  );

export const LoginForm = () => {
  const setAuthState = useSetAtom(authStateAtom);
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: effectTsResolver(LoginCredentialsSchema),
  });

  const loginMutation = useMutation({
    mutationKey: ['login'] as const,
    mutationFn: (credentials: LoginCredentials) =>
      program(credentials).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: (user) => {
      setAuthState(AuthState.authenticated(user));
      form.reset();
      navigate({ to: '/quizzes' });
    },
    onError: () => {
      setAuthState(AuthState.unauthenticated());
    },
  });

  return (
    <AuthCard
      title='Login'
      description='Welcome back! Please enter your credentials to continue.'
      footer={
        <div className='grow flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>
            Don't have an account?
            <Button asChild variant='link' className='py-0 px-1 text-foreground'>
              <Link to='/auth/register'>Get started!</Link>
            </Button>
          </p>
        </div>
      }
    >
      <form
        className='flex flex-col gap-3'
        onSubmit={form.handleSubmit((data) => {
          loginMutation.mutate(data);
        })}
      >
        <Controller
          name='email'
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input {...field} autoComplete='off' type='email' />
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
                  autoComplete='off'
                  type={isPasswordVisible ? 'text' : 'password'}
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

        <Button type='submit' loading={loginMutation.isPending} disabled={!form.formState.isValid}>
          Login
        </Button>
      </form>
    </AuthCard>
  );
};
