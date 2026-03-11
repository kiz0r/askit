import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button, IconButton, Link, Text } from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AuthCard } from './AuthCard';
import { InputField } from './InputField';
import styles from './LoginForm.module.scss';
import { type LoginCredentials, LoginCredentialsSchema } from './loginUser';
import { useLoginUser } from './useLogin';

export const LoginForm = React.memo(() => {
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);

  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: effectTsResolver(LoginCredentialsSchema),
  });

  const values = useWatch({ control: form.control });
  const loginUser = useLoginUser();

  return (
    <AuthCard
      title='Login'
      description='Welcome back! Please enter your credentials to continue.'
      footer={
        <>
          <Text as='p'> Don't have an account?</Text>
          <Link asChild>
            <RouterLink to='/auth/register'>Get started!</RouterLink>
          </Link>
        </>
      }
    >
      <form
        className={styles.LoginForm__Form}
        onSubmit={form.handleSubmit((data) => {
          loginUser.execute(data);
        })}
      >
        <InputField
          value={values.email ?? ''}
          onChange={(value) => form.setValue('email', value, { shouldValidate: true })}
          label='Email'
          type='email'
        />

        <InputField
          value={values.password ?? ''}
          onChange={(value) => form.setValue('password', value, { shouldValidate: true })}
          label='Password'
          type={isPasswordVisible ? 'text' : 'password'}
          rightElement={
            <IconButton
              variant='ghost'
              type='button'
              onClick={() => setPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </IconButton>
          }
        />

        <Button loading={loginUser.isLoading} disabled={!form.formState.isValid} type='submit'>
          Login
        </Button>
      </form>
    </AuthCard>
  );
});
