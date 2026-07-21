import { type HttpError, isHttpErrorRecoverable } from '@/shared/api';
import {
  AccountLockedError,
  InvalidCredentialsError,
  RegistrationFailedError,
  UserInactiveError,
  UsernameAlreadyExistsError,
} from './errors';

type AuthError =
  | AccountLockedError
  | InvalidCredentialsError
  | RegistrationFailedError
  | UsernameAlreadyExistsError
  | UserInactiveError
  | HttpError;

/**
 * Recoverability predicate for auth endpoints: every auth-domain error is a
 * business outcome that will not change on retry, so only the transport-level
 * errors (delegated to {@link isHttpErrorRecoverable}) are considered recoverable.
 *
 * Adding a new auth-domain error to the channel without handling it here will
 * fail to type-check at the `isHttpErrorRecoverable` call, forcing a decision.
 */
export function isAuthErrorRecoverable(error: AuthError): boolean {
  if (error instanceof AccountLockedError) {
    return false;
  }

  if (error instanceof InvalidCredentialsError) {
    return false;
  }

  if (error instanceof RegistrationFailedError) {
    return false;
  }

  if (error instanceof UsernameAlreadyExistsError) {
    return false;
  }

  if (error instanceof UserInactiveError) {
    return false;
  }

  return isHttpErrorRecoverable(error);
}
