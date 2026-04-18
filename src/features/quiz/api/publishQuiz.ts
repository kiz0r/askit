import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz, type QuizId } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl, withStructuredError } from '@/shared/api';
import { InvalidQuizDataError, QuizAccessDeniedError, QuizNotFoundError } from './errors';

export const publishQuiz = Effect.fn('publishQuiz')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/publish`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withAuthError,
      withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError()),
      withStructuredError('QUIZ_ACCESS_DENIED', () => new QuizAccessDeniedError()),
      withStructuredError('INVALID_QUIZ_DATA', () => new InvalidQuizDataError())
    );
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);

export const unpublishQuiz = Effect.fn('unpublishQuiz')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/unpublish`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withAuthError,
      withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError()),
      withStructuredError('QUIZ_ACCESS_DENIED', () => new QuizAccessDeniedError())
    );
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);
