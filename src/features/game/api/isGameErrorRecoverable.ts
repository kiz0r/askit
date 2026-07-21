import { SessionExpiredError } from '@/entities/user';
import { type HttpError, isHttpErrorRecoverable, ValidationError } from '@/shared/api';
import {
  GameAlreadyStartedError,
  HostCannotJoinError,
  NicknameAlreadyTakenError,
  RoomFullError,
  RoomNotFoundError,
} from './errors';

type GameError =
  | SessionExpiredError
  | RoomNotFoundError
  | NicknameAlreadyTakenError
  | GameAlreadyStartedError
  | RoomFullError
  | HostCannotJoinError
  | ValidationError
  | HttpError;

/**
 * Recoverability predicate for game endpoints: an expired session and every join
 * outcome are definitive, so only the transport-level errors (delegated to
 * {@link isHttpErrorRecoverable}) are retried.
 *
 * Adding a new game-domain error to the channel without handling it here will fail
 * to type-check at the `isHttpErrorRecoverable` call, forcing a decision.
 */
export function isGameErrorRecoverable(error: GameError): boolean {
  if (error instanceof SessionExpiredError) {
    return false;
  }

  if (error instanceof RoomNotFoundError) {
    return false;
  }

  if (error instanceof NicknameAlreadyTakenError) {
    return false;
  }

  if (error instanceof GameAlreadyStartedError) {
    return false;
  }

  if (error instanceof RoomFullError) {
    return false;
  }

  if (error instanceof HostCannotJoinError) {
    return false;
  }

  if (error instanceof ValidationError) {
    return false;
  }

  return isHttpErrorRecoverable(error);
}
