import { useCallback } from 'react';

/**
 * Custom hook for creating speech recognition event handlers
 * @param params - Various callbacks and state setters from the main hook
 * @returns An object containing all the event handlers
 */
export function useSpeechRecognitionEventHandlers(params: {
  recognitionRef: React.MutableRefObject<any>;
  isMountedRef: React.MutableRefObject<boolean>;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
  onError?: (error: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  isIos: boolean;
  normalizeError: (event: any) => string;
  clearError: () => void;
}) {
  const {
    recognitionRef,
    isMountedRef,
    setIsListening,
    setTranscript,
    setError,
    onResult,
    onInterim,
    onError,
    onListeningChange,
    isIos,
    normalizeError,
    clearError
  } = params;

  const onRecognitionStart = useCallback(() => {
    if (!isMountedRef.current) return;

    setIsListening(true);
    clearError();
    console.log('Speech recognition started');

    if (onListeningChange) {
      onListeningChange(true);
    }
  }, [clearError, onListeningChange]);

  const onRecognitionEnd = useCallback(() => {
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
        if (isMountedRef.current && recognitionRef.current?.continuous && isMountedRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Failed to restart recognition on iOS:', e);
          }
        }
      }, 100);
    }
  }, [isIos, recognitionRef, isMountedRef]);

  const onRecognitionError = useCallback((event: any) => {
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
  }, [normalizeError, onError, onListeningChange, setIsListening]);

  const onRecognitionResult = useCallback((event: any) => {
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
  }, [onResult, onInterim, clearError, setTranscript]);

  return {
    onRecognitionStart,
    onRecognitionEnd,
    onRecognitionError,
    onRecognitionResult
  };
}