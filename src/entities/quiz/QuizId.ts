import { Brand, Schema } from 'effect';

/**
 * ID of a Quiz.
 * @see Related: {@link QuizIdSchema} — Effect Schema for {@link QuizId}
 */
export type QuizId = string & Brand.Brand<'QuizId'>;
export const QuizId = Brand.nominal<QuizId>();

/**
 * Effect Schema for QuizId.
 * @see Related branded type {@link QuizId}
 */
export const QuizIdSchema = Schema.String.pipe(Schema.fromBrand(QuizId));
