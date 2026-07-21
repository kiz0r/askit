import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { InvalidQuizDataError } from './errors';

export const importQuiz = Effect.fn('importQuiz')(
  function* (data: unknown) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/import`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withStructuredError('INVALID_QUIZ_DATA', (message) => new InvalidQuizDataError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
