import { Layer } from 'effect';
import { Fetch } from 'fx-fetch';
import { AskitServerUrl } from '@/shared/api';

const askitServerUrl = AskitServerUrl.Type(import.meta.env.PUBLIC_ASKIT_SERVER_URL);

/**
 * The main application layer that provides all necessary dependencies for the application
 */
export const applicationLayer = Layer.empty.pipe(
  Layer.merge(Fetch.layer),
  Layer.merge(Layer.succeed(AskitServerUrl.AskitServerUrl, askitServerUrl))
);
