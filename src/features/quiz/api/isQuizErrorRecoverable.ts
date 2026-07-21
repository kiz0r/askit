import { SessionExpiredError } from '@/entities/user';
import { type HttpError, isHttpErrorRecoverable } from '@/shared/api';
import {
  InvalidQuizDataError,
  QuizAccessDeniedError,
  QuizNotFoundError,
  QuizPublishedError,
} from './errors';

type QuizError =
  | SessionExpiredError
  | QuizNotFoundError
  | QuizAccessDeniedError
  | QuizPublishedError
  | InvalidQuizDataError
  | HttpError;

/**
 * Recoverability predicate for quiz endpoints: every domain error (and an expired
 * session) is a definitive outcome that will not change on retry, so only the
 * transport-level errors (delegated to {@link isHttpErrorRecoverable}) are retried.
 *
 * Adding a new quiz-domain error to the channel without handling it here will fail
 * to type-check at the `isHttpErrorRecoverable` call, forcing a decision.
 */
export function isQuizErrorRecoverable(error: QuizError): boolean {
  if (error instanceof SessionExpiredError) {
    return false;
  }

  if (error instanceof QuizNotFoundError) {
    return false;
  }

  if (error instanceof QuizAccessDeniedError) {
    return false;
  }

  if (error instanceof QuizPublishedError) {
    return false;
  }

  if (error instanceof InvalidQuizDataError) {
    return false;
  }

  return isHttpErrorRecoverable(error);
}
