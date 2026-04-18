import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz, type QuizId } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl, withStructuredError } from '@/shared/api';
import { type QuizFormInput, QuizFormInputSchema } from '../QuizFormInput';
import {
  InvalidQuizDataError,
  QuizAccessDeniedError,
  QuizNotFoundError,
  QuizPublishedError,
} from './errors';

const encodeBody = Schema.parseJson(QuizFormInputSchema).pipe(Schema.encode);

export const editQuiz = Effect.fn('editQuiz')(
  function* (quizId: QuizId, input: QuizFormInput) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}`;

    const request = Request.unsafeMake({
      url,
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: yield* encodeBody(input),
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withAuthError,
      withStructuredError('INVALID_QUIZ_DATA', () => new InvalidQuizDataError()),
      withStructuredError('QUIZ_ACCESS_DENIED', () => new QuizAccessDeniedError()),
      withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError()),
      withStructuredError('QUIZ_PUBLISHED', () => new QuizPublishedError())
    );
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);
