import { Brand, Schema } from 'effect';

/**
 * ID of a Quiz answer.
 */
export type QuizAnswerId = string & Brand.Brand<'QuizAnswerId'>;
export const QuizAnswerId = Brand.nominal<QuizAnswerId>();
export const QuizAnswerIdSchema = Schema.String.pipe(Schema.fromBrand(QuizAnswerId));
