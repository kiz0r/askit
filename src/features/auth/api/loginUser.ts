import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { User } from '@/entities/user';
import { AskitServerUrl, withStructuredError } from '@/shared/api';
import { EmailSchema, PasswordSchema } from '@/shared/schema';
import { InvalidCredentialsError, UserInactiveError } from './errors';

/**
 * Schema for validating login credentials.
 */
export const LoginCredentialsSchema = Schema.Struct({
  email: EmailSchema,
  password: PasswordSchema,
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
export const loginUser = Effect.fn('loginUser')(
  function* (params: LoginCredentials) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/auth/login`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: yield* encodeBody(params),
    });

    return yield* Fetch.fetchJsonWithSchema(request, User).pipe(
      withStructuredError('INVALID_CREDENTIALS', () => new InvalidCredentialsError()),
      withStructuredError('USER_INACTIVE', () => new UserInactiveError())
    );
  },
  Effect.catchTags({
    MalformedJsonError: Effect.die,
    ParseError: Effect.die,
    NotAllowedError: Effect.die,
  })
);
