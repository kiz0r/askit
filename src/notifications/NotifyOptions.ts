import type { ExternalToast } from 'sonner';

/**
 * Options for displaying a notification.
 */
export type NotifyOptions = {
  /**
   * The title of the notification.
   */
  readonly title: string;
  /**
   * Optional description providing more details about the notification.
   */
  readonly description?: string;
  /**
   * Toast options to customize the notification behavior.
   */
  readonly toastOptions?: ExternalToast;
};

/**
 * Options for error notification with a fallback value.
 */
export type NotifyAndSucceedOptions<T> = NotifyOptions & {
  /**
   * The fallback value to return after showing the notification.
   * Can be a value or a function that returns the value.
   */
  readonly fallback: T | (() => T);
};
