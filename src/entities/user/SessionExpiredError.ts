import { Data } from 'effect';

/**
 * The user's session has expired and re-authentication is required.
 * Handled globally by AuthErrorListener — redirects to login without retrying.
 */
export class SessionExpiredError extends Data.TaggedError('SessionExpiredError') {}
