import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { User, withAuthError } from '@/entities/user';
import { UsernameAlreadyExistsError } from '@/features/auth';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';

const UpdateProfileInputSchema = Schema.Struct({
  username: Schema.NonEmptyString,
});

export type UpdateProfileInput = Schema.Schema.Type<typeof UpdateProfileInputSchema>;

const encodeBody = Schema.parseJson(UpdateProfileInputSchema).pipe(Schema.encode);

export const updateProfile = Effect.fn('updateProfile')(
  function* (input: UpdateProfileInput) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/user/profile`;

    const request = Request.unsafeMake({
      url,
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: yield* encodeBody(input),
    });

    return yield* Fetch.fetchJsonWithSchema(request, User).pipe(
      withStructuredError(
        'USERNAME_ALREADY_EXISTS',
        (message) => new UsernameAlreadyExistsError({ message })
      )
    );
  },
  withAuthError,
  withValidationError,
  handleContractErrors
);
