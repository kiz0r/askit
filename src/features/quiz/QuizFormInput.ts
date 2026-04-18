import { Duration, Schema } from 'effect';
import { quizLimits } from '@/entities/quiz';

export const QuizAnswerInputSchema = Schema.Struct({
  text: Schema.NonEmptyString.pipe(
    Schema.maxLength(quizLimits.maxAnswerLength),
    Schema.annotations({ message: () => 'Answer text is required' })
  ),
  isCorrect: Schema.Boolean,
});

export type QuizAnswerInput = typeof QuizAnswerInputSchema.Type;

export const QuizQuestionInputSchema = Schema.Struct({
  text: Schema.NonEmptyString.pipe(
    Schema.maxLength(quizLimits.maxQuestionLength),
    Schema.annotations({ message: () => 'Question text is required' })
  ),
  timeLimit: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(Duration.toMillis(quizLimits.duration.minTimePerQuestion)),
    Schema.lessThanOrEqualTo(Duration.toMillis(quizLimits.duration.maxTimePerQuestion)),
    Schema.annotations({ message: () => 'Time limit must be between 5 seconds and 5 minutes' })
  ),
  answers: Schema.Array(QuizAnswerInputSchema).pipe(
    Schema.minItems(quizLimits.minAnswersPerQuestion),
    Schema.maxItems(quizLimits.maxAnswersPerQuestion),
    Schema.filter((answers) => answers.filter((answer) => answer.isCorrect).length >= 1, {
      message: () => 'At least one answer must be marked as correct',
    })
  ),
});

export type QuizQuestionInput = typeof QuizQuestionInputSchema.Type;

export const QuizSettingsInputSchema = Schema.Struct({
  visibility: Schema.Literal('public', 'private'),
  maxParticipants: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(quizLimits.minParticipants),
    Schema.lessThanOrEqualTo(quizLimits.maxParticipants),
    Schema.annotations({
      message: () =>
        `Participants must be between ${quizLimits.minParticipants} and ${quizLimits.maxParticipants}`,
    })
  ),
});

export const QuizFormInputSchema = Schema.Struct({
  title: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => 'Title is required' }),
    Schema.minLength(quizLimits.minTitleLength, {
      message: () => `Title must be at least ${quizLimits.minTitleLength} characters`,
    }),
    Schema.maxLength(quizLimits.maxTitleLength)
  ),
  description: Schema.String.pipe(
    Schema.maxLength(quizLimits.maxDescriptionLength),
    Schema.optional
  ),
  tags: Schema.Array(Schema.String).pipe(
    Schema.maxItems(quizLimits.maxTagsPerQuiz, {
      message: () => `Maximum ${quizLimits.maxTagsPerQuiz} tags allowed`,
    })
  ),
  settings: QuizSettingsInputSchema,
  questions: Schema.Array(QuizQuestionInputSchema).pipe(
    Schema.minItems(1, { message: () => 'At least one question is required' })
  ),
});

export type QuizFormInput = typeof QuizFormInputSchema.Type;
