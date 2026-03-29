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

interface WebSpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isIos: boolean;
}

export function useWebSpeechRecognition(options: {
  language?: string;
  onResult?: (transcript: string) => void;
  onInterim?: (transcript: string) => void;
} = {}): WebSpeechRecognitionHook {
  const { language = 'vi-VN', onResult, onInterim } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isIos] = useState(isIOS());

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API not supported in this browser');
      return;
    }

    // Initialize recognition object
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Enable continuous recognition
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');

      // On iOS, sometimes we need to restart recognition manually after it stops
      // This handles cases where iOS stops recognition after a period
      if (isIos && recognitionRef.current) {
        // Only restart if we were actively listening and the stop wasn't intentional
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

      let errorMessage = event.error;
      
      // Handle iOS-specific errors
      if (isIos) {
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak closer to the microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'Could not access microphone. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Check your browser settings.';
            break;
          default:
            errorMessage = `Microphone access issue: ${event.error}`;
        }
      }

      setError(errorMessage);
      setIsListening(false);
      console.error('Speech recognition error:', event);
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
        
        // Clear any previous error when we get a result
        if (error) {
          setError(null);
        }
        
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

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onResult, onInterim, isIos]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        // On iOS, ensure we have proper permissions and context
        // The calling component should ensure this is triggered by a user action
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setError('Failed to start speech recognition: ' + (e as Error).message);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
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
    stopListening,
    isIos
  };
}

// Text-to-speech hook for speaking translations
export function useTextToSpeech() {
  const [isIos] = useState(isIOS);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance properties
    utterance.lang = 'en-US'; // English for translations
    utterance.rate = isIos ? 0.9 : 1.0; // Slightly slower rate works better on iOS
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Handle iOS-specific issues
    if (isIos) {
      // iOS sometimes requires a small delay after user interaction
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 10);
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, [isIos]);

  return { speak };
}