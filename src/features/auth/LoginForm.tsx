import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AuthState, authStateAtom } from '@/entities/user';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
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
import { type LoginCredentials, LoginCredentialsSchema, loginUser } from './api/loginUser';

const program = (credentials: LoginCredentials) =>
  loginUser(credentials).pipe(
    Effect.catchTags({
      InvalidCredentialsError: toast.handle('error', {
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        fallback: null,
      }),
      NotOkError: toast.handle('error', {
        title: 'Login failed',
        description: (error) => error.message,
        fallback: null,
      }),
      AbortError: toast.handle('info', {
        title: 'Login stopped',
        description: 'Login request was aborted. Please try again.',
        fallback: null,
      }),
      FetchError: toast.handle('error', {
        title: 'Login failed',
        description: 'Network error occurred while trying to login.',
        fallback: null,
      }),
      UserInactiveError: toast.handle('error', {
        title: 'Login failed',
        description: 'Your account is inactive. Please contact support for assistance.',
        fallback: null,
      }),
    }),
    Effect.tap((result) => {
      if (result === null) {
        // Error happened → notification is already shown
        return;
      }

      toast.success({
        title: `Welcome, ${result.username}`,
      });
    }),
    Effect.ensureErrorType<never>()
  );

export const LoginForm = React.memo(() => {
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
        Effect.ensureErrorType<never>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (user) => {
      if (user == null) {
        setAuthState(AuthState.unauthenticated());
        return;
      }

      setAuthState(AuthState.authenticated(user));
      form.reset();
      navigate({
        to: '/quizzes',
      });
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
              <FieldLabel>Email:</FieldLabel>
              <Input {...field} autoComplete='off' type='email' />
            </Field>
          )}
        />

        <Controller
          name='password'
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Password:</FieldLabel>
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
                    {isPasswordVisible ? <Eye /> : <EyeOff />}
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
});
