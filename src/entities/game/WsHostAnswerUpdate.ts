import { Schema } from 'effect';
import { QuizAnswerIdSchema } from '@/entities/quiz';
import { PlayerIdSchema } from './PlayerId';

export const WsHostAnswerUpdateSchema = Schema.Struct({
  playerId: PlayerIdSchema,
  nickname: Schema.String,
  isCorrect: Schema.Boolean,
  answerIds: Schema.Array(QuizAnswerIdSchema),
  timeTakenMs: Schema.DurationFromMillis,
  totalScore: Schema.Number,
});

export type WsHostAnswerUpdate = Schema.Schema.Type<typeof WsHostAnswerUpdateSchema>;
