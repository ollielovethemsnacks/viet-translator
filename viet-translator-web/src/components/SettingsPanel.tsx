import { useTranslationStore } from '../stores/translationStore';
import { translationService } from '../services/translation';

export function SettingsPanel() {
  const { clearHistory, clearTranslations, history, lastUpdated } = useTranslationStore();

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      clearHistory();
      clearTranslations();
    }
  };

  const loadLastUpdated = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        {/* About Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About Viet Translator</h2>
          <p className="text-gray-600 mb-4">
            A real-time Vietnamese to English translator that works offline.
            Built with React, TypeScript, and Web Speech API.
          </p>
          <div className="text-sm text-gray-500">
            <p>Version: 1.0.0</p>
            <p>Last updated: {loadLastUpdated}</p>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Translation History</p>
                <p className="text-sm text-gray-500">
                  {history.length} items stored ({Math.round(history.length * 0.1)}KB)
                </p>
              </div>
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear
              </button>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-500">
                  {useTranslationStore.getState().translations.length} translations
                </p>
              </div>
              <button
                onClick={clearTranslations}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={clearAllData}
                className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Offline Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Offline Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Dictionary Loaded</p>
                <p className="text-sm text-green-700">
                  Vietnamese-English dictionary is available offline ({translationService.dictionaryData.length} entries)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L12 11.414V15a1 1 0 11-2 0v-3.586L6.707 15.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                  <path d="M4 17a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm1-6a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-800">Web Speech API</p>
                <p className="text-sm text-blue-700">
                  Voice recognition requires internet connection for some browsers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Installation Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This app is a Progressive Web App (PWA)
            <br />
            Use the "Add to Home Screen" option in your browser to install it
          </p>
        </div>
      </div>
    </div>
  );
}