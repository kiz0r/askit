import { Schema } from 'effect';

/**
 * Schema for validating passwords, ensuring they are non-empty and have a minimum length of 8 characters.
 */
export const PasswordSchema = Schema.String.pipe(Schema.nonEmptyString(), Schema.minLength(8));
