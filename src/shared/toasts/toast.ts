import { Effect, Function as Fn } from 'effect';
import { toast as sonnerToast } from 'sonner';
import type { HandleOptions, ToastOptions, ToastType } from './ToastOptions';

const normalizeFallback = <T>(fallback: T | (() => T)): T => {
  if (Fn.isFunction(fallback)) {
    return fallback();
  }
  return fallback;
};

/**
 * A utility for displaying toast notifications with Effect integration.
 *
 * @example
 * ```ts
 * // Simple notifications
 * toast.success({ title: 'Saved!' });
 * toast.error({ title: 'Failed', description: 'Try again' });
 *
 * // Error handling with context
 * Effect.catchTags({
 *   NotFound: toast.handle('error', {
 *     title: (error) => `${error.resource} not found`,
 *     fallback: null,
 *   }),
 * });
 * ```
 */
export const toast = {
  /**
   * Displays an error notification.
   *
   * @example
   * ```ts
   * toast.error({ title: 'Failed to save', description: 'Please try again.' });
   * ```
   */
  error: (options: ToastOptions) =>
    sonnerToast.error(options.title, {
      description: options.description,
      ...options.toastOptions,
    }),

  /**
   * Displays an info notification.
   *
   * @example
   * ```ts
   * toast.info({ title: 'Session expired', description: 'Please log in again.' });
   * ```
   */
  info: (options: ToastOptions) =>
    sonnerToast.info(options.title, {
      description: options.description,
      ...options.toastOptions,
    }),

  /**
   * Displays a warning notification.
   *
   * @example
   * ```ts
   * toast.warning({ title: 'Rate limit approaching' });
   * ```
   */
  warning: (options: ToastOptions) =>
    sonnerToast.warning(options.title, {
      description: options.description,
      ...options.toastOptions,
    }),

  /**
   * Displays a success notification.
   *
   * @example
   * ```ts
   * toast.success({ title: 'Changes saved!' });
   * ```
   */
  success: (options: ToastOptions) =>
    sonnerToast.success(options.title, {
      description: options.description,
      ...options.toastOptions,
    }),

  /**
   * Shows a notification and succeeds with a fallback value.
   * Designed for use in `Effect.catchTags` to handle errors with toast notifications.
   *
   * The `title` and `description` can be static strings or functions that receive
   * the error object, allowing dynamic messages based on error context.
   *
   * @param type - The type of toast to display ('error' | 'info' | 'warning' | 'success')
   * @param options - Configuration for the toast and fallback value
   * @returns A function that takes an error and returns an Effect succeeding with the fallback
   *
   * @example
   * ```ts
   * // Static messages
   * Effect.catchTags({
   *   NotFound: toast.handle('error', {
   *     title: 'Resource not found',
   *     fallback: null,
   *   }),
   * });
   *
   * // Dynamic messages with error context
   * Effect.catchTags({
   *   ValidationError: toast.handle('warning', {
   *     title: (error) => `Invalid ${error.field}`,
   *     description: (error) => error.message,
   *     fallback: 'VALIDATION_FAILED',
   *   }),
   * });
   * ```
   */
  handle<T, E>(
    type: ToastType,
    options: HandleOptions<T, E>
  ): (error: E) => Effect.Effect<T, never, never> {
    return (error: E) => {
      const title = typeof options.title === 'function' ? options.title(error) : options.title;
      const description =
        typeof options.description === 'function'
          ? options.description(error)
          : options.description;

      toast[type]({ title, description, toastOptions: options.toastOptions });

      return Effect.succeed(normalizeFallback(options.fallback));
    };
  },
} as const;
