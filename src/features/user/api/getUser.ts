import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { User, withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';

export const getUser = Effect.fn('getUser')(
  function* () {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/user/profile`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return yield* Fetch.fetchJsonWithSchema(request, User);
  },
  withAuthError,
  handleContractErrors
);
