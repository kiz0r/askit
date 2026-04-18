import { absurd } from 'effect';
import { ChevronDown, Moon, Sun, SunMoon } from 'lucide-react';
import * as React from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import type { AppearanceMode } from './AppearanceMode';
import { useAppearance } from './useAppearance';

const lightModeItem = (
  <>
    <Sun />
    Light
  </>
);

const darkModeItem = (
  <>
    <Moon />
    Dark
  </>
);

const systemModeItem = (
  <>
    <SunMoon />
    System
  </>
);

function getModeItem(mode: AppearanceMode) {
  switch (mode) {
    case 'light':
      return lightModeItem;
    case 'dark':
      return darkModeItem;
    case 'system':
      return systemModeItem;

    default:
      return absurd<never>(mode);
  }
}

export const AppearanceSelect = React.memo(() => {
  const appearance = useAppearance();
  const selectedItemContent = React.useMemo(() => getModeItem(appearance.mode), [appearance.mode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' className='justify-between items-center '>
          <span className='flex items-center gap-2'>{selectedItemContent}</span> <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => appearance.setMode('light')}>
          {lightModeItem}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => appearance.setMode('dark')}>
          {darkModeItem}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => appearance.setMode('system')}>
          {systemModeItem}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
