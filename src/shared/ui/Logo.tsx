import { Text } from '@radix-ui/themes';
import * as React from 'react';

export const Logo = React.memo(() => {
  return (
    <Text size='4' weight='bold'>
      Ask it!
    </Text>
  );
});
