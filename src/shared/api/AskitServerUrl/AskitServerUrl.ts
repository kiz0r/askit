import { Context } from 'effect';
import { Type } from './Type';

/**
 * Service for providing the Askit server Url throughout the application
 */
export class AskitServerUrl extends Context.Tag('AskitServerUrl')<AskitServerUrl, Type>() {}
