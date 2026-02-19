import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { QuizSchema } from './Quiz';

const ResponseSchema = QuizSchema.pipe(Schema.Array);

export const fetchQuizzes = Effect.fn('fetchQuizzes')(function* () {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/quiz`;

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, ResponseSchema);

  return response;
});
