import { Brand, Schema } from 'effect';

/**
 * ID of a User.
 * @see Related: {@link UserIdSchema} — Effect Schema for {@link UserId}
 */
export type UserId = string & Brand.Brand<'UserId'>;
export const UserId = Brand.nominal<UserId>();

/**
 * Effect Schema for UserId.
 * @see Related branded type {@link UserId}
 */
export const UserIdSchema = Schema.String.pipe(Schema.fromBrand(UserId));
