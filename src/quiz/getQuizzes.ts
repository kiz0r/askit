import { Effect, Schema } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { Quiz } from './Quiz';

const ResultSchema = Schema.Struct({
  items: Quiz.pipe(Schema.Array),
});

export const getQuizzes = Effect.fn('getQuizzes')(function* () {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/quiz`);

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const quizzes = yield* Fetch.fetchJsonWithSchema(request, ResultSchema);
  return quizzes.items;
});
