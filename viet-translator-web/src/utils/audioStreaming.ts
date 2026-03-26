/**
 * Audio Streaming Utilities for PhoWhisper
 * Handles real-time audio capture, buffering, and preprocessing
 */

// Audio configuration
const TARGET_SAMPLE_RATE = 16000;
const CHUNK_DURATION = 1; // Process 1 second chunks
const BUFFER_SIZE = 4096; // Web Audio API buffer size

/**
 * AudioStream - Manages real-time audio capture and streaming
 */
export class AudioStream {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;

  private audioBuffer: Float32Array = new Float32Array(0);
  private sampleRate: number = 0;
  private isRecording: boolean = false;
  private onChunkCallback: ((chunk: Float32Array) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.sampleRate = TARGET_SAMPLE_RATE;
  }

  /**
   * Start audio capture from microphone
   * @param onChunk Callback for each audio chunk
   * @param onEnd Callback when recording ends
   */
  public async start(
    onChunk: (chunk: Float32Array) => void,
    onEnd?: () => void
  ): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: TARGET_SAMPLE_RATE,
        },
      });

      // Get the microphone track's sample rate
      const track = this.mediaStream.getAudioTracks()[0];
      const settings = track.getSettings();
      this.sampleRate = settings.sampleRate || TARGET_SAMPLE_RATE;

      // Create source node
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create analyser for level monitoring
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Create script processor for chunked audio
      this.scriptProcessor = this.audioContext.createScriptProcessor(
        BUFFER_SIZE,
        1, // input channels
        1  // output channels
      );

      // Connect nodes: microphone -> analyser -> scriptProcessor
      this.microphone.connect(this.analyser);
      this.microphone.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      // Store callbacks
      this.onChunkCallback = onChunk;
      this.onEndCallback = onEnd || null;

      // Handle audio processing
      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const input = event.inputBuffer.getChannelData(0);
        this.processAudioChunk(input);
      };

      this.isRecording = true;
      console.log('Audio stream started');

    } catch (error) {
      console.error('Error starting audio stream:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk and buffer it
   */
  private processAudioChunk(chunk: Float32Array): void {
    // Resample if needed
    const resampled = this.resampleAudio(chunk, this.sampleRate, TARGET_SAMPLE_RATE);

    // Append to buffer
    const newBuffer = new Float32Array(this.audioBuffer.length + resampled.length);
    newBuffer.set(this.audioBuffer);
    newBuffer.set(resampled, this.audioBuffer.length);
    this.audioBuffer = newBuffer;

    // Check if we have enough for a chunk
    const targetChunkSize = Math.floor(TARGET_SAMPLE_RATE * CHUNK_DURATION);

    if (this.audioBuffer.length >= targetChunkSize) {
      // Extract the chunk
      const chunkData = this.audioBuffer.slice(0, targetChunkSize);

      // Keep any remaining samples
      this.audioBuffer = this.audioBuffer.slice(targetChunkSize);

      // Process the chunk
      if (this.onChunkCallback) {
        this.onChunkCallback(chunkData);
      }
    }
  }

  /**
   * Resample audio to target sample rate
   */
  private resampleAudio(
    input: Float32Array,
    inputRate: number,
    outputRate: number
  ): Float32Array {
    if (inputRate === outputRate) {
      return input;
    }

    const ratio = inputRate / outputRate;
    const newLength = Math.floor(input.length / ratio);
    const output = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const lowerIndex = Math.floor(sourceIndex);
      const upperIndex = Math.ceil(sourceIndex);

      if (lowerIndex >= input.length) {
        output[i] = 0;
      } else if (upperIndex >= input.length) {
        output[i] = input[lowerIndex];
      } else {
        const fraction = sourceIndex - lowerIndex;
        output[i] = input[lowerIndex] * (1 - fraction) + input[upperIndex] * fraction;
      }
    }

    return output;
  }

  /**
   * Get current audio level (0-1)
   */
  public getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (const value of dataArray) {
      sum += value;
    }

    return sum / dataArray.length / 255;
  }

  /**
   * Get current audio buffer
   */
  public getCurrentBuffer(): Float32Array {
    return this.audioBuffer;
  }

  /**
   * Stop audio capture
   */
  public stop(): void {
    this.isRecording = false;

    // Disconnect audio nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    // Close media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clear buffer
    this.audioBuffer = new Float32Array(0);

    // Call end callback
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }

    console.log('Audio stream stopped');
  }

  /**
   * Check if recording is active
   */
  public isRecordingActive(): boolean {
    return this.isRecording;
  }

  /**
   * Get sample rate
   */
  public getSampleRate(): number {
    return this.sampleRate;
  }
}

