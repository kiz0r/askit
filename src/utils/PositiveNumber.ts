import { Brand } from 'effect';

/**
 * A type representing a positive number.
 */
export type PositiveNumber = number & Brand.Brand<'PositiveNumber'>;
export const PositiveNumber = Brand.refined<PositiveNumber>(
  (n) => n > 0,
  (n) => Brand.error(`Expected ${n} to be positive`)
);
