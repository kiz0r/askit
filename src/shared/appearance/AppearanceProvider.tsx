import * as React from 'react';
import { useAppearance } from './useAppearance';

type Props = {
  readonly children: React.ReactNode;
};

/**
 * Provider component that syncs the appearance mode to the document element.
 * Automatically applies 'light' or 'dark' class to the root HTML element.
 */
export const AppearanceProvider = (props: Props) => {
  const appearance = useAppearance();

  React.useEffect(() => {
    const rootElement = window.document.documentElement;
    rootElement.classList.remove('light', 'dark');
    rootElement.classList.add(appearance.resolvedMode);
  }, [appearance.resolvedMode]);

  return <>{props.children}</>;
};
