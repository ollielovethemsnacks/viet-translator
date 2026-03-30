import { useState, useEffect, useCallback } from 'react';
import { isIOS } from './isIOS';

/**
 * Custom hook for text-to-speech functionality
 * @returns Object containing speech synthesis functions and state
 */
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