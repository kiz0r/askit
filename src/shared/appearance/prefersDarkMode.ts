/**
 * @internal
 * Checks if the user prefers dark mode using the `prefers-color-scheme` media query.
 */
export const prefersDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
