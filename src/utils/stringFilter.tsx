// TODO: Rewrite it to not use Regex
// TODO: Add tests for it
import * as React from 'react';

/**
 * Checks if a character is whitespace.
 * @internal
 */
const isWhitespace = (char: string): boolean => /\s/.test(char);

/**
 * Removes all whitespace from a string.
 * @internal
 */
const stripWhitespace = (str: string): string => {
  return str.replace(/\s+/g, '');
};

/**
 * Utility for string filtering and highlighting.
 * Case-insensitive and whitespace-insensitive matching.
 */
export const stringFilter = {
  /**
   * Checks if `text` contains `query` (case-insensitive, ignores whitespace).
   */
  match: (text: string, query: string): boolean => {
    const normalizedQuery = stripWhitespace(query.toLowerCase());
    if (normalizedQuery.length === 0) {
      return true;
    }
    return stripWhitespace(text.toLowerCase()).includes(normalizedQuery);
  },

  /**
   * Checks if any of the provided texts match the query.
   */
  matchAny: (texts: readonly (string | null | undefined)[], query: string): boolean => {
    const normalizedQuery = stripWhitespace(query.toLowerCase());
    if (normalizedQuery.length === 0) {
      return true;
    }

    return texts.some(
      (text) => text != null && stripWhitespace(text.toLowerCase()).includes(normalizedQuery)
    );
  },

  /**
   * Highlights occurrences of `query` within `text` by wrapping them in <mark> tags.
   * Returns original text if query is empty.
   * Note: Highlights based on visible characters, ignoring whitespace in query.
   */
  highlight: (text: string, query: string): React.ReactNode => {
    if (query.length === 0) {
      return text;
    }

    const normalizedQuery = stripWhitespace(query.toLowerCase());
    if (normalizedQuery.length === 0) {
      return text;
    }

    const parts: /* mutable */ React.ReactNode[] = [];
    let lastIndex = 0;
    let textIndex = 0;
    let queryIndex = 0;
    let matchStart = -1;

    while (textIndex < text.length) {
      const textChar = text[textIndex];

      // Skip whitespace in text when matching
      if (isWhitespace(textChar)) {
        textIndex++;
        continue;
      }

      if (textChar.toLowerCase() === normalizedQuery[queryIndex]) {
        if (queryIndex === 0) {
          matchStart = textIndex;
        }
        queryIndex++;

        if (queryIndex === normalizedQuery.length) {
          // Full match found
          if (matchStart > lastIndex) {
            parts.push(text.slice(lastIndex, matchStart));
          }
          parts.push(<mark key={matchStart}>{text.slice(matchStart, textIndex + 1)}</mark>);
          lastIndex = textIndex + 1;
          queryIndex = 0;
          matchStart = -1;
        }
      } else {
        // Reset match
        if (matchStart !== -1) {
          textIndex = matchStart;
        }
        queryIndex = 0;
        matchStart = -1;
      }

      textIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  },
} as const;
