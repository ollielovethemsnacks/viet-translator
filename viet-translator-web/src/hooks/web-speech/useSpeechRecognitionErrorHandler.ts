import { useCallback } from 'react';

/**
 * Hook to handle speech recognition errors and normalize them
 * @param isIos - Whether the device is an iOS device
 * @returns Function to normalize error messages
 */
export function useSpeechRecognitionErrorHandler(isIos: boolean) {
  /**
   * Normalize error messages from speech recognition events
   * @param event - The error event object
   * @returns Normalized error message
   */
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

  return { normalizeError };
}