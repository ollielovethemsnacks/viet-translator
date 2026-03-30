import React from 'react';

interface HeaderProps {
  onAboutClick: () => void;
  onSettingsClick: () => void;
  isListening: boolean;
  isIos: boolean;
}

/**
 * Header component for the Viet Translator app
 * Displays the app title, logo, and navigation buttons
 * @param onAboutClick - Callback function when the about button is clicked
 * @param onSettingsClick - Callback function when the settings button is clicked
 * @param isListening - Boolean indicating if the app is currently listening
 * @param isIos - Boolean indicating if the device is iOS
 * @returns JSX Element representing the header
 */
export const Header: React.FC<HeaderProps> = React.memo(({
  onAboutClick,
  onSettingsClick,
  isListening,
  isIos
}) => {
  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between" role="banner">
      <button
        onClick={onAboutClick}
        className="flex items-center gap-2"
        aria-label="About Viet Translator"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">VT</span>
        </div>
        <h1 className="font-bold text-lg">Viet Translator</h1>
      </button>
      <div className="flex gap-2">
        {isListening && (
          <div
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
            aria-live="polite"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
            {isIos ? 'WEB SPEECH' : 'LISTENING'}
          </div>
        )}
        <button
          onClick={onSettingsClick}
          className="p-2"
          aria-label="Open settings"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';