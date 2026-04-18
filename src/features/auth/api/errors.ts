import { Data } from 'effect';

export class InvalidCredentialsError extends Data.TaggedError('InvalidCredentialsError') {}

export class UserAlreadyExistsError extends Data.TaggedError('UserAlreadyExistsError') {}

export class UsernameAlreadyExistsError extends Data.TaggedError('UsernameAlreadyExistsError') {}

export class UserInactiveError extends Data.TaggedError('UserInactiveError') {}
