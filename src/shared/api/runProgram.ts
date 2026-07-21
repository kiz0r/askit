import { Cause, Effect, Exit } from 'effect';

/**
 * Runs an Effect as a Promise at the TanStack Query boundary.
 *
 * `Effect.runPromise` rejects with a `FiberFailure` wrapper rather than the error
 * the Effect failed with, so a rejection stored as a query/mutation `state.error`
 * never matches an `instanceof` check against a domain error. This runs the effect
 * to an `Exit` instead and, on failure, rejects with the original error extracted
 * from the `Cause`, so `state.error` holds the real (typed) error.
 */
export const runProgram = <A>(
  effect: Effect.Effect<A, unknown, never>,
  options?: { readonly signal?: AbortSignal }
): Promise<A> =>
  Effect.runPromiseExit(effect, options).then((exit) =>
    Exit.isSuccess(exit) ? exit.value : Promise.reject(Cause.squash(exit.cause))
  );
