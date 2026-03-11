import { Schema } from 'effect';
import { QuizAnswer } from './QuizAnswer';
import { QuizAnswerId } from './QuizAnswerId';
import { QuizQuestionId } from './QuizQuestionId';

export class QuizQuestion extends Schema.Class<QuizQuestion>('QuizQuestion')({
  questionId: Schema.String.pipe(Schema.fromBrand(QuizQuestionId)),
  text: Schema.String.pipe(Schema.nonEmptyString()),
  correctAnswerId: Schema.String.pipe(Schema.fromBrand(QuizAnswerId)),
  answers: QuizAnswer.pipe(Schema.NonEmptyArray),
}) {}
