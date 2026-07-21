import { Schema } from 'effect';
import { QuizAnswerIdSchema } from '@/entities/quiz';

export const WsAnswerResultSchema = Schema.Struct({
  isCorrect: Schema.Boolean,
  correctAnswerIds: Schema.Array(QuizAnswerIdSchema),
  pointsEarned: Schema.Number,
  timeTakenMs: Schema.DurationFromMillis,
});

export type WsAnswerResult = Schema.Schema.Type<typeof WsAnswerResultSchema>;
