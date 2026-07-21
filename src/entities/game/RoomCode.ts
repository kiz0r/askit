import { Schema } from 'effect';

export const RoomCodeSchema = Schema.String.pipe(Schema.pattern(/^[A-Z0-9]{4,8}$/));
