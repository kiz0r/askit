import { Duration, Schema } from 'effect';
import { QuizLimits } from './quizLimits';

export const QuizAnswerInputSchema = Schema.Struct({
  text: Schema.NonEmptyString,
  isCorrect: Schema.Boolean,
});

export type QuizAnswerInput = typeof QuizAnswerInputSchema.Type;

export const QuizQuestionInputSchema = Schema.Struct({
  text: Schema.NonEmptyString,
  answers: QuizAnswerInputSchema.pipe(
    // NOTE: We do not use Schema.NonEmptyArray here because of our custom validation rules.
    Schema.Array,
    Schema.minItems(2),
    Schema.filter((answers) => answers.filter((answer) => answer.isCorrect).length === 1)
  ),
});

export const QuizSettingsInputSchema = Schema.Struct({
  randomizeQuestions: Schema.Boolean,
  randomizeAnswers: Schema.Boolean,
  showImmediateFeedback: Schema.Boolean,
  // NOTE: We do not use Duration because of the limitations of react-hook-form.
  timePerQuestion: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(Duration.toMillis(QuizLimits.Duration.MinTimePerQuestion)),
    Schema.lessThanOrEqualTo(Duration.toMillis(QuizLimits.Duration.MaxTimePerQuestion))
  ),
  visibility: Schema.Literal('public', 'private'),
  maxParticipants: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(QuizLimits.MinParticipants),
    Schema.lessThanOrEqualTo(QuizLimits.MaxParticipants)
  ),
});

export const QuizFormInputSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(3)),
  description: Schema.String,
  settings: QuizSettingsInputSchema,
  questions: QuizQuestionInputSchema.pipe(Schema.Array, Schema.minItems(1)),
});

export type QuizFormInput = typeof QuizFormInputSchema.Type;
