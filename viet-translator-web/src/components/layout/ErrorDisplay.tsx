import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

/**
 * Component to display error messages
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = React.memo(({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <div
      className="bg-red-50 border-t border-red-200 px-4 py-2"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm text-red-800">{error}</p>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';