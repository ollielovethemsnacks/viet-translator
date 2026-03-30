import { useState, useRef, /*useEffect,*/ useCallback } from 'react';
import { isIOS } from './isIOS';

// Define interfaces for better type safety
export interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: string | null) => void; // Changed to allow null
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

/**
 * Custom hook for managing Web Speech API recognition
 * @param options - Configuration options for speech recognition
 * @returns Object containing speech recognition state and controls
 */
export function useWebSpeechRecognitionSetup(options: SpeechRecognitionOptions = {}) {
  const {
    language = 'vi-VN',
    onResult,
    onInterim,
    onError,
    onListeningChange
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null); // Fixed initialization
  const [isSupported, setIsSupported] = useState(true);
  const [isIos] = useState(isIOS());

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const clearError = useCallback(() => {
    if (error) {
      setError(null);
      if (onError) {
        onError(null);
      }
    }
  }, [error, onError]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    isIos,
    recognitionRef,
    isMountedRef,
    setIsListening,
    setTranscript,
    setError,
    setIsSupported,
    clearError,
    onResult,
    onInterim,
    onError,
    onListeningChange,
    language,
    clearErrorCallback: clearError
  };
}