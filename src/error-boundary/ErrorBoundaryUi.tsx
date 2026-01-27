import { Card, Code, Heading, Separator } from '@radix-ui/themes';
import React from 'react';
import styles from './ErrorBoundaryUi.module.scss';

type Props = {
  readonly error: Error;
};

export const ErrorBoundaryUi = React.memo((props: Props) => {
  return (
    <div className={styles.ErrorBoundaryUi}>
      <Card className={styles.ErrorBoundaryUi__Card}>
        <Heading as='h1' align='center'>
          We can't handle the following error.
          <br />
          Please refresh the page and try again.
        </Heading>

        <Separator size='4' decorative className={styles.ErrorBoundaryUi__Separator} />

        <Code color='red'>
          <strong>{props.error.message}</strong>
        </Code>
        <Code color='red'>{props.error.stack}</Code>
      </Card>
    </div>
  );
});
