import { useState, useCallback, useEffect } from 'react';
import { phoWhisperService } from '../services/phowhisperService';

interface PhoWhisperHook {
  isListening: boolean;
  isModelLoaded: boolean;
  isModelDownloading: boolean;
  modelDownloadProgress: number;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  downloadModel: () => Promise<void>;
  toggleOfflineMode: (enable: boolean) => void;
  isOfflineMode: boolean;
  checkModelStatus: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * PhoWhisper Speech Recognition Hook
 * 
 * NOTE: This is a PLACEHOLDER implementation for future PhoWhisper integration.
 * Full implementation requires:
 * 1. Converting PhoWhisper model to ONNX format
 * 2. Setting up ONNX Runtime Web
 * 3. Implementing audio preprocessing
 * 
 * For now, this hook manages the model download state but falls back to
 * showing an informative message about the future feature.
 */
export function usePhoWhisperSpeechRecognition(_options: { 
  onResult?: (transcript: string, isFinal: boolean) => void;
  onInterim?: (transcript: string) => void;
} = {}): PhoWhisperHook {
  // onResult callback - reserved for future use
  // const { onResult } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check model status on mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async (): Promise<boolean> => {
    try {
      const downloaded = await phoWhisperService.isModelDownloaded();
      setIsModelLoaded(downloaded);
      return downloaded;
    } catch (err) {
      console.error('Error checking model status:', err);
      return false;
    }
  };

  const downloadModel = async () => {
    try {
      setIsModelDownloading(true);
      setModelDownloadProgress(0);
      setError(null);
      
      await phoWhisperService.downloadModel((progress) => {
        setModelDownloadProgress(progress);
      });
      
      setIsModelLoaded(true);
      
      // Show informational message
      setError('Model downloaded! Note: Full PhoWhisper transcription requires additional setup. Using Web Speech API for now.');
    } catch (err) {
      console.error('Error downloading model:', err);
      setError(`Download failed: ${(err as Error).message}`);
    } finally {
      setIsModelDownloading(false);
    }
  };

  const startListening = useCallback(async () => {
    if (isListening) return;
    
    // Check if model is actually ready
    if (!isModelLoaded) {
      setError('PhoWhisper model not ready. Please download the model first or use Web Speech API mode.');
      return;
    }

    try {
      setError(null);
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');

      // NOTE: Full implementation would:
      // 1. Start audio recording
      // 2. Process audio through ONNX model
      // 3. Stream results back
      
      // For now, show that this feature is coming
      setError('PhoWhisper offline transcription coming soon! Switch to Web Speech API mode for now.');
      setIsListening(false);

    } catch (err) {
      console.error('Error starting PhoWhisper:', err);
      setError(`Failed to start: ${(err as Error).message}`);
      setIsListening(false);
    }
  }, [isListening, isModelLoaded]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleOfflineMode = useCallback((enable: boolean) => {
    setIsOfflineMode(enable);
    if (enable && !isModelLoaded) {
      setError('Please download the PhoWhisper model first to use offline mode.');
    } else {
      setError(null);
    }
  }, [isModelLoaded]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isModelLoaded,
    isModelDownloading,
    modelDownloadProgress,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    downloadModel,
    toggleOfflineMode,
    isOfflineMode,
    checkModelStatus,
    clearError
  };
}
