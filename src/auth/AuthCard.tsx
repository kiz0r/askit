import { Card, Heading, Text } from '@radix-ui/themes';
import * as React from 'react';
import styles from './AuthCard.module.scss';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
};

export const AuthCard = React.memo((props: Props) => {
  const withFooter = props.footer != null;
  return (
    <Card className={styles.AuthCard}>
      <header className={styles.AuthCard__Header}>
        <Heading as='h1' className={styles.AuthCard__Title}>
          {props.title}
        </Heading>
        {props.description != null ? <Text>{props.description}</Text> : null}
      </header>

      <div className={styles.AuthCard__Body}>{props.children}</div>

      {withFooter ? <footer className={styles.AuthCard__Footer}>{props.footer}</footer> : null}
    </Card>
  );
});
