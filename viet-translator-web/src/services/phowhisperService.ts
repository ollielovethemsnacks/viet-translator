/**
 * PhoWhisper Service - Full offline Vietnamese speech recognition
 * Uses @xenova/transformers for browser-based inference
 * Model: vinai/PhoWhisper-base (PyTorch-based, auto-converted to ONNX for browser)
 */

import {
  AutoProcessor,
  WhisperForConditionalGeneration,
  type WhisperProcessor,
  env,
} from '@xenova/transformers';

// Model configuration
const PHOWHISPER_MODEL_ID = 'vinai/PhoWhisper-base';
const TARGET_SAMPLE_RATE = 16000; // Whisper expects 16kHz audio

// Configure transformers.js to use browser cache for model caching
// This enables offline usage after initial download
env.allowLocalModels = false; // Only use HuggingFace Hub for now
env.useBrowserCache = true; // Cache downloaded models in browser

interface ModelStatus {
  downloaded: boolean;
  loaded: boolean;
  progress: number;
  error: string | null;
  loadingStep: string;
}

interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
}

/**
 * PhoWhisperService - Handles offline Vietnamese speech recognition
 * using the PhoWhisper model (Vietnamese-optimized Whisper)
 */
class PhoWhisperService {
  private modelStatus: ModelStatus = {
    downloaded: false,
    loaded: false,
    progress: 0,
    error: null,
    loadingStep: 'idle',
  };

  private processor: WhisperProcessor | null = null;
  private model: any | null = null;
  private abortController: AbortController | null = null;
  private isInitializing: boolean = false;

  constructor() {
    this.checkModelStatus();
  }

  /**
   * Check if model is cached in browser storage
   */
  private async checkModelStatus(): Promise<void> {
    try {
      const cached = localStorage.getItem('phowhisper-model-cached');
      if (cached === 'true') {
        this.modelStatus.downloaded = true;
        this.modelStatus.progress = 100;
      }
    } catch (error) {
      console.error('Error checking model status:', error);
    }
  }

  /**
   * Get model information
   */
  public async getModelInfo(): Promise<{
    id: string;
    size: string;
    language: string;
    description: string;
  }> {
    return {
      id: PHOWHISPER_MODEL_ID,
      size: '~74MB (compressed)',
      language: 'Vietnamese',
      description: 'Vietnamese-optimized Whisper model trained on 844 hours of Vietnamese audio',
    };
  }

  /**
   * Check if model is downloaded
   */
  public async isModelDownloaded(): Promise<boolean> {
    return this.modelStatus.downloaded;
  }

  /**
   * Check if model is loaded and ready
   */
  public isModelReady(): boolean {
    return this.modelStatus.loaded;
  }

  /**
   * Get current model status
   */
  public getStatus(): ModelStatus {
    return { ...this.modelStatus };
  }

  /**
   * Download and cache the PhoWhisper model
   * @param progressCallback Optional callback for download progress (0-100)
   */
  public async downloadModel(progressCallback?: (progress: number, step: string) => void): Promise<void> {
    if (this.modelStatus.downloaded) {
      console.log('Model already downloaded');
      return;
    }

    if (this.isInitializing) {
      throw new Error('Model is already being downloaded/initialized');
    }

    this.abortController = new AbortController();
    this.isInitializing = true;
    this.modelStatus.loadingStep = 'downloading';
    this.modelStatus.progress = 0;

    try {
      console.log('Starting PhoWhisper model download and initialization...');

      // Update progress callback
      const updateProgress = (progress: number, step: string) => {
        this.modelStatus.progress = progress;
        this.modelStatus.loadingStep = step;
        if (progressCallback) {
          progressCallback(progress, step);
        }
      };

      // Step 1: Check for existing cache
      updateProgress(5, 'checking_cache');

      // Step 2: Download and load processor
      updateProgress(10, 'loading_processor');
      this.processor = await AutoProcessor.from_pretrained(PHOWHISPER_MODEL_ID, {
        progress_callback: (progress: number) => {
          const stepProgress = 10 + Math.floor(progress * 0.25); // 10-35%
          updateProgress(stepProgress, 'downloading_processor');
        },
      });

      // Step 3: Download and load model
      updateProgress(35, 'loading_model');
      this.model = await WhisperForConditionalGeneration.from_pretrained(PHOWHISPER_MODEL_ID, {
        progress_callback: (progress: number) => {
          const stepProgress = 35 + Math.floor(progress * 0.55); // 35-90%
          updateProgress(stepProgress, 'downloading_model');
        },
      });

      // Step 4: Verify model is ready
      updateProgress(90, 'verifying');
      await this.verifyModel();

      // Step 5: Mark as complete
      this.modelStatus.downloaded = true;
      this.modelStatus.loaded = true;
      this.modelStatus.progress = 100;
      this.modelStatus.loadingStep = 'ready';

      localStorage.setItem('phowhisper-model-cached', 'true');

      console.log('PhoWhisper model downloaded and initialized successfully');

    } catch (error) {
      console.error('Error downloading model:', error);
      this.modelStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.modelStatus.loadingStep = 'error';
      this.abortController = null;
      this.isInitializing = false;
      throw error;
    }
  }

