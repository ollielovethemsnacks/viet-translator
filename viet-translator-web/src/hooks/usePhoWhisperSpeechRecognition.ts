import { useEffect, useRef, useState, useCallback } from 'react';
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
}

export function usePhoWhisperSpeechRecognition(options: { 
  onResult?: (transcript: string, isFinal: boolean) => void;
  onInterim?: (transcript: string) => void;
} = {}): PhoWhisperHook {
  const { onResult, onInterim } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check if browser supports required APIs
  useEffect(() => {
    const requiredApis = [
      'AudioContext' in window || 'webkitAudioContext' in window,
      'MediaRecorder' in window,
      'navigator' in window && 'mediaDevices' in navigator
    ];
    
    if (!requiredApis.every(api => api)) {
      setIsSupported(false);
      setError('Browser does not support required APIs for speech recognition');
    }
  }, []);

  // Initialize model if offline mode is enabled
  useEffect(() => {
    if (isOfflineMode && !isModelLoaded && !isModelDownloading) {
      loadModel();
    }
  }, [isOfflineMode, isModelLoaded, isModelDownloading]);

  const loadModel = async () => {
    try {
      setIsModelDownloading(true);
      await phoWhisperService.loadModel();
      setIsModelLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error loading PhoWhisper model:', err);
      setError(`Failed to load model: ${(err as Error).message}`);
    } finally {
      setIsModelDownloading(false);
    }
  };

  const downloadModel = async () => {
    try {
      setIsModelDownloading(true);
      setModelDownloadProgress(0);
      
      await phoWhisperService.downloadModel((progress) => {
        setModelDownloadProgress(progress);
      });
      
      setIsModelLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error downloading PhoWhisper model:', err);
      setError(`Failed to download model: ${(err as Error).message}`);
    } finally {
      setIsModelDownloading(false);
    }
  };

  const startListening = useCallback(async () => {
    if (isListening) return;
    
    try {
      setError(null);
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { 
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
        sampleRate: 16000
      }});

      // Setup audio context for processing
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Check if audioContextRef.current is valid
      if (!audioContextRef.current) {
        throw new Error('Could not create audio context');
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create a ScriptProcessorNode for real-time audio processing
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      // Buffer to store audio data for processing
      let audioBuffer: Float32Array = new Float32Array(0);
      let isProcessing = false;
      
      scriptProcessor.onaudioprocess = async (audioProcessingEvent) => {
        if (!isListening || isProcessing || !audioContextRef.current) return;
        
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        
        // Append new data to buffer
        const newBuffer = new Float32Array(audioBuffer.length + inputData.length);
        newBuffer.set(audioBuffer);
        newBuffer.set(inputData, audioBuffer.length);
        audioBuffer = newBuffer;
        
        // Process audio when buffer reaches threshold
        if (audioBuffer.length >= 16000) { // ~1 second of 16kHz audio
          isProcessing = true;
          
          try {
            // Take a copy of the buffer and clear it
            const processBuffer = audioBuffer.slice();
            audioBuffer = new Float32Array(0); // Clear buffer
            
            // Ensure we have the right format for Whisper
            const audioData = processBuffer;
            
            // Transcribe using PhoWhisper
            const result = await phoWhisperService.transcribe(audioData);
            
            // Update interim transcript with the result
            setInterimTranscript(prev => prev ? `${prev} ${result}` : result);
            if (onInterim) {
              onInterim(result);
            }
          } catch (transcribeErr) {
            console.error('Real-time transcription error:', transcribeErr);
          } finally {
            isProcessing = false;
          }
        }
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);
      
      // Store references for cleanup
      (audioContextRef.current as any).scriptProcessor = scriptProcessor;
      (audioContextRef.current as any).stream = stream;
      
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(`Microphone access denied: ${(err as Error).message}`);
      setIsListening(false);
    }
  }, [isListening, onInterim]);

  const stopListening = useCallback(() => {
    // Close audio context and disconnect nodes
    if (audioContextRef.current) {
      // Disconnect script processor
      if ((audioContextRef.current as any).scriptProcessor) {
        (audioContextRef.current as any).scriptProcessor.disconnect();
      }
      
      // Stop all tracks in the stream
      if ((audioContextRef.current as any).stream) {
        (audioContextRef.current as any).stream.getTracks().forEach((track: any) => track.stop());
      }
      
      // Close audio context
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    setInterimTranscript('');
    
    // If there's any remaining interim transcript, treat it as final
    if (interimTranscript && onResult) {
      onResult(interimTranscript, true);
      setTranscript(prev => prev ? `${prev} ${interimTranscript}` : interimTranscript);
      setInterimTranscript('');
    }
  }, [interimTranscript, onResult]);

  const toggleOfflineMode = (enable: boolean) => {
    setIsOfflineMode(enable);
  };

  const checkModelStatus = async (): Promise<boolean> => {
    const isDownloaded = await phoWhisperService.isModelDownloaded();
    setIsModelLoaded(isDownloaded);
    return isDownloaded;
  };

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
    checkModelStatus
  };
}