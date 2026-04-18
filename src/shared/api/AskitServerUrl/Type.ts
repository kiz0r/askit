import { Brand } from 'effect';

/**
 * Type representing the Url of the **Askit** server
 */
export type Type = string & Brand.Brand<'AskitServerUrl'>;
export const Type = Brand.nominal<Type>();
