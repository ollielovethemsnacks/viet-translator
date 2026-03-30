/**
 * Constants for the Viet Translator app
 */

export const APP_CONFIG = {
  SUPPORTED_LANGUAGES: ['vi-VN', 'en-US'],
  DEFAULT_SPEECH_LANGUAGE: 'vi-VN',
  DEFAULT_TRANSLATION_LANGUAGE: 'en-US',
  MAX_HISTORY_ITEMS: 100,
  DEBOUNCE_TIME_MS: 300,
  THROTTLE_TIME_MS: 1000,
  SPEECH_RATE_DESKTOP: 1.0,
  SPEECH_RATE_IOS: 0.9,
} as const;

export const DICTIONARY_CATEGORIES = [
  'greetings',
  'family',
  'expressions',
  'time',
  'numbers',
  'food',
  'actions',
  'places',
  'body',
  'colors',
  'emotions',
  'adjectives',
  'questions',
  'common',
  'nature',
  'politeness',
  'conversation-work',
  'conversation-travel',
  'conversation-health',
  'cooking',
  'clothing',
  'education',
  'technology',
  'health',
  'sports',
  'animals',
  'transportation'
] as const;

export const ERROR_MESSAGES = {
  SPEECH_NOT_SUPPORTED: 'Web Speech API not supported in this browser',
  MICROPHONE_ACCESS_DENIED: 'Microphone access denied. Please allow microphone access in your browser settings.',
  NO_SPEECH_DETECTED: 'No speech detected. Please speak closer to the microphone.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVICE_NOT_ALLOWED: 'Speech recognition service not allowed. Check your browser settings.',
} as const;

export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY_BLUE: '#3B82F6',
    SECONDARY_GREEN: '#10B981',
    ACCENT_YELLOW: '#F59E0B',
    PINK_ACCENT: '#EC4899',
  },
  SPEAKER_COLORS: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'] as const,
} as const;