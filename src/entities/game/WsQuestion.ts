import { Schema } from 'effect';
import { QuizAnswerIdSchema, QuizQuestionIdSchema } from '@/entities/quiz';

const WsQuestionAnswerSchema = Schema.Struct({
  answerId: QuizAnswerIdSchema,
  text: Schema.String,
});

export const WsQuestionSchema = Schema.Struct({
  questionIndex: Schema.Number,
  totalQuestions: Schema.Number,
  questionId: QuizQuestionIdSchema,
  text: Schema.String,
  answers: Schema.Array(WsQuestionAnswerSchema),
  timeLimitMs: Schema.DurationFromMillis,
  startedAt: Schema.DateTimeUtc,
  allowMultipleAnswers: Schema.optionalWith(Schema.Boolean, { default: () => false }),
});

export type WsQuestion = Schema.Schema.Type<typeof WsQuestionSchema>;
