import { useState, useCallback, useEffect, useRef } from 'react';
import { phoWhisperService } from '../services/phowhisperService';
import { createAudioStream, createAudioBufferManager } from '../utils/audioStreaming';

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
  audioLevel: number;
  transcriptionLanguage: string;
}

/**
 * PhoWhisper Speech Recognition Hook
 *
 * Implements real-time Vietnamese speech recognition using PhoWhisper
 * (Vietnamese-optimized Whisper model) with @xenova/transformers.
 *
 * Features:
 * - Real-time audio capture and streaming
 * - Automatic resampling to 16kHz
 * - Chunked transcription for low latency
 * - Offline operation after model download
 * - Safari/iOS compatible
 */
export function usePhoWhisperSpeechRecognition(options: {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onInterim?: (transcript: string) => void;
  language?: string;
} = {}): PhoWhisperHook {
  const { onResult, onInterim, language = 'vi' } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  // Language state is declared but not used yet - reserved for future language selection
  const [_transcriptionLanguage] = useState(language);

  // Refs for audio streaming
  const audioStreamRef = useRef<any>(null);
  const audioBufferManagerRef = useRef<any>(null);
  const transcriptionRef = useRef('');
  const isProcessingRef = useRef(false);

  // Check model status on mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  // Check model status
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

  // Download model
  const downloadModel = async () => {
    try {
      setIsModelDownloading(true);
      setModelDownloadProgress(0);
      setError(null);

      await phoWhisperService.downloadModel((progress, step) => {
        setModelDownloadProgress(progress);
        console.log(`Download: ${step} - ${progress}%`);
      });

      setIsModelLoaded(true);
      console.log('Model download complete');

    } catch (err) {
      console.error('Error downloading model:', err);
      setError(`Download failed: ${(err as Error).message}`);
    } finally {
      setIsModelDownloading(false);
    }
  };

  // Load model if not loaded
  const ensureModelLoaded = async (): Promise<void> => {
    if (!isModelLoaded && !isModelDownloading) {
      try {
        await phoWhisperService.loadModel();
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading model:', err);
        throw err;
      }
    }
  };

  // Start audio capture and transcription
  const startListening = useCallback(async () => {
    if (isListening) return;

    // Check if model is ready
    if (!isModelLoaded) {
      setError('PhoWhisper model not ready. Please download the model first.');
      return;
    }

    // Ensure model is loaded
    try {
      await ensureModelLoaded();
    } catch (err) {
      setError(`Failed to load model: ${(err as Error).message}`);
      return;
    }

    try {
      setError(null);
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
      transcriptionRef.current = '';

      // Initialize audio stream
      audioStreamRef.current = createAudioStream();
      audioBufferManagerRef.current = createAudioBufferManager(30);

      // Start audio capture
      await audioStreamRef.current.start(
        (chunk: Float32Array) => {
          // Process audio chunk
          processAudioChunk(chunk);
        },
        () => {
          // Recording ended
          setIsListening(false);
        }
      );

      console.log('Listening started');

    } catch (err) {
      console.error('Error starting listening:', err);
      setError(`Failed to start: ${(err as Error).message}`);
      setIsListening(false);
    }
  }, [isListening, isModelLoaded]);

  // Process audio chunk
  const processAudioChunk = async (chunk: Float32Array): Promise<void> => {
    if (isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;

      // Add to buffer manager
      if (audioBufferManagerRef.current) {
        audioBufferManagerRef.current.addChunk(chunk);
      }

      // Update audio level
      if (audioStreamRef.current) {
        setAudioLevel(audioStreamRef.current.getAudioLevel());
      }

      // Transcribe the chunk
      const result = await phoWhisperService.transcribe(chunk, _transcriptionLanguage);

      if (result.text) {
        // Update interim transcript
        const currentText = transcriptionRef.current + (transcriptionRef.current ? ' ' : '') + result.text;
        transcriptionRef.current = currentText;
        setInterimTranscript(currentText);

        // Call onInterim callback
        if (onInterim) {
          onInterim(result.text);
        }

        console.log(`Transcribed: ${result.text}`);
      }

    } catch (err) {
      console.warn('Chunk transcription failed:', err);
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Stop audio capture
  const stopListening = useCallback(async () => {
    try {
      // Stop audio stream
      if (audioStreamRef.current) {
        audioStreamRef.current.stop();
        audioStreamRef.current = null;
      }

      // Get final transcription from buffer
      let finalTranscript = transcriptionRef.current;

      if (audioBufferManagerRef.current) {
        const bufferedData = audioBufferManagerRef.current.getAudioData();
        if (bufferedData.length > 0 && finalTranscript.length === 0) {
          // Transcribe the full buffered audio
          const result = await phoWhisperService.transcribe(bufferedData, _transcriptionLanguage);
          finalTranscript = result.text;
        }
        audioBufferManagerRef.current.clear();
      }

      // Set final transcript
      if (finalTranscript) {
        setTranscript(finalTranscript);
        setInterimTranscript('');
        transcriptionRef.current = '';

        // Call onResult callback
        if (onResult) {
          onResult(finalTranscript, true);
        }
      }

      setIsListening(false);
      setAudioLevel(0);

      console.log('Listening stopped');

    } catch (err) {
      console.error('Error stopping listening:', err);
      setError(`Failed to stop: ${(err as Error).message}`);
      setIsListening(false);
    }
  }, [isListening, onResult]);

  // Toggle offline mode
  const toggleOfflineMode = useCallback((enable: boolean) => {
    setIsOfflineMode(enable);
    if (enable && !isModelLoaded) {
      setError('Please download the PhoWhisper model first to use offline mode.');
    } else {
      setError(null);
    }
  }, [isModelLoaded]);

  // Clear error
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
    clearError,
    audioLevel,
    transcriptionLanguage: _transcriptionLanguage,
  };
}

export default usePhoWhisperSpeechRecognition;
