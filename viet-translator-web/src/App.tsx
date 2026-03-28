import { useState, useCallback } from 'react';
import { isIosBrowser } from './lib/whisper';
import { useTextToSpeech } from './hooks/useSpeechRecognition';
import { useHybridSpeechRecognition } from './hooks/useHybridSpeechRecognition';
import { translationService } from './services/translation';
import { TranslationView } from './components/TranslationView';
import { MicButton } from './components/MicButton';
import { SettingsPanel } from './components/PhoWhisperSettings';
import { useTranslationStore } from './stores/translationStore';

function App() {
  // State
  const [view, setView] = useState<'main' | 'settings' | 'about'>('main');
  const [liveTranslation, setLiveTranslation] = useState('');
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const { addTranslation } = useTranslationStore();
  const { speak } = useTextToSpeech();

  // Detect iOS browser
  const isIos = isIosBrowser();

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

  // Hybrid Speech Recognition hook (auto-detects platform)
  const {
    isListening: isHybridListening,
    isModelLoaded,
    isModelDownloading,
    modelDownloadProgress,
    interimTranscript: hybridInterimTranscript,
    isSupported: isHybridSupported,
    error: hybridError,
    startListening: startHybridListening,
    stopListening: stopHybridStopping,
    downloadModel,
    toggleOfflineMode: toggleHybridOfflineMode,
    isOfflineMode: isHybridOfflineMode,
    checkModelStatus,
    currentMode,
  } = useHybridSpeechRecognition({
    onResult: handleResult,
    onInterim: handleInterim
  });

  // Determine which hook to use based on platform and mode
  const isListening = isHybridListening;
  const interimTranscript = hybridInterimTranscript;
  const error = hybridError;
  const isSupported = isHybridSupported;

  const startListening = useCallback(() => {
    // Use hybrid mode which automatically detects platform
    if (useOfflineMode) {
      if (!isModelLoaded && !isModelDownloading) {
        alert('Please download the Whisper model first');
        return;
      }
      startHybridListening();
    } else {
      startHybridListening();
    }
  }, [useOfflineMode, isModelLoaded, isModelDownloading, startHybridListening]);

  const stopListening = useCallback(() => {
    stopHybridStopping();
  }, [stopHybridStopping]);

  const handleSpeak = (text: string) => {
    speak(text);
  };

  if (view === 'settings') {
    return (
      <SettingsPanel
        onClose={() => setView('main')}
        isOfflineMode={isHybridOfflineMode}
        toggleOfflineMode={(enable) => {
          toggleHybridOfflineMode(enable);
          setUseOfflineMode(enable);
        }}
        downloadModel={downloadModel}
        isModelDownloading={isModelDownloading}
        modelDownloadProgress={modelDownloadProgress}
        isModelLoaded={isModelLoaded}
        checkModelStatus={checkModelStatus}
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
              <li>• Works offline after model download (desktop)</li>
              <li>• Uses Whisper (OpenAI, ONNX-converted)</li>
              <li>• 100+ common Vietnamese words</li>
            </ul>
            {isIos && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>iOS Note:</strong> This app uses Web Speech API on iOS since offline Whisper is not supported. You need an internet connection for transcription.
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
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setView('about')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VT</span>
          </div>
          <h1 className="font-bold text-lg">Viet Translator</h1>
        </button>
        <div className="flex gap-2">
          {isListening && (
            <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {isIos ? 'ONLINE' : currentMode === 'offline' ? 'OFFLINE' : 'AUTO'}
            </div>
          )}
          <button
            onClick={() => setView('settings')}
            className="p-2"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
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
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              {isIos ? 'Live Translation (Online)' : currentMode === 'offline' ? 'Offline Transcription' : 'Live Transcription'}
            </span>
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
        {isIos && !isListening && (
          <p className="text-center text-xs text-blue-600 mt-2">
            Online mode: Uses Web Speech API (requires internet)
          </p>
        )}
        {!isIos && !isModelLoaded && !isModelDownloading && useOfflineMode && (
          <p className="text-center text-xs text-red-500 mt-2">
            Model not downloaded. Go to settings to download for offline mode.
          </p>
        )}
        {!isIos && isModelDownloading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${modelDownloadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">
              Downloading model... {modelDownloadProgress}%
            </p>
          </div>
        )}
        {!isIos && useOfflineMode && isModelLoaded && (
          <p className="text-center text-xs text-green-600 mt-2">
            Offline mode active: No internet required
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
