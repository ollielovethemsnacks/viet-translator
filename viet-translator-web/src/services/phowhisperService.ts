// Mock service for PhoWhisper functionality
// In a real implementation, this would interface with the actual PhoWhisper model

export const phoWhisperService = {
  isModelReady: (): boolean => {
    // Check if model is loaded in IndexedDB or similar
    return !!localStorage.getItem('phoWhisperModelLoaded');
  },

  isModelDownloaded: async (): Promise<boolean> => {
    // Check if model is downloaded
    return !!localStorage.getItem('phoWhisperModelLoaded');
  },

  downloadModel: async (onProgress?: (progress: number, step: string) => void): Promise<void> => {
    // Simulate model download
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (onProgress) {
          onProgress(progress, `Downloading model... ${progress}%`);
        }
        if (progress >= 100) {
          clearInterval(interval);
          localStorage.setItem('phoWhisperModelLoaded', 'true');
          resolve();
        }
      }, 100);
    });
  },

  loadModel: async (): Promise<void> => {
    // Simulate model loading
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('phoWhisperModelLoaded', 'true');
        resolve();
      }, 500);
    });
  },

  transcribe: async (_audioData: Float32Array, _language: string = 'vi'): Promise<any> => {
    // Simulate transcription
    // In a real implementation, this would call the actual PhoWhisper model
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return mock transcription
        resolve({
          text: "This is a simulated transcription from PhoWhisper",
          language: _language,
          confidence: 0.9
        });
      }, 300);
    });
  }
};