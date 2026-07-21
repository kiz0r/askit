import { absurd } from 'effect';
import { ChevronDownIcon, MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react';
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
    <SunIcon />
    Light
  </>
);

const darkModeItem = (
  <>
    <MoonIcon />
    Dark
  </>
);

const systemModeItem = (
  <>
    <SunMoonIcon />
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

export const AppearanceSelect = () => {
  const appearance = useAppearance();
  const selectedItemContent = getModeItem(appearance.mode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' className='justify-between items-center '>
          <span className='flex items-center gap-2'>{selectedItemContent}</span> <ChevronDownIcon />
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
};
