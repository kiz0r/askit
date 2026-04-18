import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import * as React from 'react';
import type { AppearanceMode, ResolvedAppearanceMode } from './AppearanceMode';
import { prefersDarkMode } from './prefersDarkMode';

const defaultAppearanceMode: AppearanceMode = 'system';
const appearanceLocalStorageKey = 'askit::appearance';

function validateAppearanceMode(value: unknown): value is AppearanceMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Atom for managing application appearance mode with persistence in local storage.
 * This is declared in the appearance module to encapsulate state management.
 *
 * @see {@link AppearanceMode}
 */
const appearanceAtom = atomWithStorage<AppearanceMode>(
  appearanceLocalStorageKey,
  defaultAppearanceMode,
  {
    getItem: (key) => {
      const storedValue = window.localStorage.getItem(key);

      if (validateAppearanceMode(storedValue)) {
        return storedValue;
      }

      window.localStorage.setItem(key, defaultAppearanceMode);
      return defaultAppearanceMode;
    },
    setItem: (key, value) => {
      window.localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      window.localStorage.removeItem(key);
    },
  }
);

/**
 * Resolves the effective appearance mode.
 * If mode is `system`, returns the actual system preference (`light` or `dark`).
 * Otherwise returns the mode as-is.
 */
const resolveAppearanceMode = (mode: AppearanceMode): ResolvedAppearanceMode => {
  if (mode === 'system') {
    return prefersDarkMode() ? 'dark' : 'light';
  }

  return mode;
};

/**
 * Hook to manage application appearance style with persistence in local storage.
 *
 * @see {@link AppearanceMode}
 * @see {@link ResolvedAppearanceMode}
 * @see {@link appearanceAtom}
 */
export const useAppearance = () => {
  const [mode, setMode] = useAtom(appearanceAtom);
  const resolvedMode = React.useMemo(() => resolveAppearanceMode(mode), [mode]);

  return {
    /**
     * The stored appearance mode.
     * @see {@link AppearanceMode}
     */
    mode,
    /**
     * The effective appearance mode.
     * If `mode` is `system`, this will be either `light` or `dark` based on the user's system preference.
     * @see {@link ResolvedAppearanceMode}
     */
    resolvedMode,
    /**
     * Function to update the appearance mode.
     * @see {@link AppearanceMode}
     */
    setMode,
  } as const;
};
