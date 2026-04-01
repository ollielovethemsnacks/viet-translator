import { useEffect, useCallback } from 'react';
import { useSpeechRecognitionErrorHandler } from './useSpeechRecognitionErrorHandler';
import { useWebSpeechRecognitionSetup, type WebSpeechRecognitionHook, type SpeechRecognitionOptions } from './useWebSpeechRecognitionSetup';
import { useSpeechRecognitionEventHandlers } from './useSpeechRecognitionEventHandlers';

/**
 * Main hook for managing Web Speech API recognition with all the logic
 * @param options - Configuration options for speech recognition
 * @returns Object containing speech recognition state and controls
 */
export function useWebSpeechRecognition(options: SpeechRecognitionOptions = {}): WebSpeechRecognitionHook {
  const hookSetup = useWebSpeechRecognitionSetup(options);
  const { normalizeError } = useSpeechRecognitionErrorHandler(hookSetup.isIos);

  const {
    onRecognitionStart,
    onRecognitionEnd,
    onRecognitionError,
    onRecognitionResult
  } = useSpeechRecognitionEventHandlers({
    ...hookSetup,
    normalizeError,
    clearError: hookSetup.clearErrorCallback
  });

  const {
    recognitionRef,
    isMountedRef,
    /*setIsListening,*/ // Removing unused variable
    setTranscript,
    setError,
    setIsSupported,
    isIos,
    onResult,
    onInterim,
    onError,
    onListeningChange,
    language,
    clearErrorCallback: clearError
  } = hookSetup;

  // Ensure cleanup on unmount
  useEffect(() => {
    // Only set to true initially if not already set
    if (!isMountedRef.current) {
      isMountedRef.current = true;
    }

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition on unmount:', e);
        }
      }
    };
  }, []);

  // Initialize recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already initialized to prevent double initialization in StrictMode
    if (recognitionRef.current) {
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        const errorMsg = 'Web Speech API not supported in this browser';
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
        return;
      }

      // Initialize recognition object
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous recognition
      recognition.interimResults = true;
      recognition.lang = language;

      // Event handlers
      recognition.onstart = onRecognitionStart;
      recognition.onend = onRecognitionEnd;
      recognition.onerror = onRecognitionError;
      recognition.onresult = onRecognitionResult;

      recognitionRef.current = recognition;

    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsSupported(false);
      const errorMsg = 'Failed to initialize speech recognition';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
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
  }, [language, onResult, onInterim, onError, onListeningChange, isIos, clearError, onRecognitionStart, onRecognitionEnd, onRecognitionError, onRecognitionResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition not initialized';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    if (hookSetup.isListening) {
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
  }, [hookSetup.isListening, setError, onError]);

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
  }, [setTranscript, clearError]);

  return {
    isListening: hookSetup.isListening,
    transcript: hookSetup.transcript,
    isSupported: hookSetup.isSupported,
    error: hookSetup.error,
    startListening,
    stopListening,
    isIos,
    reset
  };
}