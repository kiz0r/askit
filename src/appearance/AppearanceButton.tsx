import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { IconButton } from '@radix-ui/themes';
import * as React from 'react';
import { useAppearance } from './useAppearance';

export const AppearanceButton = React.memo(() => {
  const appearance = useAppearance();

  return (
    <IconButton
      variant='soft'
      onClick={() => {
        appearance.setStyle(appearance.style === 'light' ? 'dark' : 'light');
      }}
    >
      {appearance.style === 'light' ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
});
