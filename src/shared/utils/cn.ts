import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes with proper precedence.
 */
export function cn(...inputs: readonly ClassValue[]) {
  return twMerge(clsx(inputs));
}
