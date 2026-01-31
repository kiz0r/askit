import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { UserSchema } from './User';

export const getUser = Effect.fn('getUser')(function* () {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/user/profile`;

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
