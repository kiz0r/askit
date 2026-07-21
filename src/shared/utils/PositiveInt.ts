import { Brand } from 'effect';
import { Int } from './Int';
import { PositiveNumber } from './PositiveNumber';

/**
 * A type representing a positive integer.
 */
export const PositiveInt = Brand.all(Int, PositiveNumber);
export type PositiveInt = Brand.Brand.FromConstructor<typeof PositiveInt>;
