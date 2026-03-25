interface MicButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isAdmin: boolean;
  error: string | null;
}

export function MicButton({
  isListening,
  onStartListening,
  onStopListening,
  isAdmin,
  error
}: MicButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      {isAdmin ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-xs text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-yellow-600 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium text-yellow-800">
            {error || 'Speech recognition not supported in this browser'}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Please try using Chrome or Safari on iOS
          </p>
        </div>
      ) : (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`relative group ${isListening ? 'animate-pulse' : ''}`}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {/* Outer circle */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 animate-ping opacity-75' 
                : 'bg-gray-200 group-hover:bg-gray-300'
            }`}
          />
          
          {/* Middle circle */}
          <div 
            className={`absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 ring-4 ring-red-200' 
                : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg group-hover:shadow-xl'
            }`}
          >
            {/* Inner icon circle */}
            <div className="bg-white rounded-full p-4 shadow-inner">
              {isListening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V16H6a1 1 0 100 2h8a1 1 0 100-2h-3v-5.07z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V16H6a1 1 0 100 2h8a1 1 0 100-2h-3v-5.07z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Label */}
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <span className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full whitespace-nowrap">
              {isListening ? 'Listening...' : 'Tap to speak Vietnamese'}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
