import { Data } from 'effect';

/**
 * The back-end's generic request-validation failure (Pydantic), returned with
 * `errorCode: "VALIDATION_ERROR"` on any endpoint whose request body does not
 * satisfy the expected schema. Carries the server's human-readable message.
 */
export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
}> {}
