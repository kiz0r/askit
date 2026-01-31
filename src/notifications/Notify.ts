import { Effect } from 'effect';
import { toast } from 'sonner';
import type { NotifyAndSucceedOptions, NotifyOptions } from './NotifyOptions';

/**
 * A utility object for displaying different types of notifications.
 *
 */
export const Notify = {
  /**
   * Displays an error notification.
   *
   * @example
   * ```ts
   * Notify.error({ title: 'Failed to save', description: 'Please try again.' });
   * ```
   */
  error(options: NotifyOptions) {
    toast.error(options.title, {
      description: options.description,
      ...options.toastOptions,
    });
  },

  /**
   * Shows an error notification and succeeds with a fallback value.
   * Use this in `Effect.catchTags` to handle errors with notifications.
   *
   * @example
   * ```ts
   * effect.pipe(
   *   Effect.catchTags({
   *     NotOkError: notifyErrorAndSucceed({
   *       title: 'Failed to fetch user',
   *       description: 'Please try again.',
   *       fallback: null,
   *     }),
   *   })
   * );
   * ```
   */
  errorAndSucceed<T>(options: NotifyAndSucceedOptions<T>): () => Effect.Effect<T, never, never> {
    return () => {
      this.error(options);
      const value =
        typeof options.fallback === 'function' ? (options.fallback as () => T)() : options.fallback;
      return Effect.succeed(value);
    };
  },

  /**
   * Displays an info notification.
   *
   * @example
   * ```ts
   * Notify.info({ title: 'Session expired', description: 'Please log in again.' });
   * ```
   */
  info(options: NotifyOptions) {
    toast.info(options.title, {
      description: options.description,
      ...options.toastOptions,
    });
  },

  /**
   * Shows an info notification and succeeds with a fallback value.
   * Use this in `Effect.catchTags` to handle errors with info notifications.
   *
   * @example
   * ```ts
   * effect.pipe(
   *   Effect.catchTags({
   *     SessionExpiredError: notifyInfoAndSucceed({
   *       title: 'Session expired',
   *       description: 'Please log in again.',
   *       fallback: 'SESSION_EXPIRED',
   *     }),
   *   })
   * );
   * ```
   */
  infoAndSucceed<T>(options: NotifyAndSucceedOptions<T>): () => Effect.Effect<T, never, never> {
    return () => {
      this.info(options);
      const value =
        typeof options.fallback === 'function' ? (options.fallback as () => T)() : options.fallback;
      return Effect.succeed(value);
    };
  },

  /**
   * Displays a success notification.
   *
   * @example
   * ```ts
   * Notify.success({ title: 'Saved successfully!' });
   * ```
   */
  success(options: NotifyOptions) {
    toast.success(options.title, {
      description: options.description,
      ...options.toastOptions,
    });
  },

  /**
   * Displays a warning notification.
   *
   * @example
   * ```ts
   * Notify.warning({ title: 'Rate limit approaching', description: 'Slow down requests.' });
   * ```
   */
  warning(options: NotifyOptions) {
    toast.warning(options.title, {
      description: options.description,
      ...options.toastOptions,
    });
  },

  warningAndSucceed<T>(options: NotifyAndSucceedOptions<T>): () => Effect.Effect<T, never, never> {
    return () => {
      this.warning(options);
      const value =
        typeof options.fallback === 'function' ? (options.fallback as () => T)() : options.fallback;
      return Effect.succeed(value);
    };
  },
} as const;
