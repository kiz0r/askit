import { Effect, Schema } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { UserSchema } from '../user/User';

export const RegisterCredentialsSchema = Schema.Struct({
  username: Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(3)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(8)),
});

export type RegisterCredentials = Schema.Schema.Type<typeof RegisterCredentialsSchema>;

const BodySchema = Schema.Struct({
  username: Schema.String,
  email: Schema.String,
  password: Schema.String,
});

const encodeBody = Schema.parseJson(BodySchema).pipe(Schema.encode);

export const registerUser = Effect.fn('registerUser')(function* (params: RegisterCredentials) {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/auth/register`);

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
