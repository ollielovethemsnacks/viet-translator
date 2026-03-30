import { useEffect, useRef, useState, useCallback } from 'react';

// Helper function to detect iOS
function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMacintosh = /Macintosh/.test(userAgent);
  const hasTouch = navigator.maxTouchPoints ? navigator.maxTouchPoints > 1 : false;

  return isIosDevice || (isMacintosh && hasTouch);
}

// Define interfaces for better type safety
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

export function useWebSpeechRecognition(options: SpeechRecognitionOptions = {}): WebSpeechRecognitionHook {
  const {
    language = 'vi-VN',
    onResult,
    onInterim,
    onError,
    onListeningChange
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isIos] = useState(isIOS());

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Clear error when starting recognition
  const clearError = useCallback(() => {
    if (error) {
      setError(null);
      if (onError) {
        onError(''); // Passing empty string instead of null
      }
    }
  }, [error, onError]);

  // Normalize error messages
  const normalizeError = useCallback((event: any): string => {
    let errorMessage = event.error || 'Unknown error';

    // Handle iOS-specific errors
    if (isIos) {
      switch (event.error) {
        case 'no-speech':
          return 'No speech detected. Please speak closer to the microphone.';
        case 'audio-capture':
          return 'Could not access microphone. Please check permissions.';
        case 'not-allowed':
          return 'Microphone access denied. Please allow microphone access in your browser settings.';
        case 'service-not-allowed':
          return 'Speech recognition service not allowed. Check your browser settings.';
        case 'network':
          return 'Network error. Please check your internet connection.';
        default:
          return `Microphone access issue: ${event.error}`;
      }
    }

    // Handle common desktop errors
    switch (event.error) {
      case 'no-speech':
        return 'No speech detected. Try speaking more clearly.';
      case 'audio-capture':
        return 'Could not access microphone. Please check hardware connections.';
      case 'not-allowed':
        return 'Permission denied. Please enable microphone access for this site.';
      case 'network':
        return 'Network error occurred. Check your connection.';
      case 'aborted':
        return 'Recognition aborted. Please try again.';
      default:
        return `Speech recognition error: ${errorMessage}`;
    }
  }, [isIos]);

  // Ensure cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initialize recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API not supported in this browser');
      if (onError) {
        onError('Web Speech API not supported in this browser');
      }
      return;
    }

    try {
      // Initialize recognition object
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous recognition
      recognition.interimResults = true;
      recognition.lang = language;

      // Event handlers
      recognition.onstart = () => {
        if (!isMountedRef.current) return;

        setIsListening(true);
        clearError();
        console.log('Speech recognition started');

        if (onListeningChange) {
          onListeningChange(true);
        }
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;

        setIsListening(false);
        console.log('Speech recognition ended');

        if (onListeningChange) {
          onListeningChange(false);
        }

        // On iOS, sometimes we need to restart recognition manually after it stops
        // This handles cases where iOS stops recognition after a period
        if (isIos && recognitionRef.current && isMountedRef.current) {
          // Only restart if we were actively listening and the stop wasn't intentional
          setTimeout(() => {
            if (isMountedRef.current && isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Failed to restart recognition on iOS:', e);
              }
            }
          }, 100);
        }
      };

      recognition.onerror = (event: any) => {
        if (!isMountedRef.current) return;

        // Some errors are non-fatal and can be ignored
        if (event.error === 'aborted') return;

        const normalizedErrorMessage = normalizeError(event);
        setError(normalizedErrorMessage);

        if (onError) {
          onError(normalizedErrorMessage);
        }

        // Ensure state is consistent
        setIsListening(false);
        if (onListeningChange) {
          onListeningChange(false);
        }

        console.error('Speech recognition error:', event);
      };

      recognition.onresult = (event: any) => {
        if (!isMountedRef.current) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);

          // Clear any previous error when we get a result
          clearError();

          if (onResult) {
            onResult(finalTranscript);
          }
        } else if (interimTranscript) {
          // Update interim transcript for better UX
          setTranscript(interimTranscript);

          if (onInterim) {
            onInterim(interimTranscript);
          }
        }
      };

      recognitionRef.current = recognition;

    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsSupported(false);
      setError('Failed to initialize speech recognition');
      if (onError) {
        onError('Failed to initialize speech recognition');
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Safe to ignore errors during cleanup
        }
      }
    };
  }, [language, onResult, onInterim, onError, onListeningChange, isIos, clearError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.warn('Speech recognition already in progress');
      return;
    }

    try {
      // On iOS, ensure we have proper permissions and context
      // The calling component should ensure this is triggered by a user action
      recognitionRef.current.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      const errorMsg = `Failed to start speech recognition: ${e.message || e}`;
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
        console.warn('Failed to stop recognition:', e);
      }
    }
    // We rely on the onend handler to update the state, so we don't call setIsListening(false) here
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    clearError();
  }, [clearError]);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    isIos,
    reset
  };
}

// Text-to-speech hook for speaking translations
export function useTextToSpeech() {
  const [isIos] = useState(isIOS);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        setVoicesLoaded(true);
      };

      // Some browsers may load voices asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Validate input text
    if (!text?.trim()) {
      console.warn('Empty text provided to speech synthesis');
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure utterance properties
    utterance.lang = 'en-US'; // English for translations
    utterance.rate = isIos ? 0.9 : 1.0; // Slightly slower rate works better on iOS
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Optionally select a voice if available
    if (availableVoices.length > 0) {
      // Find an English voice if available
      const englishVoice = availableVoices.find(v =>
        v.lang.startsWith('en-') || v.lang.startsWith('en_')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    // Handle iOS-specific issues
    if (isIos) {
      // iOS sometimes requires a small delay after user interaction
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          // Another utterance is already in progress
          console.warn('Speech synthesis already in progress');
          return;
        }
        window.speechSynthesis.speak(utterance);
      }, 10);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, [isIos, availableVoices]);

  return {
    speak,
    voicesLoaded,
    availableVoices
  };
}