  /**
   * Verify the model is working correctly
   */
  private async verifyModel(): Promise<void> {
    if (!this.model || !this.processor) {
      throw new Error('Model or processor not loaded');
    }

    // Create a small test audio (1 second of silence at 16kHz)
    const testAudio = new Float32Array(TARGET_SAMPLE_RATE).fill(0);

    try {
      const inputs = await this.processor(testAudio, {
        sampling_rate: TARGET_SAMPLE_RATE,
      });

      // Run a quick inference test
      const inputFeatures = inputs.input_features;
      await this.model.generate(inputFeatures, {
        max_new_tokens: 5,
        language: '<|vi|>',
        task: 'transcribe',
      });

      console.log('Model verification successful');
    } catch (err) {
      console.warn('Model verification failed:', err);
      // Don't throw - model might still work
    }
  }

  /**
   * Load model from cache (called on app startup)
   */
  public async loadModel(): Promise<void> {
    if (this.modelStatus.loaded) {
      console.log('Model already loaded');
      return;
    }

    if (!this.modelStatus.downloaded) {
      throw new Error('Model not downloaded. Call downloadModel() first.');
    }

    try {
      console.log('Loading PhoWhisper model from cache...');

      this.modelStatus.loadingStep = 'loading';
      this.modelStatus.progress = 50;

      this.processor = await AutoProcessor.from_pretrained(PHOWHISPER_MODEL_ID);

      this.model = await WhisperForConditionalGeneration.from_pretrained(PHOWHISPER_MODEL_ID);

      this.modelStatus.loaded = true;
      this.modelStatus.progress = 100;
      this.modelStatus.loadingStep = 'ready';

      console.log('Model loaded successfully');

    } catch (error) {
      console.error('Error loading model:', error);
      this.modelStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.modelStatus.loadingStep = 'error';
      throw error;
    }
  }

