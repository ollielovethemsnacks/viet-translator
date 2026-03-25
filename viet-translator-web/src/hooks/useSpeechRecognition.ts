import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
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
  isAdmin: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for Vietnamese speech recognition using Web Speech API
 */
export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const {
    language = 'vi-VN',
    continuous = true,
    interimResults = true,
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition as SpeechRecognitionConstructor | undefined;

    if (!SpeechRecognition) {
      if (isMountedRef.current) {
        setError('Browser does not support speech recognition');
        setIsAdmin(true);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true);
        setError(null);
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessage = event.error || 'Unknown error';
      if (isMountedRef.current) {
        setError(errorMessage);
        setIsListening(false);
        
        // Auto-restart on network error
        if (errorMessage === 'network' && isListening) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              // Ignore if already started
            }
          }, 1000);
        } else if (onError) {
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

    recognitionRef.current = recognition;

    return () => {
      isMountedRef.current = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [language, continuous, interimResults, onResult, onError, isListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // May already be started
        console.log('Speech recognition already started');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setCurrentTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    currentTranscript,
    finalTranscript,
    isAdmin,
    error,
    startListening,
    stopListening,
    reset
  };
}

/**
 * Hook for text-to-speech in English
 */
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
      setError('Text-to-speech not supported in this browser');
      return false;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
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
