import { Effect, Function as Fn } from 'effect';
import { Fetch, Response } from 'fx-fetch';
import { toast } from '@/shared/toasts';

type StandardHttpErrors =
  | Response.NotOkError
  | Fetch.NotAllowedError
  | Fetch.AbortError
  | Fetch.FetchError;

type StandardTag = 'NotOkError' | 'NotAllowedError' | 'AbortError' | 'FetchError';

const isTaggedError = (error: unknown): error is { readonly _tag: string } =>
  typeof error === 'object' && error !== null && '_tag' in error && typeof error._tag === 'string';

const isStandardError = (error: unknown): error is StandardHttpErrors =>
  isTaggedError(error) &&
  ['NotOkError', 'NotAllowedError', 'AbortError', 'FetchError'].includes(error._tag);

export type WithStandardErrorsOptions<T> = {
  /**
   * The action being performed (e.g., "create quiz", "fetch quizzes").
   * Used in toast messages: "Failed to {action}"
   */
  readonly action: string;

  /**
   * The fallback value to return when an error occurs.
   * The error is handled with a toast notification and the Effect
   * succeeds with this fallback value.
   */
  readonly fallback: T;
};

const withStandardErrorsFn = <A, E, R, T>(
  self: Effect.Effect<A, E, R>,
  options: WithStandardErrorsOptions<T>
): Effect.Effect<A | T, Exclude<E, StandardHttpErrors>, R> =>
  Effect.catchIf(self, isStandardError, (error) => {
    const tag = error._tag as StandardTag;

    switch (tag) {
      case 'NotOkError':
        return toast.handle<T, Response.NotOkError>('error', {
          title: `Failed to ${options.action}`,
          description: (e) => e.message,
          fallback: options.fallback,
        })(error as Response.NotOkError);

      case 'NotAllowedError':
        return toast.handle<T, Fetch.NotAllowedError>('error', {
          title: `Failed to ${options.action}`,
          description: 'You are not allowed to perform this action.',
          fallback: options.fallback,
        })(error as Fetch.NotAllowedError);

      case 'AbortError':
        return toast.handle<T, Fetch.AbortError>('info', {
          title: 'Request cancelled',
          description: 'The request was cancelled. Please try again.',
          fallback: options.fallback,
        })(error as Fetch.AbortError);

      case 'FetchError':
        return toast.handle<T, Fetch.FetchError>('error', {
          title: `Failed to ${options.action}`,
          description: 'Network error occurred. Please check your connection.',
          fallback: options.fallback,
        })(error as Fetch.FetchError);
    }
  }) as Effect.Effect<A | T, Exclude<E, StandardHttpErrors>, R>;

/**
 * Handles standard HTTP errors (NotOkError, NotAllowedError, AbortError, FetchError)
 * with consistent toast notifications.
 *
 * Use this when you want to catch all standard HTTP errors and show user-friendly
 * messages. The Effect will succeed with the fallback value on error.
 *
 * Can be used data-first or data-last (pipeable).
 *
 * @example
 * ```ts
 * // Pipeable (data-last)
 * const program = getQuizzes().pipe(
 *   withStandardErrors({ action: 'fetch quizzes', fallback: [] })
 * );
 *
 * // Data-first
 * const program = withStandardErrors(
 *   createQuiz(input),
 *   { action: 'create quiz', fallback: null }
 * );
 * ```
 */
export const withStandardErrors: {
  // Data-last (pipeable)
  <T>(
    options: WithStandardErrorsOptions<T>
  ): <A, E, R>(
    self: Effect.Effect<A, E, R>
  ) => Effect.Effect<A | T, Exclude<E, StandardHttpErrors>, R>;

  // Data-first
  <A, E, R, T>(
    self: Effect.Effect<A, E, R>,
    options: WithStandardErrorsOptions<T>
  ): Effect.Effect<A | T, Exclude<E, StandardHttpErrors>, R>;
} = Fn.dual(2, withStandardErrorsFn);
