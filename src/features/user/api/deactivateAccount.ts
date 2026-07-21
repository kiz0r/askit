import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';

export const deactivateAccount = Effect.fn('deactivateAccount')(
  function* () {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/user/deactivate`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return yield* Fetch.fetch(request);
  },
  withAuthError,
  handleContractErrors
);
