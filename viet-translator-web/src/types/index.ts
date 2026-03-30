/**
 * Type definitions for the Viet Translator app
 */

export interface DictionaryEntry {
  vi: string;
  en: string;
  category: string;
}

export interface TranslationMatch {
  word: string;
  translation: string;
}

export interface TranslationResult {
  result: string;
  matches: TranslationMatch[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: string | null) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export interface WebSpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isIos: boolean;
  reset: () => void;
}

export interface TranslationState {
  translations: Array<{ transcription: string; translation: string }>;
  currentText: string;
  isListening: boolean;
  history: Array<{ transcription: string; translation: string; timestamp: number }>;
  lastUpdated: number;
  selectedVoice: SpeechSynthesisVoice | null;
  selectedOption: string;
}

export interface TranslationStore extends TranslationState {
  addTranslation: (transcription: string, translation: string) => void;
  clearTranslations: () => void;
  setCurrentText: (text: string) => void;
  setIsListening: (isListening: boolean) => void;
  addToHistory: (transcription: string, translation: string) => void;
  clearHistory: () => void;
  reset: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  setSelectedOption: (option: string) => void;
}

export interface SettingsPanelProps {
  onClose: () => void;
  isOfflineMode: boolean;
  toggleOfflineMode: (enable: boolean) => void;
  downloadModel: () => void;
  isModelDownloading: boolean;
  modelDownloadProgress: number;
  isModelLoaded: boolean;
  checkModelStatus: () => Promise<boolean>;
}

export interface TranslationBubbleProps {
  transcription: string;
  translation: string;
  color: string;
  onSpeak?: (text: string) => void;
}

export interface TranslationViewProps {
  onSpeak?: (text: string) => void;
}