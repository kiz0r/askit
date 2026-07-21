import { SessionExpiredError } from '@/entities/user';
import { InvalidCredentialsError, UsernameAlreadyExistsError } from '@/features/auth';
import { type HttpError, isHttpErrorRecoverable } from '@/shared/api';

type UserError =
  | SessionExpiredError
  | UsernameAlreadyExistsError
  | InvalidCredentialsError
  | HttpError;

/**
 * Recoverability predicate for user endpoints: an expired session and the domain
 * errors reused from the auth feature are definitive outcomes, so only the
 * transport-level errors (delegated to {@link isHttpErrorRecoverable}) are retried.
 *
 * Adding a new user-domain error to the channel without handling it here will fail
 * to type-check at the `isHttpErrorRecoverable` call, forcing a decision.
 */
export function isUserErrorRecoverable(error: UserError): boolean {
  if (error instanceof SessionExpiredError) {
    return false;
  }

  if (error instanceof UsernameAlreadyExistsError) {
    return false;
  }

  if (error instanceof InvalidCredentialsError) {
    return false;
  }

  return isHttpErrorRecoverable(error);
}
