import React from 'react';

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

export const SettingsPanel = React.memo(({ onClose }: SettingsPanelProps) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button onClick={onClose} className="text-blue-500" aria-label="Close settings">Back</button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Speech Recognition</h3>
            <div className="p-3 rounded bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                This app uses the Web Speech API for speech recognition.
                No model download required - works immediately in supported browsers.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Language</h3>
            <div className="p-3 rounded bg-gray-50 border border-gray-200">
              <p className="text-sm">
                Recognizing: Vietnamese (vi-VN)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Translating to: English
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Browser Compatibility</h3>
            <div className="p-3 rounded bg-gray-50 border border-gray-200">
              <p className="text-sm">
                Works on: Chrome, Firefox, Edge, Safari (iOS/macOS)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Note: Requires internet connection for speech recognition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';