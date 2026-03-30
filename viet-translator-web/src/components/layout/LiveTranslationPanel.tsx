import React from 'react';

interface LiveTranslationPanelProps {
  isListening: boolean;
  isIos: boolean;
  transcript: string;
  liveTranslation: string;
}

/**
 * Panel showing live translation results during speech recognition
 */
export const LiveTranslationPanel: React.FC<LiveTranslationPanelProps> = React.memo(({
  isListening,
  isIos,
  transcript,
  liveTranslation
}) => {
  if (!isListening) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-t border-blue-200 px-4 py-3" role="region" aria-label="Live translation">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
          {isIos ? 'Live Translation (Web Speech API)' : 'Live Translation'}
        </span>
      </div>

      {/* Original Vietnamese */}
      {transcript && (
        <p className="text-sm text-blue-800 mb-1">
          <span className="opacity-60">Hearing:</span> {transcript}
        </p>
      )}

      {/* English Translation */}
      {liveTranslation && (
        <p className="text-lg font-semibold text-blue-900">
          {liveTranslation}
        </p>
      )}
    </div>
  );
});

LiveTranslationPanel.displayName = 'LiveTranslationPanel';