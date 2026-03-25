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
    (set) => ({
      translations: [],
      currentText: '',
      isListening: false,
      history: [],
      lastUpdated: Date.now(),
      selectedVoice: null,
      selectedOption: '',
      
      addTranslation: (transcription, translation) => {
        set((state) => ({
          translations: [...state.translations, { transcription, translation }],
          lastUpdated: Date.now()
        }));
      },
      
      clearTranslations: () => {
        set({ translations: [] });
      },
      
      setCurrentText: (text) => {
        set({ currentText: text });
      },
      
      setIsListening: (isListening) => {
        set({ isListening });
      },
      
      addToHistory: (transcription, translation) => {
        set((state) => ({
          history: [{ transcription, translation, timestamp: Date.now() }, ...state.history].slice(0, 100)
        }));
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      reset: () => {
        set({
          translations: [],
          currentText: '',
          isListening: false,
          history: [],
          lastUpdated: Date.now(),
          selectedVoice: null,
          selectedOption: ''
        });
      },
      
      setSelectedVoice: (voice) => {
        set({ selectedVoice: voice });
      },
      
      setSelectedOption: (option) => {
        set({ selectedOption: option });
      }
    }),
    {
      name: 'viet-translator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        lastUpdated: state.lastUpdated
      })
    }
  )
);
