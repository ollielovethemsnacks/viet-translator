import { fullDictionary } from './dictionary';

/**
 * Service for Vietnamese to English translation
 * Uses dictionary-based approach with support for compound phrases
 */
export class TranslationService {
  private dictionary: Array<{ vi: string; en: string; category: string }>;

  constructor(dictionary: Array<{ vi: string; en: string; category: string }>) {
    this.dictionary = dictionary;
  }

  get dictionaryData(): Array<{ vi: string; en: string; category: string }> {
    return this.dictionary;
  }

  /**
   * Find translation for a word or phrase
   */
  findTranslation(text: string): string | null {
    const normalizedText = text.trim().toLowerCase();
    
    if (!normalizedText) return null;
    
    // Try exact match first
    const exactMatch = this.dictionary.find(entry => entry.vi === normalizedText);
    if (exactMatch) return exactMatch.en;
    
    // Check if the text contains any dictionary entries
    for (const entry of this.dictionary) {
      if (normalizedText.includes(entry.vi)) {
        return entry.en;
      }
    }
    
    // Try reversing - check if any dictionary entry is contained in the text
    for (const entry of this.dictionary) {
      if (entry.vi.includes(normalizedText)) {
        return entry.en;
      }
    }
    
    return null;
  }

  /**
   * Find supporting words in the text that have translations
   */
  supportingWords(text: string): Array<{ word: string; translation: string }> {
    const words: Array<{ word: string; translation: string }> = [];
    const normalizedText = text.toLowerCase();
    
    for (const entry of this.dictionary) {
      if (normalizedText.includes(entry.vi.toLowerCase())) {
        words.push({ word: entry.vi, translation: entry.en });
      }
    }
    
    return words;
  }

  /**
   * Main translation method that attempts to translate the full text
   * Falls back to word-by-word translation if needed
   */
  translate(text: string): string {
    const cleanedText = text.trim();
    
    if (!cleanedText) return '';
    
    // Try direct translation first
    const directTranslation = this.findTranslation(cleanedText);
    if (directTranslation) return directTranslation;
    
    // If no direct match, try to find partial matches
    const matches = this.supportingWords(cleanedText);
    
    if (matches.length > 0) {
      // Return the longest match
      const longestMatch = matches.reduce((a, b) => 
        a.word.length > b.word.length ? a : b
      );
      return longestMatch.translation;
    }
    
    // No translation found, return empty string
    // In a real app, we might indicate this with a placeholder
    return '[Not found]';
  }
}

// Export a singleton instance
export const translationService = new TranslationService(fullDictionary);
