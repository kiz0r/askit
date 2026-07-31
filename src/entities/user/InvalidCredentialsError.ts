import { Data } from 'effect';

/**
 * The submitted password does not match the stored one.
 *
 * Lives in the entity rather than in a feature because both signing in and
 * changing a password raise it, and a feature must not import from a sibling.
 */
export class InvalidCredentialsError extends Data.TaggedError('InvalidCredentialsError')<{
  readonly message: string;
}> {}
