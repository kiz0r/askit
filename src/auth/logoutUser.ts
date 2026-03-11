import { Effect, Schema } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';

const ResponseSchema = Schema.Struct({
  message: Schema.Literal('OK'),
});

export const logoutUser = Effect.fn('logoutUser')(function* () {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/auth/logout`);

  const request = Request.unsafeMake({
    url,
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, ResponseSchema);

  return response;
});
