/**
 * Utility for intelligent text truncation that respects word boundaries and meaning
 */

export const FIELD_LIMITS = {
  title: {
    maxChars: 100,
    maxWords: 15,
    minChars: 20,
  },
  description: {
    maxChars: 2000,
    maxWords: 300,
    minChars: 80,
  },
  impacts: {
    maxChars: 500,
    maxWords: 75,
    minChars: 50,
  },
  contributions: {
    maxChars: 500,
    maxWords: 75,
    minChars: 50,
  },
  conditions: {
    maxChars: 500,
    maxWords: 75,
    minChars: 30,
  },
} as const;

/**
 * Intelligently truncate text while preserving sentence structure and meaning
 * @param text - Text to truncate
 * @param maxChars - Maximum character count
 * @param minChars - Minimum character count to attempt
 * @returns Truncated text that ends with proper punctuation
 */
export function truncateToCharLimit(text: string, maxChars: number, minChars: number = 50): string {
  if (!text) return text;

  const trimmed = text.trim();

  // If already within limit, return as-is
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  // Try to truncate at sentence boundary (., !, ?)
  let truncated = trimmed.substring(0, maxChars);

  // Find last sentence-ending punctuation within the limit
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');

  const lastPunctuationIndex = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastPunctuationIndex > minChars) {
    // Truncate at sentence boundary and include punctuation
    return truncated.substring(0, lastPunctuationIndex + 1).trim();
  }

  // If no good sentence boundary, try breaking at a colon or comma
  const lastColon = truncated.lastIndexOf(':');
  if (lastColon > minChars && lastColon > lastPunctuationIndex) {
    return truncated.substring(0, lastColon).trim() + '.';
  }

  const lastComma = truncated.lastIndexOf(',');
  if (lastComma > minChars && lastComma > lastPunctuationIndex) {
    return truncated.substring(0, lastComma).trim() + '.';
  }

  // Last resort: break at last space
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > minChars) {
    return truncated.substring(0, lastSpace).trim() + '.';
  }

  // If text is shorter than minChars, return it as-is but with proper ending
  if (trimmed.length < minChars) {
    return trimmed;
  }

  // Absolute truncation as last resort
  return truncated.substring(0, Math.max(minChars, maxChars - 3)).trim() + '...';
}

/**
 * Truncate text to word count while preserving sentence structure
 * @param text - Text to truncate
 * @param maxWords - Maximum word count
 * @param minWords - Minimum word count to attempt
 * @returns Truncated text
 */
export function truncateToWordLimit(text: string, maxWords: number, minWords: number = 10): string {
  if (!text) return text;

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);

  // If already within limit, return as-is
  if (words.length <= maxWords) {
    return trimmed;
  }

  // Build truncated version word by word, trying to end at sentence boundary
  let result = '';
  let wordCount = 0;
  let charIndex = 0;

  for (let i = 0; i < words.length && wordCount < maxWords; i++) {
    const word = words[i];
    const nextResult = result ? `${result} ${word}` : word;

    if (nextResult.length <= (maxWords * 6)) { // Rough estimate: avg 5-6 chars per word
      result = nextResult;
      wordCount++;
      charIndex += word.length + 1;
    } else {
      break;
    }
  }

  // Add terminal punctuation if missing
  const endsWithPunctuation = /[.!?…]$/.test(result);
  if (!endsWithPunctuation && result.length > 0) {
    result = result + '.';
  }

  return result.trim();
}

/**
 * Apply field-specific truncation
 * @param text - Text to truncate
 * @param fieldType - Type of field (title, description, impacts, contributions, conditions)
 * @returns Truncated text appropriate for the field
 */
export function truncateForField(
  text: string,
  fieldType: keyof typeof FIELD_LIMITS
): string {
  if (!text) return text;

  const limits = FIELD_LIMITS[fieldType];

  // Use character limit as primary constraint
  let truncated = truncateToCharLimit(text, limits.maxChars, limits.minChars);

  // Also check word limit
  const wordCount = truncated.split(/\s+/).length;
  if (wordCount > limits.maxWords) {
    truncated = truncateToWordLimit(truncated, limits.maxWords);
  }

  return truncated;
}

/**
 * Validate if text fits field limits
 */
export function validateFieldLength(
  text: string,
  fieldType: keyof typeof FIELD_LIMITS
): { valid: boolean; chars: number; words: number; maxChars: number; maxWords: number } {
  const limits = FIELD_LIMITS[fieldType];
  const chars = text.length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;

  return {
    valid: chars <= limits.maxChars && words <= limits.maxWords,
    chars,
    words,
    maxChars: limits.maxChars,
    maxWords: limits.maxWords,
  };
}
