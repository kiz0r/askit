import { Schema } from 'effect';
import { PositiveInt } from '@/shared/utils';
import { QuizId } from './QuizId';
import { QuizQuestion } from './QuizQuestion';
import { quizLimits } from './quizLimits';

export const QuizVisibilitySchema = Schema.Literal('public', 'private');

export type QuizVisibility = Schema.Schema.Type<typeof QuizVisibilitySchema>;

const QuizStatusSchema = Schema.Literal('draft', 'published');

export type QuizStatus = Schema.Schema.Type<typeof QuizStatusSchema>;

const QuizSettingsSchema = Schema.Struct({
  defaultTimePerQuestion: Schema.DurationFromMillis,
  visibility: QuizVisibilitySchema,
  maxParticipants: Schema.Number.pipe(
    Schema.fromBrand(PositiveInt),
    Schema.lessThanOrEqualTo(quizLimits.maxParticipants)
  ),
});

export type QuizSettings = Schema.Schema.Type<typeof QuizSettingsSchema>;

export class Quiz extends Schema.Class<Quiz>('Quiz')({
  quizId: Schema.String.pipe(Schema.fromBrand(QuizId)),
  title: Schema.String.pipe(Schema.nonEmptyString()),
  tags: Schema.Array(Schema.String).pipe(Schema.maxItems(quizLimits.maxTagsPerQuiz)),
  description: Schema.NullOr(Schema.String),
  status: QuizStatusSchema,
  settings: QuizSettingsSchema,
  questions: Schema.NonEmptyArray(QuizQuestion),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  estimatedTime: Schema.DurationFromMillis,
  isFavorited: Schema.Boolean,
}) {}
