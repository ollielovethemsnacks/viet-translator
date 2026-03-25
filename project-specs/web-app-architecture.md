# Viet Translator Web App - Architecture Specification

## Project Overview
Convert the iOS Viet Translator app to a Progressive Web App (PWA) that runs in browsers and can be installed on mobile devices.

## Core Requirements
- Real-time Vietnamese speech recognition
- Vietnamese-to-English translation
- Works offline after initial load
- Installable as PWA on iOS/Android
- Clean, mobile-first UI

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast dev server, optimized builds)
- **Styling**: Tailwind CSS (utility-first, mobile-responsive)
- **State Management**: Zustand (lightweight, simple)
- **PWA**: Vite PWA plugin for service worker and manifest

### Speech Recognition
- **API**: Web Speech API (built into modern browsers)
- **Language**: Vietnamese (vi-VN)
- **Fallback**: Show message if browser doesn't support

### Translation Engine
- **Approach**: Client-side dictionary (same 100+ words from iOS app)
- **Storage**: IndexedDB for offline persistence
- **Future**: Can integrate Google Translate API with caching

### PWA Features
- **Service Worker**: Cache assets for offline use
- **Manifest**: Install prompt on mobile devices
- **Icons**: Multiple sizes for different platforms
- **Theme**: Dark/light mode support

### Project Structure
```
viet-translator-web/
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── TranslationView.tsx
│   │   ├── TranslationBubble.tsx
│   │   └── SettingsPanel.tsx
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts
│   │   └── useTranslation.ts
│   ├── stores/
│   │   └── translationStore.ts
│   ├── services/
│   │   ├── speechRecognition.ts
│   │   ├── translation.ts
│   │   └── dictionary.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Key Components

#### 1. Speech Recognition Hook
```typescript
useSpeechRecognition({
  language: 'vi-VN',
  onResult: (transcript) => handleTranscript(transcript),
  onError: (error) => handleError(error)
})
```

#### 2. Translation Service
- Load dictionary from JSON
- Cache in IndexedDB
- Match words/phrases
- Return English translation

#### 3. UI Components
- **TranslationView**: Main interface, scrollable list
- **TranslationBubble**: Individual translation item
- **MicButton**: Start/stop recording with visual feedback
- **SettingsPanel**: Language selection, theme toggle

### Data Flow
```
User speaks Vietnamese
    ↓
Web Speech API captures audio
    ↓
Browser transcribes to Vietnamese text
    ↓
Translation service matches words
    ↓
English translation displayed
    ↓
Stored in conversation history
```

### Offline Strategy
1. **Service Worker**: Cache all static assets
2. **IndexedDB**: Store dictionary and conversation history
3. **Fallback**: Show cached translations when offline

### Browser Support
- **Primary**: Safari iOS (Web Speech API support)
- **Secondary**: Chrome Android
- **Fallback**: Show message if API unavailable

### Deployment
- **Platform**: GitHub Pages (free, easy)
- **Domain**: Custom domain optional
- **HTTPS**: Required for PWA and microphone access

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse PWA Score: > 90

### Security
- HTTPS only (required for microphone)
- No server-side code (all client-side)
- No data collection
- Local storage only

## MVP Features
1. Real-time Vietnamese speech recognition
2. Dictionary-based translation (100+ words)
3. Conversation history
4. PWA install support
5. Offline functionality

## Future Enhancements
1. Neural machine translation (Google/DeepL API)
2. Multi-language support
3. Export conversation history
4. Voice synthesis (text-to-speech)
5. Cloud sync

## Success Criteria
- User can speak Vietnamese and see English translation
- App works offline after first load
- Can be installed on iOS home screen
- Translation appears within 2 seconds of speech

---

*Architecture Version: 1.0*
*Date: 2025-03-25*
*Author: ArchitectUX Agent*
