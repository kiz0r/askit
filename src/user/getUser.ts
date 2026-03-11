import { Effect } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { UserSchema } from './User';

export const getUser = Effect.fn('getUser')(function* () {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/user/profile`);

  const request = Request.unsafeMake({
    url,
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, UserSchema);

  return response;
});
