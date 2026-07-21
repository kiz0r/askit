/**
 * Utility function to generate an array of a specified length and populate it using a callback function.
 */
export function generateArrayFromLength(
  length: number,
  callback: (value: unknown, index: number) => React.ReactNode
) {
  return Array.from({ length }, callback);
}
