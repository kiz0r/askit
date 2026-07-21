import { Schema } from 'effect';
import { QuizAnswerIdSchema, QuizQuestionIdSchema } from '@/entities/quiz';
import { WsLeaderboardEntrySchema } from './WsLeaderboardEntry';

export const WsQuestionEndedSchema = Schema.Struct({
  questionId: QuizQuestionIdSchema,
  correctAnswerIds: Schema.Array(QuizAnswerIdSchema),
  answerDistribution: Schema.Record({ key: QuizAnswerIdSchema, value: Schema.Number }),
  leaderboard: Schema.Array(WsLeaderboardEntrySchema),
});

export type WsQuestionEnded = Schema.Schema.Type<typeof WsQuestionEndedSchema>;
