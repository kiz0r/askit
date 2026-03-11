import { Schema } from 'effect';
import { PositiveInt } from '../utils/PositiveInt';
import { QuizId } from './QuizId';
import { QuizQuestion } from './QuizQuestion';
import { QuizLimits } from './quizLimits';

const QuizVisibilitySchema = Schema.Literal('public', 'private');

export type QuizVisibility = Schema.Schema.Type<typeof QuizVisibilitySchema>;

const QuizSettingsSchema = Schema.Struct({
  randomizeQuestions: Schema.Boolean,
  randomizeAnswers: Schema.Boolean,
  showImmediateFeedback: Schema.Boolean,
  timePerQuestion: Schema.DurationFromMillis,
  visibility: QuizVisibilitySchema,
  maxParticipants: Schema.Number.pipe(
    Schema.fromBrand(PositiveInt),
    Schema.lessThanOrEqualTo(QuizLimits.MaxParticipants)
  ),
});

export type QuizSettings = Schema.Schema.Type<typeof QuizSettingsSchema>;

export class Quiz extends Schema.Class<Quiz>('Quiz')({
  quizId: Schema.String.pipe(Schema.fromBrand(QuizId)),
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String.pipe(Schema.NullOr),
  settings: QuizSettingsSchema,
  questions: QuizQuestion.pipe(Schema.NonEmptyArray),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  estimatedTime: Schema.DurationFromMillis,
}) {}
