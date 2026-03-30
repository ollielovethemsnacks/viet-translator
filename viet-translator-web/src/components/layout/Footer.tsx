import React from 'react';
import { MicButton } from '../ui/MicButton';

interface FooterProps {
  isListening: boolean;
  isSupported: boolean;
  isIos: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

/**
 * Footer component containing the microphone button and info text
 * @param isListening - Boolean indicating if the app is currently listening
 * @param isSupported - Boolean indicating if speech recognition is supported in the browser
 * @param isIos - Boolean indicating if the device is iOS
 * @param onStartListening - Callback function to start listening
 * @param onStopListening - Callback function to stop listening
 * @returns JSX Element representing the footer
 */
export const Footer: React.FC<FooterProps> = React.memo(({
  isListening,
  isSupported,
  isIos,
  onStartListening,
  onStopListening
}) => {

  return (
    <div className="bg-white border-t p-4">
      <MicButton
        isListening={isListening}
        onStartListening={onStartListening}
        onStopListening={onStopListening}
        isSupported={isSupported}
      />
      {isIos && !isListening && (
        <p className="text-center text-xs text-blue-600 mt-2">
          Uses Web Speech API (requires internet connection)
        </p>
      )}
      {!isIos && !isListening && (
        <p className="text-center text-xs text-blue-600 mt-2">
          Uses Web Speech API for speech recognition
        </p>
      )}
    </div>
  );
});

Footer.displayName = 'Footer';