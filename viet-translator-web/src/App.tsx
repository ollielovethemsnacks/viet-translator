import { useState, useCallback } from 'react';
import { useTranslationStore } from './stores/translationStore';
import { useSpeechRecognition, useTextToSpeech } from './hooks/useSpeechRecognition';
import { translationService } from './services/translation';
import { TranslationView } from './components/TranslationView';
import { MicButton } from './components/MicButton';

function App() {
  const [view, setView] = useState<'main' | 'settings' | 'about'>('main');
  const [liveTranslation, setLiveTranslation] = useState('');
  const { addTranslation } = useTranslationStore();
  const { speak } = useTextToSpeech();

  // Handle interim results for live translation
  const handleInterim = useCallback((text: string) => {
    const translation = translationService.translate(text);
    setLiveTranslation(translation);
  }, []);

  // Handle final results
  const handleResult = useCallback((text: string) => {
    const translation = translationService.translate(text);
    addTranslation(text, translation);
    setLiveTranslation('');
  }, [addTranslation]);

  const {
    isListening,
    // transcript - not used directly
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening
  } = useSpeechRecognition({
    language: 'vi-VN',
    onResult: handleResult,
    onInterim: handleInterim
  });

  const handleSpeak = (text: string) => {
    speak(text);
  };

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <button onClick={() => setView('main')} className="text-blue-500">Back</button>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-gray-600">Settings coming soon...</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'about') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">About</h1>
            <button onClick={() => setView('main')} className="text-blue-500">Back</button>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-2">Viet Translator</h2>
            <p className="text-gray-600 mb-4">
              Real-time Vietnamese to English translator for conversations with family.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tap the microphone to speak Vietnamese</li>
              <li>• See English translations instantly</li>
              <li>• Works offline after first load</li>
              <li>• 100+ common Vietnamese words</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setView('about')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VT</span>
          </div>
          <h1 className="font-bold text-lg">Viet Translator</h1>
        </button>
        <button onClick={() => setView('settings')} className="p-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <TranslationView onSpeak={handleSpeak} />
      </main>

      {/* Live Translation - Shows while listening */}
      {isListening && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Live Translation</span>
          </div>
          
          {/* Original Vietnamese */}
          {interimTranscript && (
            <p className="text-sm text-blue-800 mb-1">
              <span className="opacity-60">Hearing:</span> {interimTranscript}
            </p>
          )}
          
          {/* English Translation */}
          {liveTranslation && (
            <p className="text-lg font-semibold text-blue-900">
              {liveTranslation}
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Mic Button */}
      <div className="bg-white border-t p-4">
        <MicButton
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
          isSupported={isSupported}
        />
      </div>
    </div>
  );
}

export default App;
