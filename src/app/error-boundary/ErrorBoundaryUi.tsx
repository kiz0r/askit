import { Card, Code, Heading } from '@radix-ui/themes';
import * as React from 'react';
import styles from './ErrorBoundaryUi.module.scss';

type Props = {
  readonly error: Error;
};

export const ErrorBoundaryUi = React.memo((props: Props) => {
  return (
    <div className={styles.ErrorBoundaryUi}>
      <Card className={styles.ErrorBoundaryUi__Card}>
        <div className={styles.ErrorBoundaryUi__Header}>
          <Heading as='h1' align='center'>
            We can't handle the following error.
            <br />
            Please refresh the page and try again.
          </Heading>
        </div>

        <div className={styles.ErrorBoundaryUi__Content}>
          <Code color='red'>
            <strong>{props.error.message}</strong>
          </Code>
          <Code color='red'>{props.error.stack}</Code>
        </div>
      </Card>
    </div>
  );
});
