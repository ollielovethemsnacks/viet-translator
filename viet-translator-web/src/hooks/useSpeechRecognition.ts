import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart?: (event: any) => void;
  onend?: (event: any) => void;
  onerror?: (event: any) => void;
  onresult?: (event: any) => void;
}

type SpeechRecognitionConstructor = {
  prototype: WebSpeechRecognition;
  new(): WebSpeechRecognition;
};

interface SpeechRecognitionHook {
  isListening: boolean;
  currentTranscript: string;
  finalTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export interface SpeechRecognitionOptions {
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const {
    language = 'vi-VN',
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const isMountedRef = useRef(true);
  const shouldRestartRef = useRef(false);
  const lastResultTimeRef = useRef<number>(Date.now());
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition as SpeechRecognitionConstructor | undefined;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true);
        setError(null);
        lastResultTimeRef.current = Date.now();
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false);
        
        if (shouldRestartRef.current) {
          const timeSinceLastResult = Date.now() - lastResultTimeRef.current;
          
          if (timeSinceLastResult < 5000) {
            restartTimeoutRef.current = setTimeout(() => {
              if (shouldRestartRef.current && isMountedRef.current) {
                try {
                  recognition.start();
                } catch (e) {
                  console.log('Failed to restart:', e);
                }
              }
            }, 100);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = event.error || 'Unknown error';
      
      if (isMountedRef.current) {
        if (errorMessage === 'aborted' || errorMessage === 'no-speech') {
          return;
        }
        
        setError(errorMessage);
        setIsListening(false);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
          isFinal = true;
        } else {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript) {
        lastResultTimeRef.current = Date.now();
        
        if (isFinal) {
          setFinalTranscript(transcript);
          setCurrentTranscript('');
        } else {
          setCurrentTranscript(transcript);
        }

        if (onResult) {
          onResult(transcript, isFinal);
        }
      }
    };

    return recognition;
  }, [language, onResult, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    recognitionRef.current = createRecognition();

    return () => {
      isMountedRef.current = false;
      shouldRestartRef.current = false;
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [createRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      shouldRestartRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log('Start error:', e);
      }
    }
  }, [isListening, createRecognition]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }
    
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setCurrentTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    currentTranscript,
    finalTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    reset
  };
}

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, voice?: SpeechSynthesisVoice) => {
    if (!window.speechSynthesis) {
      setError('Text-to-speech not supported');
      return false;
    }

    window.speechSynthesis.cancel();

    if (!text) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setError(event.error || 'Speech synthesis error');
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const getEnglishVoices = useCallback(() => {
    return voices.filter(v => v.lang.startsWith('en'));
  }, [voices]);

  return {
    voices,
    isSpeaking,
    error,
    speak,
    stopSpeaking,
    getEnglishVoices
  };
}