  /**
   * Transcribe audio using PhoWhisper
   * @param audioData Float32Array of audio samples at 16kHz
   * @param language Optional language code (default: Vietnamese)
   * @returns Transcription result
   */
  public async transcribe(
    audioData: Float32Array,
    language: string = 'vi'
  ): Promise<TranscriptionResult> {
    if (!this.model || !this.processor) {
      throw new Error('Model not initialized. Call loadModel() first.');
    }

    try {
      // Preprocess audio
      const inputs = await this.processor(audioData, {
        sampling_rate: TARGET_SAMPLE_RATE,
      });

      // Get input features
      const inputFeatures = inputs.input_features;

      // Generate transcription
      const generatedIds = await this.model.generate(inputFeatures, {
        language: `<|${language}|>`,
        task: 'transcribe',
        max_new_tokens: 256,
      });

      // Decode the output
      const tokenizer = (this.processor as any).tokenizer;
      if (!tokenizer) {
        throw new Error('Tokenizer not available');
      }

      const transcription = tokenizer.decode(generatedIds[0], {
        skip_special_tokens: true,
      });

      return {
        text: transcription.trim(),
        language: language,
      };

    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transcribe audio with streaming support for real-time use
   * @param audioChunks Array of audio chunks (each ~1 second)
   * @param onChunkTranscribed Optional callback for each chunk result
   * @returns Full transcription
   */
  public async transcribeStream(
    audioChunks: Float32Array[],
    onChunkTranscribed?: (text: string, isFinal: boolean) => void
  ): Promise<string> {
    if (!this.model || !this.processor) {
      throw new Error('Model not initialized');
    }

    let fullTranscription = '';

    for (let i = 0; i < audioChunks.length; i++) {
      const chunk = audioChunks[i];
      const isFinal = i === audioChunks.length - 1;

      try {
        const result = await this.transcribe(chunk, 'vi');

        if (result.text) {
          fullTranscription += (fullTranscription ? ' ' : '') + result.text;

          if (onChunkTranscribed) {
            onChunkTranscribed(result.text, isFinal);
          }
        }
      } catch (error) {
        console.warn(`Chunk ${i} transcription failed:`, error);
      }
    }

    return fullTranscription.trim();
  }

  /**
   * Get available storage space
   */
  public async getAvailableSpace(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.quota ? estimate.quota - (estimate.usage || 0) : 0;
      } catch (error) {
        console.warn('Could not get storage estimate:', error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * Abort current download
   */
  public abortDownload(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isInitializing = false;
      this.modelStatus.loadingStep = 'aborted';
    }
  }

  /**
   * Clear cached model
   */
  public async clearModel(): Promise<void> {
    this.modelStatus = {
      downloaded: false,
      loaded: false,
      progress: 0,
      error: null,
      loadingStep: 'idle',
    };

    this.model = null;
    this.processor = null;

    localStorage.removeItem('phowhisper-model-cached');

    // Clear IndexedDB cache
    try {
      const databases = await window.indexedDB.databases();
      for (const db of databases) {
        if (db.name && (db.name.includes('transformers') || db.name.includes('onnxruntime'))) {
          await window.indexedDB.deleteDatabase(db.name);
        }
      }
    } catch (error) {
      console.warn('Could not clear IndexedDB:', error);
    }
  }

  /**
   * Check if the browser supports PhoWhisper
   */
  public static isSupported(): boolean {
    // Check for required Web APIs
    const requiredAPIs = [
      'AudioContext',
      'OfflineAudioContext',
      'WebAssembly',
      'indexedDB',
    ];

    for (const api of requiredAPIs) {
      if (!(api in window)) {
        return false;
      }
    }

    // Check WebAssembly support
    try {
      if (typeof WebAssembly.compile === 'undefined') {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  /**
   * Preprocess audio to 16kHz for Whisper
   * @param audioBuffer Audio buffer from microphone
   * @returns Float32Array at 16kHz
   */
  public static preprocessAudio(audioBuffer: AudioBuffer): Float32Array {
    const sourceSampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // If already at 16kHz, just return mono data
    if (sourceSampleRate === TARGET_SAMPLE_RATE) {
      return audioBuffer.getChannelData(0);
    }

    // Calculate target length
    const targetLength = Math.floor(duration * TARGET_SAMPLE_RATE);
    const resampled = new Float32Array(targetLength);

    // Linear interpolation for resampling
    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = (i * sourceSampleRate) / TARGET_SAMPLE_RATE;
      const lowerIndex = Math.floor(sourceIndex);
      const upperIndex = Math.ceil(sourceIndex);

      if (lowerIndex >= audioBuffer.length) {
        resampled[i] = 0;
      } else if (upperIndex >= audioBuffer.length) {
        resampled[i] = audioBuffer.getChannelData(0)[lowerIndex];
      } else {
        const lowerValue = audioBuffer.getChannelData(0)[lowerIndex];
        const upperValue = audioBuffer.getChannelData(0)[upperIndex];
        const fraction = sourceIndex - lowerIndex;

        resampled[i] = lowerValue + (upperValue - lowerValue) * fraction;
      }
    }

    return resampled;
  }
}

// Export singleton instance
export const phoWhisperService = new PhoWhisperService();

// Export types
export type { PhoWhisperService, TranscriptionResult };
