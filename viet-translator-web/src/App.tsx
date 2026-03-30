import { useState, useCallback } from 'react';
import { useWebSpeechRecognition, useTextToSpeech } from './hooks/useWebSpeechRecognition';
import { translationService } from './services/translation';
import { SettingsPanel } from './components/features/PhoWhisperSettings';
import { useTranslationStore } from './stores/translationStore';
import { Header } from './components/layout/Header';
import { MainContent } from './components/layout/MainContent';
import { LiveTranslationPanel } from './components/layout/LiveTranslationPanel';
import { ErrorDisplay } from './components/layout/ErrorDisplay';
import { Footer } from './components/layout/Footer';

function App() {
  // State
  const [view, setView] = useState<'main' | 'settings' | 'about'>('main');
  const [liveTranslation, setLiveTranslation] = useState('');
  const { addTranslation } = useTranslationStore();

  // Web Speech Recognition hook (primary method)
  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening: startWebSpeechListening,
    stopListening: stopWebSpeechListening,
    isIos
    // resetSpeech is not being used - removed
  } = useWebSpeechRecognition({
    language: 'vi-VN', // Vietnamese language
    onResult: useCallback((text: string) => {
      const translation = translationService.translate(text);
      addTranslation(text, translation);
      setLiveTranslation('');
    }, [addTranslation]),
    onInterim: useCallback((text: string) => {
      const translation = translationService.translate(text);
      setLiveTranslation(translation);
    }, []),
    onError: useCallback((error: string | null) => {
      // Error is already handled by the hook's state, but we can add custom logic here if needed
      console.log('Speech recognition error:', error);
    }, []),
    onListeningChange: useCallback((isListening: boolean) => {
      // Update local state or trigger side effects when listening state changes
      console.log('Listening state changed:', isListening);
    }, [])
  });

  const { speak /*, voicesLoaded, availableVoices */ } = useTextToSpeech(); // Removed unused return values

  const startListening = useCallback(() => {
    startWebSpeechListening();
  }, [startWebSpeechListening]);

  const stopListening = useCallback(() => {
    stopWebSpeechListening();
  }, [stopWebSpeechListening]);

  const handleSpeak = (text: string) => {
    speak(text);
  };

  // Handler to reset speech state - REMOVED as unused

  if (view === 'settings') {
    return (
      <SettingsPanel
        onClose={() => setView('main')}
        isOfflineMode={false}
        toggleOfflineMode={() => {}}
        downloadModel={() => {}}
        isModelDownloading={false}
        modelDownloadProgress={0}
        isModelLoaded={true}
        checkModelStatus={async () => true}
      />
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
              <li>• Uses Web Speech API for real-time recognition</li>
              <li>• Works on iOS Safari and all modern browsers</li>
              <li>• 100+ common Vietnamese words</li>
            </ul>
            {isIos && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>iOS Note:</strong> This app uses Web Speech API which works on iOS Safari. Internet connection required for transcription.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        onAboutClick={() => setView('about')}
        onSettingsClick={() => setView('settings')}
        isListening={isListening}
        isIos={isIos}
      />

      {/* Main Content */}
      <MainContent onSpeak={handleSpeak} />

      {/* Live Translation - Shows while listening */}
      <LiveTranslationPanel
        isListening={isListening}
        isIos={isIos}
        transcript={transcript}
        liveTranslation={liveTranslation}
      />

      {/* Error Message */}
      <ErrorDisplay error={error} />

      {/* Footer */}
      <Footer
        isListening={isListening}
        isSupported={isSupported}
        isIos={isIos}
        onStartListening={startListening}
        onStopListening={stopListening}
      />
    </div>
  );
}

export default App;
