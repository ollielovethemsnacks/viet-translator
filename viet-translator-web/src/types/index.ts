export interface TranslationItem {
  transcription: string;
  translation: string;
  timestamp: number;
}

export interface TranslationStore {
  translations: Array<{ transcription: string; translation: string }>;
  currentText: string;
  isListening: boolean;
  history: TranslationItem[];
  lastUpdated: number;
  
  addTranslation: (transcription: string, translation: string) => void;
  clearTranslations: () => void;
  setCurrentText: (text: string) => void;
  setIsListening: (isListening: boolean) => void;
  addToHistory: (transcription: string, translation: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface SpeechRecognitionResult {
  isListening: boolean;
  currentTranscript: string;
  finalTranscript: string;
  isAdmin: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export interface TextToSpeechResult {
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  error: string | null;
  speak: (text: string) => boolean;
  stopSpeaking: () => void;
  getEnglishVoices: () => SpeechSynthesisVoice[];
}
