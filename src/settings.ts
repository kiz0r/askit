import { ConfigProvider } from 'effect';

export const isDev = import.meta.env.DEV;

export const envConfigProvider = ConfigProvider.fromJson(import.meta.env);
