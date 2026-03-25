import { pipeline } from '@xenova/transformers';

// PhoWhisper model info
const PHOWHISPER_MODEL_ID = 'vinai/PhoWhisper-base'; // Vietnamese-optimized Whisper model

class PhoWhisperService {
  private transcriber: any = null;
  private isInitialized = false;
  private isLoading = false;
  private progressCallback: ((progress: number) => void) | null = null;

  constructor() {
    // Initialize with the model cache check
  }

  public async isModelDownloaded(): Promise<boolean> {
    // With transformers.js, models are cached automatically by the library
    // We'll check if the model has been loaded once before
    return this.isInitialized || !!localStorage.getItem('phowhisper-model-loaded');
  }

  public async getModelSize(): Promise<number> {
    // Estimate the model size - the PhoWhisper base model is around 74MB
    return 77594624; // ~74MB in bytes
  }

  public async downloadModel(progressCallback?: (progress: number) => void): Promise<void> {
    if (this.isLoading) {
      throw new Error('Model download already in progress');
    }

    this.progressCallback = progressCallback || null;
    this.isLoading = true;

    try {
      console.log('Starting PhoWhisper model initialization...');
      
      // Initialize the transformer pipeline with progress tracking
      this.transcriber = await pipeline(
        'automatic-speech-recognition', 
        PHOWHISPER_MODEL_ID,
        {
          progress_callback: (data: any) => {
            if (this.progressCallback) {
              // Calculate progress percentage
              const progress = Math.round((data.loaded_bytes / data.total_bytes) * 100);
              this.progressCallback(progress);
            }
          }
        }
      );

      this.isInitialized = true;
      localStorage.setItem('phowhisper-model-loaded', 'true');
      console.log('Model initialized successfully');
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    } finally {
      this.isLoading = false;
      this.progressCallback = null;
    }
  }

  public async loadModel(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.transcriber) {
      console.log('Loading PhoWhisper model...');
      
      // Load the model - this will use the cache if already downloaded
      this.transcriber = await pipeline(
        'automatic-speech-recognition', 
        PHOWHISPER_MODEL_ID
      );
    }

    this.isInitialized = true;
  }

  public async transcribe(audioData: Float32Array): Promise<string> {
    if (!this.isInitialized || !this.transcriber) {
      throw new Error('Model not initialized. Call loadModel() first.');
    }

    try {
      // Perform transcription using the transformer pipeline
      const result = await this.transcriber(audioData, {
        return_timestamps: false,
      });

      return typeof result === 'string' ? result : (result.text as string || '');
    } catch (error) {
      console.error('Error during transcription:', error);
      throw error;
    }
  }

  public async transcribeWithProgress(
    audioData: Float32Array, 
    progressCallback?: (progress: number) => void
  ): Promise<string> {
    if (!this.isInitialized || !this.transcriber) {
      throw new Error('Model not initialized. Call loadModel() first.');
    }

    // Set progress callback if provided
    if (progressCallback) {
      // Note: The transformers.js library doesn't provide granular progress for transcription itself
      // but we can provide some indication
      progressCallback(50); // Indicate we're processing
    }

    try {
      const result = await this.transcriber(audioData, {
        return_timestamps: false,
      });

      if (progressCallback) {
        progressCallback(100); // Indicate completion
      }

      return typeof result === 'string' ? result : (result.text as string || '');
    } catch (error) {
      console.error('Error during transcription:', error);
      throw error;
    }
  }

  public async getAvailableSpace(): Promise<number> {
    // Try to get storage quota information
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.quota ? estimate.quota : 0;
      } catch (error) {
        console.warn('Could not get storage estimate:', error);
        return 0;
      }
    }
    return 0;
  }

  public resetProgressCallback() {
    this.progressCallback = null;
  }

  public isModelReady(): boolean {
    return this.isInitialized && !!this.transcriber;
  }
}

export const phoWhisperService = new PhoWhisperService();