import { Brand, Schema } from 'effect';

/**
 * ID of a game session.
 * @see Related: {@link SessionIdSchema} — Effect Schema for {@link SessionId}
 */
export type SessionId = string & Brand.Brand<'SessionId'>;
export const SessionId = Brand.nominal<SessionId>();

/**
 * Effect Schema for SessionId.
 * @see Related branded type {@link SessionId}
 */
export const SessionIdSchema = Schema.String.pipe(Schema.fromBrand(SessionId));
