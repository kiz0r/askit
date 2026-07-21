import { Brand, Schema } from 'effect';

/**
 * ID of a Quiz question.
 */
export type QuizQuestionId = string & Brand.Brand<'QuizQuestionId'>;
export const QuizQuestionId = Brand.nominal<QuizQuestionId>();
export const QuizQuestionIdSchema = Schema.String.pipe(Schema.fromBrand(QuizQuestionId));
