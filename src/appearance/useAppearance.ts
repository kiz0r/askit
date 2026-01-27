import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Appearance } from './Appearance';

/**
 * @internal
 * This is correct to declare atom not in store.
 * We want to encapsulate appearance state management within appearance module
 */
const appearanceAtom = atomWithStorage<Appearance>('appearance', 'light', {
  getItem: (key) => {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue === 'light' || storedValue === 'dark') {
      return storedValue;
    }

    window.localStorage.setItem(key, 'light');

    return 'light';
  },
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
  },
});

/**
 * Hook to manage application appearance style with persistence in local storage.
 *
 * @see {@link Appearance}
 * @see {@link appearanceAtom}
 */
export const useAppearance = () => {
  const [style, setStyle] = useAtom(appearanceAtom);

  return {
    style,
    setStyle,
  } as const;
};
