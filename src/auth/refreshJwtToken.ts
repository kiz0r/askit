import { Data, Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { withStructuredError } from '../api/withStructuredError';

const ResponseSchema = Schema.Struct({
  message: Schema.Literal('OK'),
});

class RefreshTokenMissingError extends Data.TaggedError('RefreshTokenMissingError') {}
class RefreshTokenInvalidError extends Data.TaggedError('RefreshTokenInvalidError') {}
class RefreshTokenExpiredError extends Data.TaggedError('RefreshTokenExpiredError') {}

export const refreshJwtToken = Effect.fn('refreshJwtToken')(function* () {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/auth/refresh`;

  const request = Request.unsafeMake({
    url,
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, ResponseSchema).pipe(
    withStructuredError('REFRESH_TOKEN_MISSING', () => new RefreshTokenMissingError()),
    withStructuredError('TOKEN_EXPIRED', () => new RefreshTokenExpiredError()),
    withStructuredError('INVALID_TOKEN', () => new RefreshTokenInvalidError())
  );

  return response;
});
