import { Data } from 'effect';

export class QuizNotFoundError extends Data.TaggedError('QuizNotFoundError') {}

export class InvalidQuizDataError extends Data.TaggedError('InvalidQuizDataError') {}

export class QuizAccessDeniedError extends Data.TaggedError('QuizAccessDeniedError') {}

export class QuizPublishedError extends Data.TaggedError('QuizPublishedError') {}
