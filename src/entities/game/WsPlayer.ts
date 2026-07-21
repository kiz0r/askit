import { Schema } from 'effect';
import { PlayerIdSchema } from './PlayerId';

export const WsPlayerSchema = Schema.Struct({
  playerId: PlayerIdSchema,
  nickname: Schema.String,
  score: Schema.Number,
  isConnected: Schema.Boolean,
});

export type WsPlayer = Schema.Schema.Type<typeof WsPlayerSchema>;
