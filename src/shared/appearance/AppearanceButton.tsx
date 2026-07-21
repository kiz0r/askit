import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useAppearance } from './useAppearance';

export const AppearanceButton = () => {
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
      {appearance.resolvedMode === 'light' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};
