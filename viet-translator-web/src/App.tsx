import { useState, useRef, useEffect } from 'react';
import {
  initWhisperService,
  downloadWhisperModelAsync,
  transcribeAudio,
  translateVietnameseToEnglish,
  getAvailableModelsList,
  type WhisperState,
  type WhisperModel,
  languageOptions,
} from './lib/whisper';

function App() {
  // State
  const [whisperState, setWhisperState] = useState<WhisperState>({
    isSupported: false,
    isDownloading: false,
    downloadProgress: 0,
    loadedModels: [],
    modelsAvailable: getAvailableModelsList(),
    canTranscribe: false,
    error: null,
    isIosBrowser: false,
  });

  const [selectedModel, setSelectedModel] = useState<WhisperModel>('small');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);

  // Initialize whisper service on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const state = await initWhisperService();
        setWhisperState(state);

        if (!state.isSupported) {
          if (state.isIosBrowser) {
            // iOS browsers don't support cross-origin isolation needed for Whisper.wasm
            setError('Your browser does not support offline whisper transcription. iOS Safari does not support the required WebAssembly features. Please use a different browser (Chrome, Firefox, or Edge) on your iPhone, or use the app on a desktop computer.');
          } else {
            setError('Your browser does not support offline whisper transcription. Please use a modern browser like Chrome, Firefox, or Safari.');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize whisper service. Please refresh the page.');
      }
    };
    initialize();
  }, []);

  // Download model when selected model changes
  useEffect(() => {
    const downloadModel = async () => {
      if (!whisperState.canTranscribe && whitelistModels.includes(selectedModel)) {
        await downloadWhisperModelAsync(selectedModel, (progress) => {
          setWhisperState((prev) => ({
            ...prev,
            isDownloading: true,
            downloadProgress: progress,
          }));
        });
        const state = await initWhisperService();
        setWhisperState(state);
      }
    };
    downloadModel();
  }, [selectedModel, whisperState.canTranscribe]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setTranscription('');
      setTranslatedText('');
      setError(null);
    }
  };

  // Handle drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setTranscription('');
      setTranslatedText('');
      setError(null);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setAudioFile(file);
        setRecordingDuration(0);
        setIsRecording(false);
        handleStopStream(stream);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setProcessProgress(0);
      setError(null);

      recorderRef.current = recorder;
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  // Stop stream properly
  const handleStopStream = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  };

  // Process audio
  const processAudio = async () => {
    if (!audioFile) {
      setError('Please select or record an audio file first.');
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    setError(null);

    try {
      const result = await transcribeAudio(
        audioFile,
        selectedModel,
        selectedLanguage,
        (progress) => {
          setProcessProgress(progress);
        },
      );

      if (result) {
        setTranscription(result.text);

        // Translate to English
        const translation = await translateVietnameseToEnglish(result.text);
        setTranslatedText(translation);
      } else {
        setError('Transcription failed. Please try again.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('An error occurred during processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all
  const clearAll = () => {
    setAudioFile(null);
    setTranscription('');
    setTranslatedText('');
    setRecordingDuration(0);
    setIsRecording(false);
    setError(null);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const whitelistModels = ['tiny', 'base', 'small', 'tiny.en', 'base.en', 'small.en'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Viet Translator</h1>
                <p className="text-sm text-slate-400">Offline Vietnamese Speech Recognition</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              {showSettings ? 'Hide Settings' : 'Settings'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <div className="flex items-center gap-2 text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-300 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="mb-8 rounded-xl bg-slate-800/50 border border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Whisper Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as WhisperModel)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {whisperState.modelsAvailable.map((model) => (
                    <option key={model} value={model}>
                      {model} (Whisper)
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {selectedModel === 'tiny'
                    ? 'Fastest, least accurate - ~75MB'
                    : selectedModel === 'base'
                    ? 'Good balance of speed and accuracy - ~140MB'
                    : selectedModel === 'small'
                    ? 'Better accuracy - ~480MB (recommended)'
                    : 'Best accuracy - larger file size'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Input Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Select Vietnamese (vi) for Vietnamese speech recognition
                </p>
              </div>
            </div>
            {whisperState.canTranscribe && (
              <div className="mt-4 flex items-center gap-2 text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">
                  Whisper model {whisperState.loadedModels[0] || 'loaded'} ready for transcription
                </span>
              </div>
            )}
            {whisperState.isIosBrowser && (
              <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-amber-400">iOS Safari Limitation</h3>
                    <p className="text-xs text-amber-300 mt-1">
                      iOS Safari does not support the WebAssembly features required for offline whisper transcription. Please use Chrome, Firefox, or Edge on your iPhone, or use this app on a desktop computer.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Audio Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload/Record Section */}
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Audio Input</h2>

              {!audioFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg p-8 text-center transition-colors cursor-pointer bg-slate-900/50"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-300 mb-2">
                    Click or drag audio file here
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Supports: MP3, WAV, FLAC, M4A, WebM (up to 25MB)
                  </p>
                  <label className="inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700 transition-colors">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg bg-slate-900/50 border border-slate-700 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={clearAll}
                      className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {isRecording && (
                    <div className="flex items-center justify-between rounded-lg bg-red-500/20 border border-red-500/30 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-red-400">
                          Recording {formatDuration(recordingDuration)}
                        </span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Stop Recording
                      </button>
                    </div>
                  )}

                  {!isRecording && !audioFile && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={startRecording}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium hover:bg-red-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        Start Recording
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Processing Section */}
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Transcription</h2>

              <div className="space-y-4">
                <button
                  onClick={processAudio}
                  disabled={!audioFile || isProcessing || !whisperState.canTranscribe}
                  className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                    !audioFile || isProcessing || !whisperState.canTranscribe
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth={4}
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                      <span className="text-sm text-blue-200 ml-2">
                        {Math.round(processProgress * 100)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Transcribe Audio
                    </>
                  )}
                </button>

                {/* Progress Bar */}
                {(isProcessing || whisperState.isDownloading) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        {isProcessing ? 'Transcribing...' : 'Downloading model...'}
                      </span>
                      <span>{Math.round(processProgress * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${processProgress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {transcription && (
              <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Results</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transcription);
                        alert('Copied to clipboard!');
                      }}
                      className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Vietnamese Transcription */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Vietnamese Transcription
                  </label>
                  <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4 min-h-[100px]">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                </div>

                {/* English Translation */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    English Translation
                  </label>
                  <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4 min-h-[100px]">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {translatedText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Not Supported Warning */}
            {!whisperState.isSupported && !whisperState.isIosBrowser && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-amber-400">Browser Not Supported</h3>
                    <p className="text-sm text-amber-300 mt-1">
                      Your browser does not support offline whisper transcription. Please use a modern browser like Chrome, Firefox, or Safari.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <p className="text-sm text-slate-300 mb-4">
                This app uses Whisper.wasm to transcribe Vietnamese speech offline directly in your browser.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Offline transcription</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Vietnamese language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Private - audio stays on device</span>
                </li>
              </ul>
            </div>

            {/* iOS Info Card */}
            {whisperState.isIosBrowser && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-6">
                <h2 className="text-lg font-semibold mb-4 text-amber-400">iOS Safari Note</h2>
                <p className="text-sm text-amber-300 mb-4">
                  iOS Safari does not support the WebAssembly features required for offline whisper transcription.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-amber-200 font-medium">Alternative options:</p>
                  <ul className="text-xs text-amber-200 space-y-1">
                    <li>• Use Chrome, Firefox, or Edge on iPhone</li>
                    <li>• Use this app on a desktop computer</li>
                    <li>• Use the online mode (requires internet)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
