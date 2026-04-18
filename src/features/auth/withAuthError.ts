import { Effect } from 'effect';
import { Response } from 'fx-fetch';
import { SessionExpiredError } from '@/shared/api';

/**
 * Catches any 401 auth error and converts to SessionExpiredError.
 * Use on all protected endpoints.
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

        if (error.response.status === 401) {
          // We want to convert all 401 errors to session expired
          return yield* new SessionExpiredError();
        }

        return yield* error;
      })
    )
  );
