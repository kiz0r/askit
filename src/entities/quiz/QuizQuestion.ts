import { Schema } from 'effect';
import { PositiveInt } from '@/shared/utils';
import { QuizAnswer } from './QuizAnswer';
import { QuizQuestionId } from './QuizQuestionId';

export class QuizQuestion extends Schema.Class<QuizQuestion>('QuizQuestion')({
  position: Schema.Number.pipe(Schema.fromBrand(PositiveInt)),
  timeLimit: Schema.DurationFromMillis,
  questionId: Schema.String.pipe(Schema.fromBrand(QuizQuestionId)),
  text: Schema.String.pipe(Schema.nonEmptyString()),
  allowMultipleAnswers: Schema.Boolean,
  answers: Schema.NonEmptyArray(QuizAnswer),
}) {}
