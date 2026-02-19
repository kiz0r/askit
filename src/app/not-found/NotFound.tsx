import { Button, Heading } from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import React from 'react';
import styles from './NotFound.module.scss';

export const NotFound = React.memo(() => {
  return (
    <div className={styles.NotFound}>
      <Heading as='h1'>The page you are looking for does not exist.</Heading>
      <div className={styles.NotFound__Actions}>
        <Button asChild>
          <RouterLink to='/quizzes'>Dashboard</RouterLink>
        </Button>
        <Button variant='surface' asChild>
          <RouterLink to='/'>Home</RouterLink>
        </Button>
      </div>
    </div>
  );
});
