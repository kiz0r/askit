import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import type { QuizId } from './QuizId';

export const deleteQuiz = Effect.fn('deleteQuiz')(function* (quizId: QuizId) {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/quiz/${quizId}`;

  const request = Request.unsafeMake({
    url,
    method: 'DELETE',
    credentials: 'include',
  });

  const response = yield* Fetch.fetch(request);

  return response;
});