/**
 * AudioProcessor - Handles audio preprocessing for PhoWhisper
 */
export class AudioProcessor {
  /**
   * Preprocess audio for PhoWhisper
   * - Resamples to 16kHz
   * - Normalizes to [-1, 1]
   * - Converts to mono if stereo
   */
  public static preprocess(audioData: Float32Array, sampleRate: number): Float32Array {
    // Resample to 16kHz
    const resampled = AudioProcessor.resampleTo16kHz(audioData, sampleRate);

    // Normalize to [-1, 1]
    const normalized = new Float32Array(resampled.length);
    for (let i = 0; i < resampled.length; i++) {
      normalized[i] = Math.max(-1, Math.min(1, resampled[i]));
    }

    return normalized;
  }

  /**
   * Resample audio to 16kHz
   */
  private static resampleTo16kHz(audioData: Float32Array, sampleRate: number): Float32Array {
    if (sampleRate === TARGET_SAMPLE_RATE) {
      return audioData;
    }

    const ratio = sampleRate / TARGET_SAMPLE_RATE;
    const newLength = Math.floor(audioData.length / ratio);
    const resampled = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const lowerIndex = Math.floor(sourceIndex);
      const upperIndex = Math.ceil(sourceIndex);

      if (lowerIndex >= audioData.length) {
        resampled[i] = 0;
      } else if (upperIndex >= audioData.length) {
        resampled[i] = audioData[lowerIndex];
      } else {
        const fraction = sourceIndex - lowerIndex;
        resampled[i] = audioData[lowerIndex] * (1 - fraction) + audioData[upperIndex] * fraction;
      }
    }

    return resampled;
  }

  /**
   * Create audio buffer from microphone stream
   */
  public static createAudioBuffer(
    audioData: Float32Array,
    sampleRate: number
  ): Float32Array {
    return this.preprocess(audioData, sampleRate);
  }
}

/**
 * AudioBufferManager - Manages audio chunks for streaming transcription
 */
export class AudioBufferManager {
  private chunks: Float32Array[] = [];
  private maxChunks: number;
  private totalSamples: number = 0;

  constructor(maxDuration: number = 30) {
    // Store chunks for maxDuration seconds
    this.maxChunks = Math.ceil(maxDuration / CHUNK_DURATION);
  }

  /**
   * Add a chunk to the buffer
   */
  public addChunk(chunk: Float32Array): void {
    this.chunks.push(chunk);
    this.totalSamples += chunk.length;

    // Remove old chunks if buffer is too large
    while (this.chunks.length > this.maxChunks) {
      const removed = this.chunks.shift();
      if (removed) {
        this.totalSamples -= removed.length;
      }
    }
  }

  /**
   * Get all chunks as a single array
   */
  public getAllChunks(): Float32Array[] {
    return [...this.chunks];
  }

  /**
   * Get concatenated audio data
   */
  public getAudioData(): Float32Array {
    if (this.chunks.length === 0) {
      return new Float32Array(0);
    }

    const totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Float32Array(totalLength);

    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Get number of chunks
   */
  public getChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Get total duration in seconds
   */
  public getTotalDuration(): number {
    return this.totalSamples / TARGET_SAMPLE_RATE;
  }

  /**
   * Clear all chunks
   */
  public clear(): void {
    this.chunks = [];
    this.totalSamples = 0;
  }

  /**
   * Get recent chunks (last N seconds)
   */
  public getRecentChunks(seconds: number = 5): Float32Array[] {
    const targetChunks = Math.ceil(seconds / CHUNK_DURATION);
    return this.chunks.slice(-targetChunks);
  }
}

/**
 * Create a new audio stream instance
 */
export function createAudioStream(): AudioStream {
  return new AudioStream();
}

/**
 * Create a new audio buffer manager
 */
export function createAudioBufferManager(maxDuration: number = 30): AudioBufferManager {
  return new AudioBufferManager(maxDuration);
}
