import { Schema } from 'effect';
import {
  PlayerIdSchema,
  RoomCodeSchema,
  SessionIdSchema,
  WsAnswerResultSchema,
  WsHostAnswerUpdateSchema,
  WsLeaderboardEntrySchema,
  WsPlayerSchema,
  WsQuestionEndedSchema,
  WsQuestionSchema,
} from '@/entities/game';
import { UserIdSchema } from '@/entities/user';

const RoomStatePayload = Schema.Struct({
  sessionId: SessionIdSchema,
  roomCode: RoomCodeSchema,
  status: Schema.Union(
    Schema.Literal('waiting'),
    Schema.Literal('starting'),
    Schema.Literal('question'),
    Schema.Literal('revealing'),
    Schema.Literal('finished')
  ),
  hostId: UserIdSchema,
  players: Schema.Array(WsPlayerSchema),
  quizTitle: Schema.String,
  totalQuestions: Schema.Number,
  currentQuestionIndex: Schema.Number,
  currentQuestion: Schema.optionalWith(WsQuestionSchema, { nullable: true }),
  hostAnswerDetails: Schema.optionalWith(Schema.Array(WsHostAnswerUpdateSchema), {
    default: () => [],
  }),
  questionEnded: Schema.optionalWith(WsQuestionEndedSchema, { nullable: true }),
});

const PlayerJoinedPayload = Schema.Struct({
  player: WsPlayerSchema,
});

const PlayerLeftPayload = Schema.Struct({
  playerId: PlayerIdSchema,
  nickname: Schema.String,
});

const GameStartingPayload = Schema.Struct({
  countdownMs: Schema.DurationFromMillis,
  totalQuestions: Schema.Number,
});

const GameFinishedPayload = Schema.Struct({
  finalLeaderboard: Schema.Array(WsLeaderboardEntrySchema),
  totalQuestions: Schema.Number,
  durationMs: Schema.DurationFromMillis,
  publicResults: Schema.optionalWith(Schema.Boolean, { default: () => true }),
});

const ErrorPayload = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
});

export const ServerMessageSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('room_state'),
    payload: RoomStatePayload,
  }),
  Schema.Struct({
    type: Schema.Literal('player_joined'),
    payload: PlayerJoinedPayload,
  }),
  Schema.Struct({
    type: Schema.Literal('player_left'),
    payload: PlayerLeftPayload,
  }),
  Schema.Struct({
    type: Schema.Literal('game_starting'),
    payload: GameStartingPayload,
  }),
  Schema.Struct({
    type: Schema.Literal('question'),
    payload: WsQuestionSchema,
  }),
  Schema.Struct({
    type: Schema.Literal('answer_result'),
    payload: WsAnswerResultSchema,
  }),
  Schema.Struct({
    type: Schema.Literal('player_answered'),
    payload: Schema.Struct({ playerId: PlayerIdSchema }),
  }),
  Schema.Struct({
    type: Schema.Literal('question_ended'),
    payload: WsQuestionEndedSchema,
  }),
  Schema.Struct({
    type: Schema.Literal('game_finished'),
    payload: GameFinishedPayload,
  }),
  Schema.Struct({
    type: Schema.Literal('host_answer_update'),
    payload: WsHostAnswerUpdateSchema,
  }),
  Schema.Struct({
    type: Schema.Literal('error'),
    payload: ErrorPayload,
  })
);

export type ServerMessage = Schema.Schema.Type<typeof ServerMessageSchema>;
