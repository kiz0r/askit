import { ConfigProvider } from 'effect';

/**
 * @deprecated Do not use it. use `import.meta.env.PUBLIC_APP_URL` directly instead to avoid circular dependencies.
 */
export const isDev = import.meta.env.DEV;

export const envConfigProvider = ConfigProvider.fromJson(import.meta.env);

/**
 * @deprecated Do not use it. use `import.meta.env.PUBLIC_APP_URL` directly instead to avoid circular dependencies.
 */
export const appUrl = import.meta.env.PUBLIC_APP_URL;
