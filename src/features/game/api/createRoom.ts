import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { RoomCodeSchema, SessionIdSchema } from '@/entities/game';
import type { QuizId } from '@/entities/quiz';
import { QuizIdSchema } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { RoomNotFoundError } from './errors';

const RoomResponseSchema = Schema.Struct({
  sessionId: SessionIdSchema,
  roomCode: RoomCodeSchema,
  quizId: QuizIdSchema,
  status: Schema.String,
  playerCount: Schema.Number,
  createdAt: Schema.DateTimeUtc,
});

const CreateRoomInputSchema = Schema.Struct({
  quizId: QuizIdSchema,
  randomizeQuestions: Schema.Boolean.pipe(Schema.optional),
  randomizeAnswers: Schema.Boolean.pipe(Schema.optional),
  showImmediateFeedback: Schema.Boolean.pipe(Schema.optional),
});

export type CreateRoomInput = {
  readonly quizId: QuizId;
  readonly randomizeQuestions?: boolean;
  readonly randomizeAnswers?: boolean;
  readonly showImmediateFeedback?: boolean;
};

const encodeBody = Schema.parseJson(CreateRoomInputSchema).pipe(Schema.encode);

export const createRoom = Effect.fn('createRoom')(
  function* (input: CreateRoomInput) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/game/room`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: yield* encodeBody(input),
    });

    return yield* Fetch.fetchJsonWithSchema(request, RoomResponseSchema).pipe(
      withStructuredError('ROOM_NOT_FOUND', (message) => new RoomNotFoundError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
