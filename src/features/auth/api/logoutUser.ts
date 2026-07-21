import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';

export const logoutUser = Effect.fn('logoutUser')(function* () {
  const baseUrl = yield* AskitServerUrl;
  const url = `${baseUrl}/api/v1/auth/logout`;

  const request = Request.unsafeMake({
    url,
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return yield* Fetch.fetch(request);
}, handleContractErrors);
