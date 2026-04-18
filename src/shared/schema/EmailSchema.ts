import { Schema } from 'effect';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Schema for validating email addresses using a regular expression pattern.
 */
export const EmailSchema = Schema.String.pipe(Schema.pattern(emailRegex));
