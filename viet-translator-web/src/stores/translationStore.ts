import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TranslationState {
  translations: Array<{ transcription: string; translation: string }>;
  currentText: string;
  isListening: boolean;
  history: Array<{ transcription: string; translation: string; timestamp: number }>;
  lastUpdated: number;
  selectedVoice: SpeechSynthesisVoice | null;
  selectedOption: string;
}

export type TranslationStore = TranslationState & {
  addTranslation: (transcription: string, translation: string) => void;
  clearTranslations: () => void;
  setCurrentText: (text: string) => void;
  setIsListening: (isListening: boolean) => void;
  addToHistory: (transcription: string, translation: string) => void;
  clearHistory: () => void;
  reset: () => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  setSelectedOption: (option: string) => void;
};

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set: (fn: (state: TranslationStore) => Partial<TranslationStore>) => void) => ({
      translations: [],
      currentText: '',
      isListening: false,
      history: [],
      lastUpdated: Date.now(),
      selectedVoice: null,
      selectedOption: '',

      addTranslation: (transcription: string, translation: string) => {
        set((state) => ({
          translations: [...state.translations, { transcription, translation }],
          lastUpdated: Date.now()
        }));
      },

      clearTranslations: () => {
        set((state) => ({ ...state, translations: [] }));
      },

      setCurrentText: (text: string) => {
        set((state) => ({ ...state, currentText: text }));
      },

      setIsListening: (isListening: boolean) => {
        set((state) => ({ ...state, isListening }));
      },

      addToHistory: (transcription: string, translation: string) => {
        set((state) => ({
          ...state,
          history: [{ transcription, translation, timestamp: Date.now() }, ...state.history].slice(0, 100)
        }));
      },

      clearHistory: () => {
        set((state) => ({ ...state, history: [] }));
      },

      reset: () => {
        set((state) => ({
          ...state,
          translations: [],
          currentText: '',
          isListening: false,
          history: [],
          lastUpdated: Date.now(),
          selectedVoice: null,
          selectedOption: ''
        }));
      },

      setSelectedVoice: (voice: SpeechSynthesisVoice) => {
        set((state) => ({ ...state, selectedVoice: voice }));
      },

      setSelectedOption: (option: string) => {
        set((state) => ({ ...state, selectedOption: option }));
      }
    }),
    {
      name: 'viet-translator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: TranslationStore) => ({
        history: state.history,
        lastUpdated: state.lastUpdated
      })
    }
  )
);