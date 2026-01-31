import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Button, IconButton, Link, Text } from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AuthCard } from './AuthCard';
import { InputField } from './InputField';
import styles from './RegisterForm.module.scss';
import { type RegisterCredentials, RegisterCredentialsSchema } from './registerUser';
import { useRegisterUser } from './useRegister';

export const RegisterForm = React.memo(() => {
  const [isPasswordVisible, setPasswordVisible] = React.useState(false);

  const form = useForm<RegisterCredentials>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    resolver: effectTsResolver(RegisterCredentialsSchema),
  });

  const registerUser = useRegisterUser();

  return (
    <AuthCard
      title='Register'
      description='Create a new account to get started.'
      footer={
        <>
          <Text as='p'>Already have an account?</Text>
          <Link asChild>
            <RouterLink to='/auth/login'>Sign in now!</RouterLink>
          </Link>
        </>
      }
    >
      <form
        className={styles.RegisterForm__Form}
        onSubmit={form.handleSubmit((data) => {
          registerUser.execute(data);
        })}
      >
        <InputField control={form.control} name='username' label='Username' type='text' />

        <InputField control={form.control} name='email' label='Email' type='email' />

        <InputField
          control={form.control}
          name='password'
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

        <Button type='submit' loading={registerUser.isLoading} disabled={!form.formState.isValid}>
          Create Account
        </Button>
      </form>
    </AuthCard>
  );
});
