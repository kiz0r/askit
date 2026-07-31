import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { InvalidCredentialsError, User } from '@/entities/user';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';
import { EmailSchema, PasswordSchema } from '@/shared/schema';
import { RegistrationFailedError } from './errors';

export const RegisterCredentialsSchema = Schema.Struct({
  username: Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(3)),
  email: EmailSchema,
  password: PasswordSchema,
});

export type RegisterCredentials = Schema.Schema.Type<typeof RegisterCredentialsSchema>;

const BodySchema = Schema.Struct({
  username: Schema.String,
  email: Schema.String,
  password: Schema.String,
});

const encodeBody = Schema.parseJson(BodySchema).pipe(Schema.encode);

export const registerUser = Effect.fn('registerUser')(
  function* (params: RegisterCredentials) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/auth/register`;

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
      withStructuredError(
        'REGISTRATION_FAILED',
        (message) => new RegistrationFailedError({ message })
      ),
      withStructuredError(
        'INVALID_USERNAME',
        (message) => new InvalidCredentialsError({ message })
      ),
      withStructuredError('INVALID_PASSWORD', (message) => new InvalidCredentialsError({ message }))
    );
  },
  withValidationError,
  handleContractErrors
);
