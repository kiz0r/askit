import { useAtomValue } from 'jotai';
import { isUserLoadingAtom, userAtom } from '../store';

/**
 * Hook to determine if the user is logged in.
 * Returns: { isLoggedIn: boolean, isLoading: boolean }
 */
export const useIsUserLoggedIn = () => {
  const user = useAtomValue(userAtom);

  return user !== null;
};
