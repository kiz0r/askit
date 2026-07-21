import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';
import { type QuizFormInput, QuizFormInputSchema } from '../QuizFormInput';
import { InvalidQuizDataError } from './errors';

const encodeBody = Schema.parseJson(QuizFormInputSchema).pipe(Schema.encode);

export const createQuiz = Effect.fn('createQuiz')(
  function* (input: QuizFormInput) {
    const baseUrl = yield* AskitServerUrl;
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
      withStructuredError('INVALID_QUIZ_DATA', (message) => new InvalidQuizDataError({ message }))
    );
  },
  withAuthError,
  withValidationError,
  handleContractErrors
);
