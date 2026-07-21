const CHAR_CODE_A = 65;
const ALPHABET_LENGTH = 26;

export const getAnswerLabel = (index: number): string => {
  const normalizedIndex = index % ALPHABET_LENGTH;
  return String.fromCharCode(CHAR_CODE_A + normalizedIndex);
};
