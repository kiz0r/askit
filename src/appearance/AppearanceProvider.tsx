import { Theme } from '@radix-ui/themes';
import * as React from 'react';
import styles from './AppearanceProvider.module.scss';
import { useAppearance } from './useAppearance';

type Props = {
  readonly children: React.ReactNode;
};

export const AppearanceProvider = React.memo((props: Props) => {
  const appearance = useAppearance();

  return (
    <Theme
      appearance={appearance.style}
      className={styles.AppearanceProvider}
      accentColor='indigo'
      grayColor='auto'
      radius='medium'
      panelBackground='solid'
      scaling='100%'
    >
      {props.children}
    </Theme>
  );
});
