import { type ExternalToast, toast as sonnerToast } from 'sonner';
import type { ShowOptions, ToastIntent } from './ToastOptions';

type ShorthandOptions = {
  readonly title: string;
  readonly description?: string;
  readonly toastOptions?: ExternalToast;
};

const getSonnerByIntent = (intent: ToastIntent) => {
  switch (intent) {
    case 'success': {
      return sonnerToast.success;
    }

    case 'warning': {
      return sonnerToast.warning;
    }

    case 'danger': {
      return sonnerToast.error;
    }

    case 'neutral': {
      return sonnerToast.info;
    }

    default: {
      const _exhaustiveCheck: never = intent;
      return _exhaustiveCheck;
    }
  }
};

/**
 * Shows a toast notification.
 *
 * @example
 * ```ts
 * Toast.show({ intent: 'success', title: 'Saved!' })
 * Toast.show({ intent: 'danger', title: 'Error', description: 'Try again' })
 * ```
 */
const toast = ({ intent, title, description, toastOptions }: ShowOptions): void => {
  getSonnerByIntent(intent)(title, { description, ...toastOptions });
};

const success = (options: ShorthandOptions): void => toast({ intent: 'success', ...options });

const warning = (options: ShorthandOptions): void => toast({ intent: 'warning', ...options });

const danger = (options: ShorthandOptions): void => toast({ intent: 'danger', ...options });

const neutral = (options: ShorthandOptions): void => toast({ intent: 'neutral', ...options });

export const Toast = { toast: toast, success, warning, danger, neutral } as const;
