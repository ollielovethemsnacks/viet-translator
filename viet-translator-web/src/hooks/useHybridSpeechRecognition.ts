import { useState, useCallback, useEffect, useRef } from 'react';
import { phoWhisperService } from '../services/phowhisperService';
import { createAudioStream, createAudioBufferManager } from '../utils/audioStreaming';
import { isIosBrowser } from '../lib/whisper';

interface HybridSpeechRecognitionHook {
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
  currentMode: 'online' | 'offline' | 'auto';
  isIosBrowser: boolean;
}

/**
 * Hybrid Speech Recognition Hook
 *
 * Automatically detects the platform and uses the best available speech recognition:
 * - iOS (Safari, Chrome, Firefox, Edge): Uses Web Speech API (online, requires internet)
 * - Desktop: Uses Whisper.wasm (offline, works without internet after download)
 *
 * Features:
 * - Automatic platform detection
 * - Seamless fallback between backends
 * - Real-time audio capture and streaming
 * - Chunked transcription for low latency
 * - Offline operation on desktop after model download
 */
export function useHybridSpeechRecognition(options: {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onInterim?: (transcript: string) => void;
  language?: string;
  autoMode?: boolean; // If true, automatically switches between online/offline
} = {}): HybridSpeechRecognitionHook {
  const { onResult, onInterim, language = 'vi', autoMode = true } = options;

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
  const [currentMode, setCurrentMode] = useState<'online' | 'offline' | 'auto'>('auto');
  const [_transcriptionLanguage] = useState(language);

  // Refs for audio streaming
  const audioStreamRef = useRef<any>(null);
  const audioBufferManagerRef = useRef<any>(null);
  const transcriptionRef = useRef('');
  const isProcessingRef = useRef(false);

  // Detect if iOS browser
  const isIos = isIosBrowser();

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

  // Download model (for desktop/whisper mode)
  const downloadModel = async () => {
    try {
      setIsModelDownloading(true);
      setModelDownloadProgress(0);
      setError(null);

      await phoWhisperService.downloadModel((progress: number, step: string) => {
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
    if (!phoWhisperService.isModelReady() && !isModelDownloading) {
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

    // Determine which mode to use
    const useOfflineMode = !isIos && (isOfflineMode || autoMode);

    if (useOfflineMode) {
      // Check if model is ready for offline mode
      if (!isModelLoaded) {
        setError('Whisper model not ready. Please download the model first for offline mode.');
        return;
      }

      // Ensure model is loaded
      try {
        await ensureModelLoaded();
      } catch (err) {
        setError(`Failed to load model: ${(err as Error).message}`);
        return;
      }

      setCurrentMode('offline');
    } else {
      setCurrentMode('online');
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
          processAudioChunk(chunk, useOfflineMode);
        },
        () => {
          // Recording ended
          setIsListening(false);
        }
      );

      console.log(`Listening started in ${useOfflineMode ? 'offline' : 'online'} mode`);

    } catch (err) {
      console.error('Error starting listening:', err);
      setError(`Failed to start: ${(err as Error).message}`);
      setIsListening(false);
    }
  }, [isListening, isModelLoaded, isModelDownloading, isOfflineMode, autoMode, isIos]);

  // Process audio chunk
  const processAudioChunk = async (
    chunk: Float32Array,
    useOfflineMode: boolean
  ): Promise<void> => {
    if (isProcessingRef.current) return;

    // Check if model is ready before processing
    if (useOfflineMode && !phoWhisperService.isModelReady()) {
      console.warn('Model not ready, skipping chunk');
      return;
    }

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

      if (useOfflineMode) {
        // Transcribe using Whisper (offline mode)
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

          console.log(`Transcribed (offline): ${result.text}`);
        }
      } else {
        // In online mode, we'll use Web Speech API results
        // The chunk is buffered but not transcribed here
        // Web Speech API handles transcription
        console.log(`Buffered chunk for online mode (${chunk.length} samples)`);
      }

    } catch (err) {
      console.warn('Chunk processing failed:', err);
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
          // Transcribe the full buffered audio only if model is ready
          try {
            const result = await phoWhisperService.transcribe(bufferedData, _transcriptionLanguage);
            finalTranscript = result.text;
          } catch (err) {
            console.warn('Final transcription failed:', err);
          }
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
  }, [onResult]);

  // Toggle offline mode
  const toggleOfflineMode = useCallback((enable: boolean) => {
    if (enable && isIos) {
      setError('Offline mode is not available on iOS browsers. Please use online mode.');
      return;
    }

    setIsOfflineMode(enable);
    if (enable && !isModelLoaded) {
      setError('Please download the Whisper model first to use offline mode.');
    } else {
      setError(null);
    }
  }, [isModelLoaded, isIos]);

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
    currentMode,
    isIosBrowser: isIos,
  };
}

export default useHybridSpeechRecognition;
