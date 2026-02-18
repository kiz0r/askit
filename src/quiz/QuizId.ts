import { Brand } from 'effect';

/**
 * ID of a Quiz.
 */
export type QuizId = string & Brand.Brand<'QuizId'>;
export const QuizId = Brand.nominal<QuizId>();
