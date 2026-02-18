import { Brand } from 'effect';

/**
 * ID of a Quiz question.
 */
export type QuizQuestionId = string & Brand.Brand<'QuizQuestionId'>;
export const QuizQuestionId = Brand.nominal<QuizQuestionId>();
