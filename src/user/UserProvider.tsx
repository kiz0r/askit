import React from 'react';
import { useSyncUser } from './useSyncUser';

export const UserProvider = React.memo(() => {
  useSyncUser();

  return null;
});
