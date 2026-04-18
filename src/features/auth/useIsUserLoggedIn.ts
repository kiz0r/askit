import { useAtomValue } from 'jotai';
import { userAtom } from '@/entities/user';

/**
 * Hook to determine if the user is logged in.
 */
export const useIsUserLoggedIn = () => {
  const user = useAtomValue(userAtom);
  return user !== null;
};
