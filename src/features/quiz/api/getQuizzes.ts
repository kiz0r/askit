import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl } from '@/shared/api';

const ResultSchema = Schema.Struct({
  items: Schema.Array(Quiz),
});

export const getQuizzes = Effect.fn('getQuizzes')(function* () {
  const baseUrl = yield* AskitServerUrl.AskitServerUrl;
  const url = `${baseUrl}/api/v1/quiz`;

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const quizzes = yield* Fetch.fetchJsonWithSchema(request, ResultSchema).pipe(withAuthError);
  return quizzes.items;
});
