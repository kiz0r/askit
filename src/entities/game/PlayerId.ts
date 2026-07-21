import { Brand, Schema } from 'effect';

/**
 * ID of a player in the quiz room.
 * @see Related: {@link PlayerIdSchema} — Effect Schema for {@link PlayerId}
 */
export type PlayerId = string & Brand.Brand<'PlayerId'>;
export const PlayerId = Brand.nominal<PlayerId>();

/**
 * Effect Schema for PlayerId.
 * @see Related branded type {@link PlayerId}
 */
export const PlayerIdSchema = Schema.String.pipe(Schema.fromBrand(PlayerId));
