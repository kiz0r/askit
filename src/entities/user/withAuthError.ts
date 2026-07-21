import { Effect } from 'effect';
import { Response } from 'fx-fetch';
import { SessionExpiredError } from './SessionExpiredError';

const UNAUTHORIZED_STATUS = 401;

/**
 * Maps the auth-domain rule "HTTP 401 means the session expired" onto an effect:
 * a `NotOkError` with status 401 becomes a `SessionExpiredError`, any other error
 * passes through unchanged. Lives with the user entity because it encodes a domain
 * transition of the authenticated session, not generic transport handling.
 */
export const withAuthError = <A, E, R>(
  effect: Effect.Effect<A, E | Response.NotOkError, R>
): Effect.Effect<A, E | Response.NotOkError | SessionExpiredError, R> =>
  effect.pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        if (!(error instanceof Response.NotOkError)) {
          return yield* Effect.fail(error);
        }

        if (error.response.status === UNAUTHORIZED_STATUS) {
          return yield* new SessionExpiredError();
        }

        return yield* error;
      })
    )
  );
