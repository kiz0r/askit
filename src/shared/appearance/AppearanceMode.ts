/**
 * @internal
 * Represents the effective/resolved appearance mode applied to the application.
 *
 * This is the concrete mode after 'system' preference has been resolved to either 'light' or 'dark'.
 * Use this when you need the actual theme to apply styling or configure UI components.
 */
export type ResolvedAppearanceMode = 'light' | 'dark';

/**
 * @internal
 * Represents the user's appearance preference, including system-dependent mode.
 *
 * This is what gets persisted in local storage.
 * Use {@link ResolvedAppearanceMode} when you need the actual effective mode for UI rendering.
 */
export type AppearanceMode = ResolvedAppearanceMode | 'system';
