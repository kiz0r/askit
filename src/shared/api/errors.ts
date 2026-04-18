import { Data } from 'effect';

/**
 * Error indicating that the user session has expired and re-authentication is required.
 * Used across features to signal that the user needs to log in again.
 */
export class SessionExpiredError extends Data.TaggedError('SessionExpiredError') {}
