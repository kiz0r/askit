import { Data } from 'effect';

export class QuizNotFoundError extends Data.TaggedError('QuizNotFoundError')<{
  readonly message: string;
}> {}

export class InvalidQuizDataError extends Data.TaggedError('InvalidQuizDataError')<{
  readonly message: string;
}> {}

export class QuizAccessDeniedError extends Data.TaggedError('QuizAccessDeniedError')<{
  readonly message: string;
}> {}

export class QuizPublishedError extends Data.TaggedError('QuizPublishedError')<{
  readonly message: string;
}> {}
