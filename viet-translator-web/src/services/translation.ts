import { OptimizedTranslationService, optimizedTranslationService } from './optimizedTranslation';

// Re-export the optimized version as the primary service for backward compatibility
export { OptimizedTranslationService };
export const translationService = optimizedTranslationService;