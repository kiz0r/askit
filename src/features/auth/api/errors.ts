import { Data } from 'effect';

export class AccountLockedError extends Data.TaggedError('AccountLockedError')<{
  readonly message: string;
}> {}

export class RegistrationFailedError extends Data.TaggedError('RegistrationFailedError')<{
  readonly message: string;
}> {}

export class UserInactiveError extends Data.TaggedError('UserInactiveError')<{
  readonly message: string;
}> {}
