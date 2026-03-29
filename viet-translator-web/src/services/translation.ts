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
   * Remove Vietnamese tone marks for fuzzy matching
   */
  private removeTones(text: string): string {
    const toneMap: Record<string, string> = {
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
    
    return text.replace(/[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]/g, 
      char => toneMap[char] || char);
  }

  /**
   * Find translation for a word or phrase
   */
  findTranslation(text: string): string | null {
    const normalizedText = text.trim().toLowerCase();
    const tonelessText = this.removeTones(normalizedText);

    if (!normalizedText) return null;

    // Try exact match first
    const exactMatch = this.dictionary.find(entry => entry.vi === normalizedText);
    if (exactMatch) return exactMatch.en;

    // Try toneless match
    const tonelessMatch = this.dictionary.find(entry => 
      this.removeTones(entry.vi) === tonelessText
    );
    if (tonelessMatch) return tonelessMatch.en;

    // Check if the text contains any dictionary entries (prioritize longer matches)
    const sortedDict = [...this.dictionary].sort((a, b) => b.vi.length - a.vi.length);
    for (const entry of sortedDict) {
      const tonelessEntry = this.removeTones(entry.vi);
      if (normalizedText.includes(entry.vi) || tonelessText.includes(tonelessEntry)) {
        return entry.en;
      }
    }

    // Try reversing - check if any dictionary entry is contained in the text
    for (const entry of sortedDict) {
      if (entry.vi.includes(normalizedText) || this.removeTones(entry.vi).includes(tonelessText)) {
        return entry.en;
      }
    }

    return null;
  }

  /**
   * Find all matching words in the text that have translations
   */
  supportingWords(text: string): Array<{ word: string; translation: string }> {
    const matches: Array<{ word: string; translation: string }> = [];
    const normalizedText = text.toLowerCase();

    // Sort by length to prioritize longer matches
    const sortedDict = [...this.dictionary].sort((a, b) => b.vi.length - a.vi.length);
    
    let remainingText = normalizedText;
    
    for (const entry of sortedDict) {
      const tonelessEntry = this.removeTones(entry.vi);
      const tonelessRemaining = this.removeTones(remainingText);
      if (remainingText.includes(entry.vi) || tonelessRemaining.includes(tonelessEntry)) {
        // Only add if not already covered by a longer match
        const alreadyCovered = matches.some(m => 
          m.word.includes(entry.vi) || entry.vi.includes(m.word)
        );
        if (!alreadyCovered) {
          matches.push({ word: entry.vi, translation: entry.en });
          // Remove matched portion to avoid duplicate matches
          remainingText = remainingText.replace(entry.vi, '');
        }
      }
    }

    return matches;
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
      // Combine all matches into a phrase translation
      if (matches.length === 1) {
        return matches[0].translation;
      }
      // Multiple matches - combine them
      return matches.map(m => m.translation).join(' + ');
    }

    // No translation found
    return '[Not found]';
  }
}

// Export a singleton instance
export const translationService = new TranslationService(fullDictionary);