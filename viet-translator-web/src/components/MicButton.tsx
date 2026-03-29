interface MicButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSupported: boolean;
}

// Helper function to detect iOS
function detectIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMacintosh = /Macintosh/.test(userAgent);
  const hasTouch = navigator.maxTouchPoints ? navigator.maxTouchPoints > 1 : false;

  return isIosDevice || (isMacintosh && hasTouch);
}

export function MicButton({
  isListening,
  onStartListening,
  onStopListening,
  isSupported
}: MicButtonProps) {
  const isIOS = detectIOS();

  if (!isSupported) {
    return (
      <div className="text-center">
        <p className="text-yellow-600 text-sm">
          Speech recognition not supported. Please use Safari on iOS or Chrome/Firefox on desktop.
        </p>
      </div>
    );
  }

  // On iOS, we need to ensure the click handler is properly registered
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      // On iOS, ensure we have proper user gesture context
      // Web Speech API requires user gesture to start recognition on iOS
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        onTouchStart={isIOS ? handleClick : undefined} // iOS specific touch handling
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isListening ? (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V16H6a1 1 0 100 2h8a1 1 0 100-2h-3v-5.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <span className="mt-2 text-sm text-gray-600">
        {isListening ? 'Listening...' : 'Tap to speak'}
      </span>
      {isIOS && !isListening && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Tap microphone to start speaking (requires internet)
        </p>
      )}
    </div>
  );
}