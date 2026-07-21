import { ConfigError, Effect, ParseResult } from 'effect';
import { Cause } from 'fx-fetch';

/**
 * Handles contract-violation errors, leaving every other error intact.
 *
 * `ConfigError`, `MalformedJsonError`, and `ParseError` mean the code or the
 * server contract is wrong — they are bugs, not recoverable runtime conditions.
 * They are removed from the error channel (turned into defects via `Effect.die`)
 * so callers never have to retry them or surface them to the user. Applied once
 * per endpoint as `Effect.fn` middleware, unlike retry/toast which are decided
 * per call site.
 */
export function handleContractErrors<A, E, R>(
  input: Effect.Effect<
    A,
    E | ConfigError.ConfigError | Cause.MalformedJsonError | ParseResult.ParseError,
    R
  >
): Effect.Effect<A, E, R> {
  return input.pipe(
    Effect.catchIf(ConfigError.isConfigError, (cause) => Effect.die(cause)),
    Effect.catchIf(
      (error): error is Cause.MalformedJsonError => error instanceof Cause.MalformedJsonError,
      (cause) => Effect.die(cause)
    ),
    Effect.catchIf(
      (error): error is ParseResult.ParseError => error instanceof ParseResult.ParseError,
      (cause) => Effect.die(cause)
    )
  );
}
