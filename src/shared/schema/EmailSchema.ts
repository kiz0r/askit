import { Schema } from 'effect';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Schema for validating email addresses using a regular expression pattern.
 */
export const EmailSchema = Schema.String.pipe(Schema.pattern(emailPattern));
