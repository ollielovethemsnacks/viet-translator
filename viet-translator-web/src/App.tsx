import { useState } from 'react';
import { useTranslationStore } from './stores/translationStore';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { translationService } from './services/translation';
import { TranslationView } from './components/TranslationView';
import { MicButton } from './components/MicButton';
import { SettingsPanel } from './components/SettingsPanel';
import { useTextToSpeech } from './hooks/useSpeechRecognition';

export function App() {
  const [view, setView] = useState('main');
  const { addTranslation, addToHistory, setIsListening } = useTranslationStore();
  
  const {
    isListening,
    isAdmin,
    error,
    startListening,
    stopListening,
    reset
  } = useSpeechRecognition({
    language: 'vi-VN',
    continuous: true,
    onResult: (transcript: string, isFinal: boolean) => {
      if (isFinal && transcript) {
        handleTranslation(transcript);
        reset();
      }
    }
  });

  const handleTranslation = (transcript: string) => {
    const translation = translationService.translate(transcript);
    
    addTranslation(transcript, translation);
    addToHistory(transcript, translation);
  };

  const handleSpeakEnglish = (text: string) => {
    const { speak } = useTextToSpeech();
    speak(text);
  };

  const renderView = () => {
    switch (view) {
      case 'settings':
        return <SettingsPanel />;
      case 'about':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">About</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-3">Viet Translator</h2>
              <p className="text-gray-600 mb-4">
                A real-time Vietnamese to English translator built with modern web technologies.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>Real-time Vietnamese speech recognition</li>
                <li>Dictionary-based translation (100+ common words)</li>
                <li>Works offline after initial load</li>
                <li>Installable as PWA</li>
                <li>Conversation history saved locally</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div onClick={() => setView('about')} className="flex items-center gap-2 cursor-pointer">
                <div className="bg-blue-500 text-white rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-blue-600">Viet Translator</h1>
              </div>
              <button
                onClick={() => setView('settings')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </header>

            <TranslationView onSpeak={handleSpeakEnglish} />

            <div className="mt-auto bg-white border-t border-gray-200 p-6 pb-8">
              <MicButton
                isListening={isListening}
                onStartListening={() => {
                  startListening();
                  setIsListening(true);
                }}
                onStopListening={() => {
                  stopListening();
                  setIsListening(false);
                }}
                isAdmin={isAdmin}
                error={error}
              />
            </div>
          </div>
        );
    }
  };

  return <>{renderView()}</>;
}

export default App;
