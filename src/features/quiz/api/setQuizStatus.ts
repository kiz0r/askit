import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz, type QuizId, type QuizStatus } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';
import { InvalidQuizDataError, QuizAccessDeniedError, QuizNotFoundError } from './errors';

export const updateQuizStatus = Effect.fn('updateQuizStatus')(
  function* (quizId: QuizId, status: QuizStatus) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/status`;

    const request = Request.unsafeMake({
      url,
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message })),
      withStructuredError(
        'QUIZ_ACCESS_DENIED',
        (message) => new QuizAccessDeniedError({ message })
      ),
      withStructuredError('INVALID_QUIZ_DATA', (message) => new InvalidQuizDataError({ message }))
    );
  },
  withAuthError,
  withValidationError,
  handleContractErrors
);
