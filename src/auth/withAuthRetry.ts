import { Data, Effect } from 'effect';
import { Response } from 'fx-fetch';
import { refreshJwtToken } from './refreshJwtToken';

/**
 * Error indicating that the user session has expired and re-authentication is required.
 */
export class SessionExpiredError extends Data.TaggedError('SessionExpiredError') {}

/**
 * Effect combinator that retries the given effect after attempting to refresh the JWT token if it fails with a 401 Unauthorized error.
 */
export const withAuthRetry = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  self.pipe(
    Effect.catchIf(
      (error) => error instanceof Response.NotOkError && error.response.status === 401,
      () =>
        refreshJwtToken().pipe(
          Effect.flatMap(() => self), // Retry the original request after refresh
          Effect.mapError(() => new SessionExpiredError())
        )
    )
  );
