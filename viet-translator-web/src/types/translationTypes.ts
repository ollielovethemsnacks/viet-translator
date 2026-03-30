// Define common types for the Viet Translator app

export interface TranslationItem {
  transcription: string;
  translation: string;
}

export interface TranslationHistoryItem extends TranslationItem {
  timestamp: number;
}

export interface TranslationState {
  translations: TranslationItem[];
  currentText: string;
  isListening: boolean;
  history: TranslationHistoryItem[];
  lastUpdated: number;
  selectedVoice: SpeechSynthesisVoice | null;
  selectedOption: string;
}

export type TranslationStore = TranslationState & {
  addTranslation: (transcription: string, translation: string) => void;
  clearTranslations: () => void;
  setCurrentText: (text: string) => void;
  setIsListening: (isListening: boolean) => void;
  addToHistory: (transcription: string, translation: string) => void;
  clearHistory: () => void;
  reset: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  setSelectedOption: (option: string) => void;
};

// Speech recognition types
export interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: string) => void;
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

// Text to speech types
export interface TextToSpeechHook {
  speak: (text: string) => void;
  voicesLoaded: boolean;
  availableVoices: SpeechSynthesisVoice[];
}