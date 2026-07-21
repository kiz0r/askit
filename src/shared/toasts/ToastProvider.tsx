import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import * as React from 'react';
import { Toaster as BaseToaster } from 'sonner';
import { useAppearance } from '@/shared/appearance';

/**
 * Default duration for toasts in milliseconds.
 */
const DEFAULT_TOAST_DURATION = 2_500;

export const ToastProvider = () => {
  const appearance = useAppearance();

  return (
    <BaseToaster
      theme={appearance.resolvedMode}
      duration={DEFAULT_TOAST_DURATION}
      position='bottom-right'
      icons={{
        success: <CircleCheckIcon className='size-4' />,
        info: <InfoIcon className='size-4' />,
        warning: <TriangleAlertIcon className='size-4' />,
        error: <OctagonXIcon className='size-4' />,
        loading: <Loader2Icon className='size-4 animate-spin' />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
    />
  );
};
