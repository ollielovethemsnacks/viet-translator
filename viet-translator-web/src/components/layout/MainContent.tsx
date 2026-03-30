import React from 'react';
import { TranslationView } from '../features/TranslationView';

interface MainContentProps {
  onSpeak: (text: string) => void;
}

/**
 * Main content area containing the translation display
 * @param onSpeak - Callback function to speak translated text
 * @returns JSX Element representing the main content area
 */
export const MainContent: React.FC<MainContentProps> = React.memo(({ onSpeak }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4" role="main">
      <TranslationView onSpeak={onSpeak} />
    </main>
  );
});

MainContent.displayName = 'MainContent';