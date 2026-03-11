import { Data, Effect } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { withStructuredError } from '../api/withStructuredError';
import { Quiz } from './Quiz';
import type { QuizId } from './QuizId';

class QuizNotFoundError extends Data.TaggedError('QuizNotFoundError') {}

export const getQuiz = Effect.fn('getQuiz')(function* (quizId: QuizId) {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/quiz/${quizId}`);

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const quiz = yield* Fetch.fetchJsonWithSchema(request, Quiz).pipe(
    withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError())
  );
  return quiz;
});
