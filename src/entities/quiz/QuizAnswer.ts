import { Schema } from 'effect';
import { QuizAnswerId } from './QuizAnswerId';

export class QuizAnswer extends Schema.Class<QuizAnswer>('QuizAnswer')({
  answerId: Schema.String.pipe(Schema.fromBrand(QuizAnswerId)),
  text: Schema.String.pipe(Schema.nonEmptyString()),
  isCorrect: Schema.Boolean,
}) {}
