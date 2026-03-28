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

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

export function useSpeechRecognition(options: {
  language?: string;
  onResult?: (transcript: string) => void;
} = {}): SpeechRecognitionHook {
  const { language = 'vi-VN', onResult } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isIOSRef = useRef<boolean>(false);

  useEffect(() => {
    isIOSRef.current = isIOS();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported');
      return;
    }

    // Initialize recognition object
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // iOS doesn't support true continuous
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // On iOS, restart recognition if we were listening continuously
      // This handles cases where iOS stops recognition after a period
      if (isIOSRef.current && isListening) {
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
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
      if (event.error === 'aborted') return;
      
      // Handle iOS-specific errors
      if (isIOSRef.current) {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          // On iOS, sometimes we need to restart the recognition
          setError(`Microphone access issue: ${event.error}`);
        } else {
          setError(event.error);
        }
      } else {
        setError(event.error);
      }
      
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
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
        if (onResult) {
          onResult(finalTranscript);
        }
      } else if (interimTranscript) {
        // Update interim transcript for better UX
        setTranscript(interimTranscript);
      }
    };

    recognitionRef.current = recognition;
  }, [language, onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        // On iOS, ensure we have proper permissions and context
        if (isIOSRef.current) {
          // iOS requires user gesture to start recognition
          // The calling component should ensure this is triggered by a user action
          recognitionRef.current.start();
        } else {
          recognitionRef.current.start();
        }
      } catch (e) {
        console.error('Failed to start:', e);
        setError('Failed to start speech recognition: ' + (e as Error).message);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
        console.warn('Failed to stop recognition:', e);
      }
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening
  };
}

export function useTextToSpeech() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // On iOS, we need to ensure the speech synthesis is properly initialized
    if (isIOS) {
      // iOS sometimes requires a small delay after user interaction
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower rate works better on iOS
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
      }, 10);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [isIOS]);

  return { speak };
}