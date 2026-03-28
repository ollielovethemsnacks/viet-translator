import { useTranslationStore } from '../stores/translationStore';

const speakerColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

interface TranslationBubbleProps {
  transcription: string;
  translation: string;
  color: string;
  onSpeak?: (text: string) => void;
}

function TranslationBubble({ transcription, translation, color, onSpeak }: TranslationBubbleProps) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <p className="text-gray-800 font-medium">{transcription}</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-blue-600">{translation}</p>
            </div>
            {onSpeak && (
              <button
                onClick={() => onSpeak(translation)}
                className="mt-2 text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Speak
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TranslationViewProps {
  onSpeak?: (text: string) => void;
}

export function TranslationView({ onSpeak }: TranslationViewProps) {
  const { translations } = useTranslationStore();

  const getColor = (index: number) => speakerColors[index % speakerColors.length];

  if (translations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
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
        <p className="mb-2">Tap the microphone to speak Vietnamese</p>
        <p className="text-sm">I'll translate it to English for you</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {translations.map((item: { transcription: string; translation: string }, index: number) => (
        <TranslationBubble
          key={index}
          transcription={item.transcription}
          translation={item.translation}
          color={getColor(index)}
          onSpeak={onSpeak}
        />
      ))}
    </div>
  );
}