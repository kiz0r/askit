import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
};

/**
 * Card layout component used for auth forms
 */
export const AuthCard = React.memo((props: Props) => {
  const withFooter = props.footer != null;

  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        {props.description != null ? <CardDescription>{props.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{props.children}</CardContent>
      {withFooter ? <CardFooter className='py-2'>{props.footer}</CardFooter> : null}
    </Card>
  );
});

AuthCard.displayName = 'AuthCard';
