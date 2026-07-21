import { Schema } from 'effect';
import { EmailSchema } from '@/shared/schema';
import { UserId } from './UserId';

export class User extends Schema.Class<User>('User')({
  userId: Schema.String.pipe(Schema.fromBrand(UserId)),
  email: EmailSchema,
  username: Schema.String,
  createdAt: Schema.DateTimeUtc,
}) {}
