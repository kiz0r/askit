import { ConfigProvider, Layer } from 'effect';
import { Fetch } from 'fx-fetch';

const envConfigProvider = ConfigProvider.fromJson(import.meta.env);

/**
 * The main application layer that provides all necessary dependencies for the application
 */
export const applicationLayer = Layer.empty.pipe(
  Layer.merge(Fetch.layer),
  Layer.provide(Layer.setConfigProvider(envConfigProvider))
);
