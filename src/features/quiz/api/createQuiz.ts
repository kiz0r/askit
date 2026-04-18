import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl, withStructuredError } from '@/shared/api';
import { type QuizFormInput, QuizFormInputSchema } from '../QuizFormInput';
import { InvalidQuizDataError } from './errors';

const encodeBody = Schema.parseJson(QuizFormInputSchema).pipe(Schema.encode);

export const createQuiz = Effect.fn('createQuiz')(
  function* (input: QuizFormInput) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: yield* encodeBody(input),
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withAuthError,
      withStructuredError('INVALID_QUIZ_DATA', () => new InvalidQuizDataError())
    );
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);
