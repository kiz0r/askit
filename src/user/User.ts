import { Schema } from 'effect';
import { UserId } from './UserId';

export const UserSchema = Schema.Struct({
  userId: Schema.String.pipe(Schema.fromBrand(UserId)),
  email: Schema.String,
  username: Schema.String,
});

/**
 * Type representing a user.
 */
export type User = Schema.Schema.Type<typeof UserSchema>;
