import React from 'react';
import { useTranslationStore } from '../stores/translationStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Available colors for transcript highlighting
const speakerColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

export interface TranslationBubbleProps {
  transcription: string;
  translation: string;
  color: string;
  onSpeak?: (text: string) => void;
}

export function TranslationBubble({
  transcription,
  translation,
  color,
  onSpeak
}: TranslationBubbleProps) {
  const [showTranslation, setShowTranslation] = React.useState(false);

  return (
    <div 
      className={`relative p-4 rounded-xl mb-3 transition-all duration-200 ${
        showTranslation ? 'bg-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={() => setShowTranslation(!showTranslation)}
    >
      <div 
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ backgroundColor: color }}
      />
      <div className="pl-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">Vietnamese</span>
          <div className="flex gap-2">
            {onSpeak && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(transcription);
                }}
                className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                title="Listen to Vietnamese"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2V5z" />
                  <path d="M9 5a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
                  <path d="M5 9V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="text-gray-800 font-medium mb-1">
          {transcription}
        </div>
        
        {showTranslation && (
          <div className="mt-2 animate-fade-in">
            <div className="text-xs font-medium text-gray-500 mb-1">English</div>
            <div className="text-gray-700 text-lg">
              {translation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface TranslationViewProps {
  onSpeak?: (text: string) => void;
}

export function TranslationView({ onSpeak }: TranslationViewProps) {
  const { translations } = useTranslationStore();
  const { finalTranscript } = useSpeechRecognition();
  
  const getColor = (index: number) => speakerColors[index % speakerColors.length];

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        {finalTranscript && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Currently speaking:</div>
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 animate-pulse">
              {finalTranscript}
            </div>
          </div>
        )}
        
        {translations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto mb-4 opacity-30" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
              />
            </svg>
            <p className="mb-2">Tap the microphone to start speaking Vietnamese</p>
            <p className="text-sm">I'll translate it to English for you</p>
          </div>
        ) : (
          <div className="space-y-1">
            {translations.map((item, index) => (
              <TranslationBubble
                key={index}
                transcription={item.transcription}
                translation={item.translation}
                color={getColor(index)}
                onSpeak={onSpeak}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
