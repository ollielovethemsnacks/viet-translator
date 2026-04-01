import { fullDictionary } from './dictionary';

// Define interfaces for better type safety
export interface DictionaryEntry {
  vi: string;
  en: string;
  category: string;
}

export interface TranslationMatch {
  word: string;
  translation: string;
}

/**
 * Optimized service for Vietnamese to English translation
 * Uses dictionary-based approach with improved performance characteristics
 */
export class OptimizedTranslationService {
  private readonly dictionary: DictionaryEntry[];
  private readonly trie: TrieNode;
  private readonly tonelessMap: Map<string, string>;
  private readonly toneMap: Record<string, string>;
  private readonly compiledPatterns: RegExp[];

  constructor(dictionary: DictionaryEntry[]) {
    this.dictionary = dictionary;
    this.toneMap = {
      'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
      'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
      'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
      'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
      'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
      'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
      'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
      'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
      'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
      'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
      'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
      'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
      'đ': 'd',
      'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
      'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
      'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
      'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
      'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
      'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
      'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
      'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
      'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
      'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
      'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
      'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
      'Đ': 'D'
    };

    // Pre-compile frequently used regex patterns FIRST (before removeTones is called)
    this.compiledPatterns = [
      new RegExp(/[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/gi),
      new RegExp(/[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]/gi)
    ];

    // Pre-build toneless mappings for performance
    this.tonelessMap = new Map();
    for (const entry of dictionary) {
      const tonelessKey = this.removeTones(entry.vi);
      this.tonelessMap.set(entry.vi, tonelessKey);
    }

    // Build trie for efficient prefix matching
    this.trie = this.buildTrie(dictionary);
  }

  private buildTrie(entries: DictionaryEntry[]): TrieNode {
    const root: TrieNode = {};
    for (const entry of entries) {
      let node: TrieNode | DictionaryEntry = root;
      const word = entry.vi.toLowerCase();
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!node[char]) {
          const newNode: TrieNode = {};
          node[char] = newNode;
          node = newNode;
        } else {
          node = node[char] as TrieNode;
        }
      }
      // Store the entry at the end of the word
      (node as TrieNode).entry = entry;
    }
    return root;
  }

  /**
   * Remove Vietnamese tone marks for fuzzy matching
   */
  private removeTones(text: string): string {
    return text
      .replace(this.compiledPatterns[0], char => this.toneMap[char] || char)
      .replace(this.compiledPatterns[1], char => this.toneMap[char] || char);
  }

  /**
   * Find exact match for a word or phrase
   */
  private findExactMatch(text: string): DictionaryEntry | undefined {
    const normalizedText = text.trim().toLowerCase();
    return this.dictionary.find(entry => entry.vi === normalizedText);
  }

  /**
   * Find toneless match for a word or phrase
   */
  private findTonelessMatch(text: string): DictionaryEntry | undefined {
    const normalizedText = text.trim().toLowerCase();
    const tonelessText = this.removeTones(normalizedText);

    for (const entry of this.dictionary) {
      const entryToneless = this.tonelessMap.get(entry.vi) || this.removeTones(entry.vi);
      if (entryToneless === tonelessText) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * Search for matches using the trie data structure
   */
  private searchTrie(text: string): DictionaryEntry | undefined {
    const normalizedText = text.trim().toLowerCase();
    let node: TrieNode | DictionaryEntry = this.trie;
    let match: DictionaryEntry | undefined = undefined;

    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      if ((node as TrieNode)[char]) {
        node = (node as TrieNode)[char];
        if ((node as TrieNode).entry) {
          match = (node as TrieNode).entry;
        }
      } else {
        break;
      }
    }

    return match;
  }

  /**
   * Find translation for a word or phrase with multiple matching strategies
   */
  findTranslation(text: string): string | null {
    const trimmedText = text.trim();
    if (!trimmedText) return null;

    // Try exact match first
    const exactMatch = this.findExactMatch(trimmedText);
    if (exactMatch) return exactMatch.en;

    // Try toneless match
    const tonelessMatch = this.findTonelessMatch(trimmedText);
    if (tonelessMatch) return tonelessMatch.en;

    // Try trie-based prefix matching
    const trieMatch = this.searchTrie(trimmedText);
    if (trieMatch) return trieMatch.en;

    // Fallback to substring search for longer phrases
    const normalizedText = trimmedText.toLowerCase();
    const tonelessText = this.removeTones(normalizedText);

    for (const entry of this.dictionary) {
      const entryToneless = this.tonelessMap.get(entry.vi) || this.removeTones(entry.vi);
      if (normalizedText.includes(entry.vi) || tonelessText.includes(entryToneless)) {
        return entry.en;
      }
    }

    return null;
  }

  /**
   * Find all matching words in the text that have translations
   */
  findSupportingWords(text: string): TranslationMatch[] {
    const matches: TranslationMatch[] = [];
    const normalizedText = text.toLowerCase();
    const tonelessText = this.removeTones(normalizedText);

    // Use Set to prevent duplicate matches
    const processedWords = new Set<string>();

    // Look for phrase matches first (longer sequences)
    for (const entry of this.dictionary) {
      const tonelessEntry = this.tonelessMap.get(entry.vi) || this.removeTones(entry.vi);

      // Check for exact phrase matches in the text
      if (normalizedText.includes(entry.vi) && !processedWords.has(entry.vi)) {
        matches.push({ word: entry.vi, translation: entry.en });
        processedWords.add(entry.vi);
      } else if (tonelessText.includes(tonelessEntry) && !processedWords.has(entry.vi)) {
        matches.push({ word: entry.vi, translation: entry.en });
        processedWords.add(entry.vi);
      }
    }

    return matches;
  }

  /**
   * Main translation method with optimized matching
   */
  translate(text: string): string {
    const cleanedText = text.trim();

    if (!cleanedText) return '';

    // Try direct translation first
    const directTranslation = this.findTranslation(cleanedText);
    if (directTranslation) return directTranslation;

    // If no direct match, try to find partial matches
    const matches = this.findSupportingWords(cleanedText);

    if (matches.length > 0) {
      // For multiple matches, combine them appropriately
      if (matches.length === 1) {
        return matches[0].translation;
      }

      // For multiple matches, try to build a coherent translation
      // Prioritize matches that make sense together
      return matches.map(m => m.translation).join(' + ');
    }

    // No translation found
    return '[Not found]';
  }

  /**
   * Enhanced translation method that returns detailed information
   */
  translateWithDetails(text: string): {
    result: string;
    matches: TranslationMatch[];
    confidence: 'high' | 'medium' | 'low'
  } {
    const cleanedText = text.trim();

    if (!cleanedText) {
      return { result: '', matches: [], confidence: 'low' };
    }

    // Try direct translation first
    const directTranslation = this.findTranslation(cleanedText);
    if (directTranslation) {
      return {
        result: directTranslation,
        matches: [{ word: cleanedText, translation: directTranslation }],
        confidence: 'high'
      };
    }

    // If no direct match, find supporting words
    const matches = this.findSupportingWords(cleanedText);

    if (matches.length > 0) {
      const result = matches.map(m => m.translation).join(' + ');
      const confidence = matches.length > 1 ? 'medium' : 'low';

      return {
        result,
        matches,
        confidence
      };
    }

    return {
      result: '[Not found]',
      matches: [],
      confidence: 'low'
    };
  }
}

// Trie node type for efficient prefix matching
interface TrieNode {
  [key: string]: any;
  entry?: DictionaryEntry;
}

// Export a singleton instance
export const optimizedTranslationService = new OptimizedTranslationService(fullDictionary);