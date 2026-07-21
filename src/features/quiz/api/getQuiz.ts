import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz, type QuizId } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { QuizNotFoundError } from './errors';

export const getQuiz = Effect.fn('getQuiz')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const quiz = yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message }))
    );
    return quiz;
  },
  withAuthError,
  handleContractErrors
);
