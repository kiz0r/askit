import { Brand } from 'effect';

/**
 * ID of a User.
 */
export type UserId = string & Brand.Brand<'UserId'>;
export const UserId = Brand.nominal<UserId>();
