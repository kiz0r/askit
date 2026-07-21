import { Effect, Function as Fn, Option, Schema } from 'effect';
import { Response } from 'fx-fetch';

const ErrorSchema = Schema.Struct({
  errorCode: Schema.String,
  message: Schema.String,
});

function withStructuredErrorFn<A, E, R, TError>(
  self: Effect.Effect<A, E | Response.NotOkError, R>,
  errorCode: string,
  onError: (message: string) => TError
): Effect.Effect<A, E | Response.NotOkError | TError, R> {
  return self.pipe(
    Effect.catchAll((selfErr) =>
      Effect.gen(function* () {
        if (!(selfErr instanceof Response.NotOkError)) {
          // If it's not a NotOkError, we can't handle it here
          return yield* Option.none();
        }

        const response = selfErr.response;
        const payload = yield* Response.readJsonWithSchema(response, ErrorSchema);

        if (payload.errorCode !== errorCode) {
          // Error code does not match, do not handle
          return yield* Option.none();
        }

        return yield* Option.some(onError(payload.message));
      }).pipe(
        Effect.mapError(() => selfErr), // Re-assign original error if parsing fails
        Effect.flatMap(Effect.fail) // Fail with the custom error
      )
    )
  );
}

export const withStructuredError: {
  // Uncurried version
  <A, E, R, TError>(
    self: Effect.Effect<A, E | Response.NotOkError, R>,
    errorCode: string,
    onError: (message: string) => TError
  ): Effect.Effect<A, E | Response.NotOkError | TError, R>;

  // Curried version
  <A, E, R, TError>(
    errorCode: string,
    onError: (message: string) => TError
  ): (
    self: Effect.Effect<A, E | Response.NotOkError, R>
  ) => Effect.Effect<A, E | Response.NotOkError | TError, R>;
} = Fn.dual(3, withStructuredErrorFn);
