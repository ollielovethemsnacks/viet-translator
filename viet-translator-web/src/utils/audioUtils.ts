/**
 * Utility functions for audio processing with PhoWhisper
 */

/**
 * Resamples audio to 16kHz if needed
 * @param audioBuffer The input audio buffer
 * @returns A new audio buffer at 16kHz
 */
export function resampleAudio(audioBuffer: AudioBuffer): Float32Array {
  const desiredSampleRate = 16000;
  const sourceSampleRate = audioBuffer.sampleRate;

  // If already at 16kHz, just return the data
  if (sourceSampleRate === desiredSampleRate) {
    // Get mono data (first channel if stereo)
    return audioBuffer.getChannelData(0);
  }

  // Calculate the number of samples needed for the target sample rate
  const duration = audioBuffer.duration;
  const targetLength = Math.floor(duration * desiredSampleRate);
  const resampled = new Float32Array(targetLength);

  // Simple linear interpolation for resampling
  for (let i = 0; i < targetLength; i++) {
    const sourceIndex = (i * sourceSampleRate) / desiredSampleRate;
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

/**
 * Converts microphone audio stream to the format expected by Whisper
 * @param audioBuffer The input audio buffer from the microphone
 * @returns Float32Array ready for Whisper processing
 */
export function prepareAudioForWhisper(audioBuffer: AudioBuffer): Float32Array {
  // Resample to 16kHz
  const resampled = resampleAudio(audioBuffer);

  // Normalize audio to [-1, 1] range if needed
  // (though this should already be the case with proper audio input)
  const normalized = new Float32Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    // Clamp values to [-1, 1] range
    normalized[i] = Math.max(-1, Math.min(1, resampled[i]));
  }

  return normalized;
}

/**
 * Downsamples audio from a higher sample rate to 16kHz
 * @param inputBuffer Input audio buffer
 * @param inputSampleRate Sample rate of the input
 * @returns Float32Array at 16kHz
 */
export function downsampleAudio(inputBuffer: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate <= 16000) {
    return inputBuffer;
  }

  const ratio = inputSampleRate / 16000;
  const result = new Float32Array(Math.floor(inputBuffer.length / ratio));

  for (let i = 0; i < result.length; i++) {
    result[i] = inputBuffer[Math.floor(i * ratio)];
  }

  return result;
}

/**
 * Calculate audio energy (RMS) for voice activity detection
 * @param audioData Audio samples
 * @returns Energy value
 */
export function calculateAudioEnergy(audioData: Float32Array): number {
  let sumSquared = 0;
  for (let i = 0; i < audioData.length; i++) {
    const sample = audioData[i];
    sumSquared += sample * sample;
  }
  return Math.sqrt(sumSquared / audioData.length);
}

/**
 * Detect if audio contains speech based on energy threshold
 * @param audioData Audio samples
 * @param threshold Energy threshold (default: 0.01)
 * @returns True if speech detected
 */
export function detectSpeech(audioData: Float32Array, threshold: number = 0.01): boolean {
  const energy = calculateAudioEnergy(audioData);
  return energy > threshold;
}

/**
 * Normalize audio to peak amplitude
 * @param audioData Audio samples
 * @param targetPeak Target peak amplitude (default: 0.9)
 * @returns Normalized audio
 */
export function normalizeAudio(audioData: Float32Array, targetPeak: number = 0.9): Float32Array {
  let maxAbs = 0;
  for (let i = 0; i < audioData.length; i++) {
    const abs = Math.abs(audioData[i]);
    if (abs > maxAbs) {
      maxAbs = abs;
    }
  }

  if (maxAbs === 0) {
    return audioData;
  }

  const scale = targetPeak / maxAbs;
  const normalized = new Float32Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    normalized[i] = audioData[i] * scale;
  }

  return normalized;
}

/**
 * Pad audio to minimum length
 * @param audioData Audio samples
 * @param minLength Minimum length in samples
 * @returns Padded audio
 */
export function padAudio(audioData: Float32Array, minLength: number): Float32Array {
  if (audioData.length >= minLength) {
    return audioData;
  }

  const padded = new Float32Array(minLength);
  padded.set(audioData);
  return padded;
}

/**
 * Split audio into chunks
 * @param audioData Audio samples
 * @param chunkSize Chunk size in samples
 * @returns Array of audio chunks
 */
export function splitIntoChunks(audioData: Float32Array, chunkSize: number): Float32Array[] {
  const chunks: Float32Array[] = [];
  for (let i = 0; i < audioData.length; i += chunkSize) {
    const chunk = audioData.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }
  return chunks;
}

/**
 * Merge audio chunks
 * @param chunks Array of audio chunks
 * @returns Merged audio
 */
export function mergeChunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);

  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
