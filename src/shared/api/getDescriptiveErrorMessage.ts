import { Fetch, Response } from 'fx-fetch';

/**
 * Human-readable description for an error surfaced to the user.
 *
 * Transport errors get a generic message (their own message is technical), while
 * every other error — the typed domain errors, which carry the back-end's
 * `message` — is described by that message. Errors that should not be shown at all
 * (aborts, session expiry) are filtered out by the caller before reaching here.
 */
export function getDescriptiveErrorMessage(error: Error): string {
  if (error instanceof Response.NotOkError) {
    if (error.reason === 'server-error') {
      return 'Something went wrong on our end. Please try again.';
    }

    return 'The request could not be completed. Please try again.';
  }

  if (error instanceof Fetch.FetchError || error instanceof Fetch.NotAllowedError) {
    return 'Network error. Please check your connection.';
  }

  if (error.message.length > 0) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
