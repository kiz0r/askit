import { Effect } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { User } from '@/entities/user';
import { AskitServerUrl } from '@/shared/api';
import { withAuthError } from '../auth';

export const getUser = Effect.fn('getUser')(
  function* () {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/user/profile`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return yield* Fetch.fetchJsonWithSchema(request, User).pipe(withAuthError);
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
    // The server should not return 403 for this endpoint
    NotAllowedError: Effect.die,
  })
);
