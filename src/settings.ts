import { ConfigProvider } from 'effect';

export const envConfigProvider = ConfigProvider.fromJson(import.meta.env);
