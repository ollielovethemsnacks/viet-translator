interface SettingsPanelProps {
  onClose: () => void;
  isOfflineMode: boolean;
  toggleOfflineMode: (enable: boolean) => void;
  downloadModel: () => void;
  isModelDownloading: boolean;
  modelDownloadProgress: number;
  isModelLoaded: boolean;
  checkModelStatus: () => void;
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
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button onClick={onClose} className="text-blue-500">Back</button>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Speech Recognition Mode</h3>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="offline-mode"
                checked={isOfflineMode}
                onChange={(e) => toggleOfflineMode(e.target.checked)}
                disabled={isModelDownloading}
                className="rounded"
              />
              <label htmlFor="offline-mode" className="text-sm">
                Use Offline Mode (requires model download)
              </label>
            </div>
            
            <div className="p-3 rounded bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-700">
                <strong>Tip:</strong> Offline mode works without internet after model download. 
                Online mode requires internet but works immediately.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Model Status</h3>
            <div className="p-3 rounded bg-gray-50 border border-gray-200">
              <p className="text-sm">
                Status: {isModelDownloading 
                  ? `Downloading... ${Math.round(modelDownloadProgress)}%` 
                  : isModelLoaded 
                    ? 'Downloaded (ready for offline use)' 
                    : 'Not downloaded'}
              </p>
              
              {!isModelLoaded && !isModelDownloading && (
                <button
                  onClick={downloadModel}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  Download Whisper Model
                </button>
              )}
              
              <button
                onClick={checkModelStatus}
                className="mt-2 ml-2 bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}