import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { Select, Strong } from '@radix-ui/themes';
import React from 'react';
import type { Appearance } from './Appearance';
import styles from './AppearanceSelect.module.scss';
import { useAppearance } from './useAppearance';

export const AppearanceSelect = React.memo(() => {
  const appearance = useAppearance();

  return (
    <Select.Root
      size='1'
      defaultValue={appearance.style}
      onValueChange={(nextValue: Appearance) => appearance.setStyle(nextValue)}
    >
      <Select.Trigger />
      <Select.Content className={styles.AppearanceSelect__Content} side='right'>
        <Select.Item value='light' className={styles.AppearanceSelect__Item}>
          <div className={styles.AppearanceSelect__Item}>
            <Strong>Light</Strong>
            <SunIcon />
          </div>
        </Select.Item>
        <Select.Item value='dark' className={styles.AppearanceSelect__Item}>
          <div className={styles.AppearanceSelect__Item}>
            <Strong>Dark</Strong>
            <MoonIcon />
          </div>
        </Select.Item>
      </Select.Content>
    </Select.Root>
  );
});
