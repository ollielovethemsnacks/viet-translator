# Viet Translator 🇻🇳 → 🇬🇧

Real-time Vietnamese to English translation app for iPhone.

## Features

- 🎤 **Live Speech Recognition** - Listens to Vietnamese speech in real-time
- 🌐 **Instant Translation** - Translates to English as you speak
- 👥 **Multi-Speaker Support** - Detects different speakers in conversations
- 📱 **iOS Native** - Built with SwiftUI for smooth performance
- 🔒 **Privacy First** - No data stored or transmitted (except speech recognition which uses Apple's servers temporarily)

## Requirements

- iOS 15.0+
- iPhone 12 or newer (for best performance)
- Internet connection (for speech recognition)

## Installation

### Option 1: Build from Source

1. **Clone the repository:**
   ```bash
   cd /home/johnny/.openclaw/agency-agents/workspace/viet-translator/VietTranslator
   ```

2. **Open in Xcode:**
   ```bash
   open Package.swift
   ```
   Or open the folder in Xcode directly.

3. **Build and Run:**
   - Select your iPhone as the target device
   - Press Cmd+R to build and run
   - Grant microphone and speech recognition permissions when prompted

### Option 2: Create Xcode Project

If you need an `.xcodeproj` file:

1. Open Xcode
2. File → New → Project
3. Select "App" template
4. Name: "VietTranslator"
5. Organization: Your name
6. Interface: SwiftUI
7. Language: Swift
8. Copy the source files from this directory into the project

## Usage

1. **Launch the app**
2. **Tap the microphone button** to start listening
3. **Speak Vietnamese** or have someone speak Vietnamese near the phone
4. **See translations** appear in real-time
5. **Tap stop** when finished

## How It Works

1. **Audio Capture** - iPhone microphone captures audio
2. **Speech Recognition** - iOS Speech framework transcribes Vietnamese speech
3. **Translation** - Dictionary-based translation converts to English
4. **Display** - Shows both Vietnamese text and English translation

## Translation Coverage

The app includes a built-in dictionary of 100+ common Vietnamese words and phrases. It will:
- ✅ Translate common conversational words
- ⚠️ Show untranslated words in brackets ["like this"]
- 🔄 Improve over time (offline ML models coming in future updates)

## Known Limitations

- Requires internet for speech recognition (offline mode coming soon)
- Translation is dictionary-based (not full sentences yet)
- Best with clear speech in quiet environments

## Project Structure

```
VietTranslator/
├── VietTranslatorApp.swift      # App entry point
├── ContentView.swift            # Main container
├── Models/
│   └── TranslationModels.swift  # Data models
├── Views/
│   ├── TranslationView.swift    # Main UI
│   └── SettingsView.swift       # Settings
└── Services/
    ├── AudioCaptureService.swift      # Audio recording
    ├── SpeechRecognitionService.swift # Vietnamese speech-to-text
    ├── TranslationService.swift       # Vietnamese-to-English translation
    └── TranslationPipeline.swift      # Orchestrates the flow
```

## Future Improvements

- [ ] Offline speech recognition (Whisper)
- [ ] Neural machine translation
- [ ] Conversation history
- [ ] Export conversations
- [ ] Apple Watch companion
- [ ] iPad support

## License

Personal use only - built for Johnny to communicate with his in-laws ❤️

## Credits

Built by the OpenClaw Dev Swarm 🤖
- Project Manager: Senior PM Agent
- Architect: ArchitectUX Agent  
- Developer: Frontend Developer Agent
- Orchestrator: Oscar
