import { Data, Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { withStructuredError } from '../api/withStructuredError';
import { QuizSchema } from './Quiz';
import type { QuizId } from './QuizId';

class QuizNotFoundError extends Data.TaggedError('QuizNotFoundError') {}

export const fetchQuiz = Effect.fn('fetchQuiz')(function* (quizId: QuizId) {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/quiz/${quizId}`;

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, QuizSchema).pipe(
    withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError())
  );

  return response;
});
