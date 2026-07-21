import type { ExternalToast } from 'sonner';

export type ToastIntent = 'success' | 'warning' | 'danger' | 'neutral';

export type ShowOptions = {
  readonly intent: ToastIntent;
  readonly title: string;
  readonly description?: string;
  readonly toastOptions?: ExternalToast;
};
