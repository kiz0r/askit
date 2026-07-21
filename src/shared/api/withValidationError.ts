import { Effect } from 'effect';
import { Response } from 'fx-fetch';
import { ValidationError } from './ValidationError';
import { withStructuredError } from './withStructuredError';

/**
 * Maps the back-end's generic request-validation error onto an effect: a
 * `NotOkError` whose body carries `errorCode: "VALIDATION_ERROR"` becomes a
 * {@link ValidationError} preserving the server's message, so the offending
 * input is described to the user instead of surfacing as a generic server
 * error. Any other error passes through unchanged. Applied to every endpoint
 * that sends a request body, since the back-end can raise this code on any of
 * them.
 */
export const withValidationError = <A, E, R>(
  self: Effect.Effect<A, E | Response.NotOkError, R>
): Effect.Effect<A, E | Response.NotOkError | ValidationError, R> =>
  withStructuredError(self, 'VALIDATION_ERROR', (message) => new ValidationError({ message }));
