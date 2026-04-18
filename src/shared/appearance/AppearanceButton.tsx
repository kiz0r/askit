import { Moon, Sun } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/shared/ui';
import { useAppearance } from './useAppearance';

export const AppearanceButton = React.memo(() => {
  const appearance = useAppearance();

  return (
    <Button
      variant='secondary'
      size='icon'
      onClick={() => {
        if (appearance.mode === 'system') {
          appearance.setMode(appearance.resolvedMode === 'light' ? 'dark' : 'light');
          return;
        }

        appearance.setMode(appearance.mode === 'light' ? 'dark' : 'light');
      }}
    >
      {appearance.resolvedMode === 'light' ? <Sun /> : <Moon />}
    </Button>
  );
});
