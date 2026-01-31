import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { UserSchema } from '../user/User';

/**
 * Schema for validating login credentials.
 */
export const LoginCredentialsSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(8)),
});

/**
 * Type representing login credentials.
 */
export type LoginCredentials = Schema.Schema.Type<typeof LoginCredentialsSchema>;

const BodySchema = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
});

const encodeBody = Schema.parseJson(BodySchema).pipe(Schema.encode);

/**
 * Function to log in a user with given credentials.
 */
export const loginUser = Effect.fn('loginUser')(function* (params: LoginCredentials) {
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/auth/login`;

  const body = yield* encodeBody(params);

  const request = Request.unsafeMake({
    url,
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, UserSchema);

  return response;
});
