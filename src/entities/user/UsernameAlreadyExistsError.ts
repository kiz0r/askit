import { Data } from 'effect';

/**
 * The requested username is taken by another account.
 *
 * Raised both when registering and when editing a profile, so it belongs to the
 * entity the two features share rather than to either of them.
 */
export class UsernameAlreadyExistsError extends Data.TaggedError('UsernameAlreadyExistsError')<{
  readonly message: string;
}> {}
