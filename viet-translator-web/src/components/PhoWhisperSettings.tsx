import { useState, useEffect } from 'react';

interface SettingsPanelProps {
  onClose: () => void;
  isOfflineMode: boolean;
  toggleOfflineMode: (enable: boolean) => void;
  downloadModel: () => Promise<void>;
  isModelDownloading: boolean;
  modelDownloadProgress: number;
  isModelLoaded: boolean;
  checkModelStatus: () => Promise<boolean>;
}

export function SettingsPanel({
  onClose,
  isOfflineMode,
  toggleOfflineMode,
  downloadModel,
  isModelDownloading,
  modelDownloadProgress,
  isModelLoaded,
  checkModelStatus
}: SettingsPanelProps) {
  const [storageInfo, setStorageInfo] = useState<{ quota: number; usage: number } | null>(null);

  useEffect(() => {
    // Get storage information
    const getStorageInfo = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            quota: estimate.quota || 0,
            usage: estimate.usage || 0
          });
        } catch (error) {
          console.warn('Could not get storage estimate:', error);
        }
      }
    };

    getStorageInfo();

    // Check model status on mount
    checkModelStatus();
  }, [checkModelStatus]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimatedModelSize = 74 * 1024 * 1024; // 74MB in bytes

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button
            onClick={onClose}
            className="text-blue-500"
          >
            Back
          </button>
        </div>

        {/* Offline Mode Toggle */}
        <div className="bg-white rounded-lg p-4 shadow mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Offline Mode</h3>
              <p className="text-sm text-gray-600">
                {isOfflineMode
                  ? 'Using PhoWhisper (offline)'
                  : 'Using Web Speech API (online)'}
              </p>
            </div>
            <button
              onClick={() => toggleOfflineMode(!isOfflineMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isOfflineMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isOfflineMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Model Download Section */}
        <div className="bg-white rounded-lg p-4 shadow mb-4">
          <h3 className="font-medium mb-3">PhoWhisper Model</h3>

          <div className="space-y-3">
            {!isModelLoaded ? (
              <>
                <p className="text-sm text-gray-600">
                  Download the PhoWhisper model for offline Vietnamese speech recognition.
                  The model is ~74MB and optimized for Vietnamese.
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Vietnamese-optimized (844 hours of training data)</div>
                  <div>• Works completely offline after download</div>
                  <div>• ~74MB download size</div>
                  <div>• Uses ONNX Runtime Web for browser inference</div>
                </div>

                {isModelDownloading ? (
                  <div className="pt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${modelDownloadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Downloading...</span>
                      <span>{modelDownloadProgress}%</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={downloadModel}
                    disabled={isModelDownloading}
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    Download Model
                  </button>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Model downloaded</span>
                </div>
                <p className="text-sm text-gray-600">
                  PhoWhisper model is ready for offline use.
                </p>
                <button
                  onClick={() => {
                    toggleOfflineMode(true);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                >
                  Enable Offline Mode
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Storage Information */}
        {storageInfo && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-medium mb-2">Storage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Used:</span>
                <span>{formatBytes(storageInfo.usage)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quota:</span>
                <span>{formatBytes(storageInfo.quota)}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span>{formatBytes(storageInfo.quota - storageInfo.usage)}</span>
              </div>
              <div className="pt-2 text-xs text-gray-500">
                Estimated model size: {formatBytes(estimatedModelSize)}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-4 shadow mt-4 border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">About PhoWhisper</h3>
          <p className="text-sm text-blue-700">
            PhoWhisper is a Vietnamese-optimized speech recognition model trained on 844 hours
            of Vietnamese audio. It provides accurate transcription completely offline after download.
          </p>
          <div className="mt-3 text-xs text-blue-600 space-y-1">
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Offline speech recognition</li>
              <li>Real-time transcription</li>
              <li>Vietnamese language support</li>
              <li>Browser-based inference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
