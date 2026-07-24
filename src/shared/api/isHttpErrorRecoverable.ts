import { Fetch, Response } from 'fx-fetch';

/**
 * The complete set of transport-level errors the `fx-fetch` package can raise.
 * Exported so domain predicates can compose it (list their own errors, then
 * delegate the transport ones to {@link isHttpErrorRecoverable}).
 */
export type HttpError =
  | Fetch.AbortError
  | Fetch.FetchError
  | Fetch.NotAllowedError
  | Response.NotOkError;

// Transient server/infra responses worth retrying. A plain 500 is usually a
// deterministic server bug, so it fails fast rather than being retried.
const RETRYABLE_STATUSES = new Set<number>([429, 502, 503, 504] as const);

const isNotOkErrorRecoverable = (error: Response.NotOkError): boolean =>
  RETRYABLE_STATUSES.has(error.response.status);

/**
 * Utility function to determine if a given HTTP error from the `fx-fetch` package
 * is recoverable (i.e. worth retrying).
 */
export function isHttpErrorRecoverable(error: HttpError): boolean {
  if (error instanceof Fetch.AbortError) {
    return false;
  }

  if (error instanceof Response.NotOkError) {
    return isNotOkErrorRecoverable(error);
  }

  if (error instanceof Fetch.FetchError) {
    return true;
  }

  if (error instanceof Fetch.NotAllowedError) {
    return false;
  }

  const _exhaustiveCheck: never = error;
  return false;
}
