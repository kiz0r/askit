import { Data } from 'effect';

export class RoomNotFoundError extends Data.TaggedError('RoomNotFoundError')<{
  readonly message: string;
}> {}

export class NicknameAlreadyTakenError extends Data.TaggedError('NicknameAlreadyTakenError')<{
  readonly message: string;
}> {}

export class GameAlreadyStartedError extends Data.TaggedError('GameAlreadyStartedError')<{
  readonly message: string;
}> {}

export class RoomFullError extends Data.TaggedError('RoomFullError')<{
  readonly message: string;
}> {}

export class HostCannotJoinError extends Data.TaggedError('HostCannotJoinError')<{
  readonly message: string;
}> {}
