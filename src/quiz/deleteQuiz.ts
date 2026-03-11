import { Effect } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import type { QuizId } from './QuizId';

export const deleteQuiz = Effect.fn('deleteQuiz')(function* (quizId: QuizId) {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/quiz/${quizId}`);

  const request = Request.unsafeMake({
    url,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return yield* Fetch.fetch(request);
});
