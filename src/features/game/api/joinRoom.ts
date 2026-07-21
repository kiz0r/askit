import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { PlayerIdSchema } from '@/entities/game';
import { withAuthError } from '@/entities/user';
import {
  AskitServerUrl,
  handleContractErrors,
  withStructuredError,
  withValidationError,
} from '@/shared/api';
import {
  GameAlreadyStartedError,
  HostCannotJoinError,
  NicknameAlreadyTakenError,
  RoomFullError,
  RoomNotFoundError,
} from './errors';

const PlayerInfoSchema = Schema.Struct({
  playerId: PlayerIdSchema,
  nickname: Schema.String,
  score: Schema.Number,
  isConnected: Schema.Boolean,
});

const JoinRoomBodySchema = Schema.Struct({
  nickname: Schema.String,
});

const encodeBody = Schema.parseJson(JoinRoomBodySchema).pipe(Schema.encode);

export const joinRoom = Effect.fn('joinRoom')(
  function* (roomCode: string, nickname: string) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/game/room/${encodeURIComponent(roomCode)}/join`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: yield* encodeBody({ nickname }),
    });

    return yield* Fetch.fetchJsonWithSchema(request, PlayerInfoSchema).pipe(
      withStructuredError('ROOM_NOT_FOUND', (message) => new RoomNotFoundError({ message })),
      withStructuredError(
        'NICKNAME_ALREADY_TAKEN',
        (message) => new NicknameAlreadyTakenError({ message })
      ),
      withStructuredError(
        'GAME_ALREADY_STARTED',
        (message) => new GameAlreadyStartedError({ message })
      ),
      withStructuredError('ROOM_FULL', (message) => new RoomFullError({ message })),
      withStructuredError('HOST_CANNOT_JOIN', (message) => new HostCannotJoinError({ message }))
    );
  },
  withAuthError,
  withValidationError,
  handleContractErrors
);
