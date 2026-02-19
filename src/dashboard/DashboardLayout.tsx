import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import styles from './DashboardLayout.module.scss';

type Props = {
  readonly children: React.ReactNode;
};

export const DashboardLayout = React.memo((props: Props) => {
  return (
    <div className={styles.DashboardLayout}>
      <DashboardHeader />
      <main className={styles.DashboardLayout__Content}>{props.children}</main>
    </div>
  );
});
