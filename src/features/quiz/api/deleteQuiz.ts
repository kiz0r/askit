import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { QuizAccessDeniedError, QuizNotFoundError } from './errors';

export const deleteQuiz = Effect.fn('deleteQuiz')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}`;

    const request = Request.unsafeMake({
      url,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return yield* Fetch.fetch(request).pipe(
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message })),
      withStructuredError('QUIZ_ACCESS_DENIED', (message) => new QuizAccessDeniedError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
