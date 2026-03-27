import {
  transcribe as transcribeWasm,
  resampleTo16Khz,
  downloadWhisperModel,
  getLoadedModels,
  canUseWhisperWeb,
  deleteModel,
  getAvailableModels,
} from '@remotion/whisper-web';

// Whisper models available - models supported by the package
export type WhisperModel = 'tiny' | 'base' | 'small' | 'tiny.en' | 'base.en' | 'small.en';

// Available models from the package
export const whisperModels: WhisperModel[] = ['tiny', 'base', 'small', 'tiny.en', 'base.en', 'small.en'];

// Get language options for transcription
export interface LanguageOption {
  code: string;
  name: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

// Transcription result with Vietnamese translation support
export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

// Whisper service state
export interface WhisperState {
  isSupported: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  loadedModels: string[];
  modelsAvailable: WhisperModel[];
  canTranscribe: boolean;
  error: string | null;
}

// Initialize whisper service
export async function initWhisperService(): Promise<WhisperState> {
  try {
    const models = getAvailableModels();
    const loaded = await getLoadedModels();
    const canUse = await canUseWhisperWeb('small');

    return {
      isSupported: canUse.supported,
      isDownloading: false,
      downloadProgress: 0,
      loadedModels: loaded,
      modelsAvailable: models.map((m) => m.name as WhisperModel),
      canTranscribe: loaded.includes('small'),
      error: null,
    };
  } catch (error) {
    return {
      isSupported: false,
      isDownloading: false,
      downloadProgress: 0,
      loadedModels: [],
      modelsAvailable: ['tiny', 'base', 'small', 'tiny.en', 'base.en', 'small.en'],
      canTranscribe: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Check if whisper is supported
export async function checkWhisperSupport(): Promise<boolean> {
  try {
    const result = await canUseWhisperWeb('small');
    return result.supported;
  } catch {
    return false;
  }
}

// Download whisper model
export async function downloadWhisperModelAsync(
  model: WhisperModel = 'small',
  onProgress?: (progress: number) => void,
): Promise<boolean> {
  try {
    await downloadWhisperModel({
      model,
      onProgress: ({ progress }) => {
        if (onProgress) {
          onProgress(progress);
        }
      },
    });
    return true;
  } catch (error) {
    console.error('Error downloading model:', error);
    return false;
  }
}

// Transcribe audio
export async function transcribeAudio(
  audioFile: File,
  model: WhisperModel = 'small',
  language: string = 'vi',
  onProgress?: (progress: number) => void,
): Promise<TranscriptionResult | null> {
  try {
    // Resample audio to 16kHz
    const resampledAudio = await resampleTo16Khz({
      file: audioFile,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress(progress * 0.5); // First 50% for resampling
        }
      },
    });

    // Transcribe using whisper
    const result = await transcribeWasm({
      channelWaveform: resampledAudio,
      model,
      language: language as any,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress(0.5 + progress * 0.5); // Next 50% for transcription
        }
      },
    });

    // Extract text from result - handle various result formats
    let transcriptionText = '';
    if (result && typeof result === 'object') {
      if ('whisperWebOutput' in result) {
        const output = result.whisperWebOutput as any;
        if ('transcription' in output) {
          transcriptionText = output.transcription
            .map((seg: any) => seg.text)
            .join(' ');
        }
      } else if (Array.isArray(result)) {
        transcriptionText = result
          .map((seg: any) => seg.text)
          .join(' ');
      } else if (typeof result === 'object') {
        transcriptionText = JSON.stringify(result);
      }
    }

    return {
      text: transcriptionText.trim(),
      language,
      confidence: 0.9,
      segments: [],
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return null;
  }
}

// Translate Vietnamese to English (basic implementation)
export async function translateVietnameseToEnglish(
  text: string,
): Promise<string> {
  // For a real app, you would use an API like Google Translate or DeepL
  // For now, we'll return the text as-is since we need offline translation
  // A more sophisticated approach would use a lightweight translation model

  // Simple heuristic: if text contains Vietnamese characters, mark for translation
  const hasVietnameseChars = /[\u0100-\u017F\u01A0-\u01A1\u01AF\u01B0\u1EA0-\u1EF9]/.test(text);

  if (!hasVietnameseChars) {
    return text;
  }

  // This is a placeholder - in production, call an API or use an offline model
  return `[Translation needed: ${text}]`;
}

// Clean up model from storage
export async function cleanupModel(model: WhisperModel): Promise<void> {
  try {
    await deleteModel(model);
  } catch (error) {
    console.error('Error cleanup model:', error);
  }
}

// Get available whisper models
export function getAvailableModelsList(): WhisperModel[] {
  return whisperModels;
}
