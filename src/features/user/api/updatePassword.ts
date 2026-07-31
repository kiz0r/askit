import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { InvalidCredentialsError, withAuthError } from '@/entities/user';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';
import { PasswordSchema } from '@/shared/schema';

export const UpdatePasswordInputSchema = Schema.Struct({
  currentPassword: PasswordSchema,
  nextPassword: PasswordSchema,
});

export type UpdatePasswordInput = Schema.Schema.Type<typeof UpdatePasswordInputSchema>;

const encodeBody = Schema.parseJson(UpdatePasswordInputSchema).pipe(Schema.encode);

export const updatePassword = Effect.fn('updatePassword')(
  function* (input: UpdatePasswordInput) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/user/password`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: yield* encodeBody(input),
    });

    return yield* Fetch.fetch(request).pipe(
      withStructuredError(
        'INVALID_CREDENTIALS',
        (message) => new InvalidCredentialsError({ message })
      )
    );
  },
  withAuthError,
  withValidationError,
  handleContractErrors
);
