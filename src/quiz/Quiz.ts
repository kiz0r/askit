import { Schema } from 'effect';
import { PositiveInt } from '../utils/PositiveInt';
import { QuizAnswerId } from './QuizAnswerId';
import { QuizId } from './QuizId';
import { QuizQuestionId } from './QuizQuestionId';

export const QuizQuestionSchema = Schema.Struct({
  questionId: Schema.String.pipe(Schema.fromBrand(QuizQuestionId)),
  text: Schema.String.pipe(Schema.nonEmptyString()),
  correctAnswerId: Schema.String.pipe(Schema.fromBrand(QuizAnswerId)),
  answers: Schema.Struct({
    answerId: Schema.String.pipe(Schema.fromBrand(QuizAnswerId)),
    text: Schema.String.pipe(Schema.nonEmptyString()),
    isCorrect: Schema.Boolean,
  }).pipe(Schema.NonEmptyArray),
});

export type QuizQuestion = Schema.Schema.Type<typeof QuizQuestionSchema>;

const QuizVisibilitySchema = Schema.Literal('public', 'private');

export type QuizVisibility = Schema.Schema.Type<typeof QuizVisibilitySchema>;

export const QuizSettingsSchema = Schema.Struct({
  randomizeQuestions: Schema.Boolean,
  randomizeAnswers: Schema.Boolean,
  showImmediateFeedback: Schema.Boolean,
  timePerQuestion: Schema.Number,
  visibility: QuizVisibilitySchema,
  maxParticipants: Schema.Number.pipe(Schema.fromBrand(PositiveInt)),
});

export type QuizSettings = Schema.Schema.Type<typeof QuizSettingsSchema>;

export const QuizSchema = Schema.Struct({
  quizId: Schema.String.pipe(Schema.fromBrand(QuizId)),
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String.pipe(Schema.NullOr),
  settings: QuizSettingsSchema,
  questions: QuizQuestionSchema.pipe(Schema.NonEmptyArray),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  estimatedTime: Schema.DurationFromMillis,
});

export type Quiz = Schema.Schema.Type<typeof QuizSchema>;
