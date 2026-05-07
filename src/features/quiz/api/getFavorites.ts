import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl } from '@/shared/api';

const ResultSchema = Schema.Struct({
  items: Schema.Array(Quiz),
});

export const getFavorites = Effect.fn('getFavorites')(function* () {
  const baseUrl = yield* AskitServerUrl.AskitServerUrl;
  const url = `${baseUrl}/api/v1/quiz/favorites/list`;

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  const result = yield* Fetch.fetchJsonWithSchema(request, ResultSchema).pipe(withAuthError);
  return result.items;
});
