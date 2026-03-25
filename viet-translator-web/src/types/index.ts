export interface Transcription {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  isFinal: boolean;
  speakerId: number;
}

export interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  timestamp: Date;
}

export interface TranslationItem {
  id: string;
  transcription: Transcription;
  translation: Translation;
  speakerColor: string;
}

export type Language = 'vi' | 'en';

export interface SpeechRecognitionError {
  error: string;
  message: string;
}
