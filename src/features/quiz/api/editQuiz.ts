import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz, type QuizId } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
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
    const baseUrl = yield* AskitServerUrl;
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
      withStructuredError('INVALID_QUIZ_DATA', (message) => new InvalidQuizDataError({ message })),
      withStructuredError(
        'QUIZ_ACCESS_DENIED',
        (message) => new QuizAccessDeniedError({ message })
      ),
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message })),
      withStructuredError('QUIZ_PUBLISHED', (message) => new QuizPublishedError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
