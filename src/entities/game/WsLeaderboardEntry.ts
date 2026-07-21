import { Schema } from 'effect';
import { PlayerIdSchema } from './PlayerId';

export const WsLeaderboardEntrySchema = Schema.Struct({
  rank: Schema.Number,
  playerId: PlayerIdSchema,
  nickname: Schema.String,
  score: Schema.Number,
  change: Schema.Number,
});

export type WsLeaderboardEntry = Schema.Schema.Type<typeof WsLeaderboardEntrySchema>;
