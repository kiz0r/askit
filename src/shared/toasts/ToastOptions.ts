import type { ExternalToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  readonly title: string;
  readonly description?: string;
  readonly toastOptions?: ExternalToast;
};

export type HandleOptions<A, E> = {
  readonly title: string | ((error: E) => string);
  readonly description?: string | ((error: E) => string);
  readonly fallback: A | (() => A);
  readonly toastOptions?: ExternalToast;
};
