# Viet Translator - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     iOS Application                          │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Audio      │───▶│   Speech     │───▶│ Translation │  │
│  │   Capture    │    │ Recognition  │    │   Engine     │  │
│  │  (AVFoundation)│   │  (Whisper)   │    │  (NLLB/CoreML)│  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         └───────────────────┴───────────────────┘           │
│                             │                               │
│                             ▼                               │
│                    ┌──────────────┐                        │
│                    │   Pipeline   │                        │
│                    │ Orchestrator │                        │
│                    │  (Combine)   │                        │
│                    └──────────────┘                        │
│                             │                               │
│                             ▼                               │
│                    ┌──────────────┐                        │
│                    │      UI      │                        │
│                    │   (SwiftUI)  │                        │
│                    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Audio Capture Layer
**Responsibility:** Real-time microphone input with minimal latency

**Components:**
- `AudioCaptureService` - Manages AVAudioEngine
- `AudioBufferProcessor` - Processes raw audio into chunks
- `AudioSessionManager` - Handles audio session configuration

**Key Decisions:**
- Sample Rate: 16kHz (optimal for Whisper)
- Buffer Size: 320ms chunks (balance latency/processing)
- Format: PCM Float32

**Code Structure:**
```swift
protocol AudioCaptureProtocol {
    var audioStream: AsyncStream<AudioBuffer> { get }
    func startCapture() async throws
    func stopCapture() async
}
```

### 2. Speech Recognition Layer
**Responsibility:** Vietnamese speech-to-text using Whisper

**Components:**
- `WhisperRecognitionService` - Wraps whisper.cpp
- `TranscriptionBuffer` - Accumulates partial transcriptions
- `LanguageDetector` - (Future) Detect language automatically

**Model Selection:**
- **Primary:** whisper-small-vi (~466MB)
  - Good balance of speed/accuracy
  - Vietnamese fine-tuned
  - ~5x real-time on iPhone 12+
- **Fallback:** whisper-base-vi (~150MB)
  - Faster, less accurate
  - Lower memory footprint

**Integration:**
```swift
protocol SpeechRecognitionProtocol {
    func transcribe(audioBuffer: AudioBuffer) async throws -> Transcription
}

struct Transcription {
    let text: String
    let confidence: Double
    let timestamp: Date
    let isPartial: Bool
}
```

### 3. Translation Layer
**Responsibility:** Vietnamese → English translation

**Components:**
- `TranslationService` - Core translation logic
- `TranslationCache` - LRU cache for common phrases
- `ModelManager` - Handles Core ML model loading

**Model Selection:**
- **Primary:** NLLB-200 distilled (600MB)
  - 200 languages supported
  - Good quality for Vietnamese
  - Core ML converted
- **Alternative:** Small transformer (200MB)
  - Faster inference
  - Lower quality but acceptable

**Performance Target:**
- Translation latency: <500ms
- Throughput: 10+ sentences/second
- Memory: <1GB during operation

### 4. Pipeline Orchestration
**Responsibility:** Connect components with reactive data flow

**Architecture Pattern:** Combine Framework

```swift
class TranslationPipeline: ObservableObject {
    @Published var translations: [TranslationItem] = []
    
    private let audioCapture: AudioCaptureProtocol
    private let speechRecognition: SpeechRecognitionProtocol
    private let translationService: TranslationProtocol
    
    func start() {
        audioCapture.audioStream
            .flatMap { buffer in
                speechRecognition.transcribe(audioBuffer: buffer)
            }
            .flatMap { transcription in
                translationService.translate(transcription.text, from: .vietnamese, to: .english)
            }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] translation in
                self?.translations.append(translation)
            }
            .store(in: &cancellables)
    }
}
```

### 5. UI Layer
**Responsibility:** Display translations in real-time

**Components:**
- `TranslationView` - Main conversation view
- `TranslationBubble` - Individual translation display
- `SpeakerIndicator` - Visual speaker differentiation
- `SettingsView` - App configuration

**Design Principles:**
- Large, readable text (minimum 18pt)
- High contrast for visibility
- Minimal UI chrome
- Scrollable conversation history

**SwiftUI Structure:**
```swift
struct TranslationView: View {
    @StateObject private var pipeline = TranslationPipeline()
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(pipeline.translations) { item in
                    TranslationBubble(item: item)
                }
            }
        }
        .onAppear { pipeline.start() }
    }
}
```

## Data Models

### Core Models
```swift
struct AudioBuffer {
    let data: [Float]
    let timestamp: Date
    let sampleRate: Int
}

struct Transcription {
    let id: UUID
    let text: String
    let confidence: Double
    let timestamp: Date
    let isPartial: Bool
    let speakerId: Int?
}

struct Translation {
    let id: UUID
    let originalText: String
    let translatedText: String
    let sourceLanguage: Language
    let targetLanguage: Language
    let timestamp: Date
    let confidence: Double
}

struct TranslationItem: Identifiable {
    let id: UUID
    let transcription: Transcription
    let translation: Translation
    let speakerColor: Color
}

enum Language: String, CaseIterable {
    case vietnamese = "vi"
    case english = "en"
}
```

## Multi-Speaker Detection

### Approach: Simple Heuristics (MVP)
**Rationale:** Full speaker diarization is complex; simple heuristics work for dining table scenarios

**Algorithm:**
1. **Pause Detection:** >2 second pause = new speaker likely
2. **Volume Clustering:** Group similar volume levels
3. **Sequential Assignment:** Rotate through speaker IDs

```swift
class SimpleSpeakerDetector {
    private var lastSpeakerId = 0
    private var lastTimestamp: Date?
    private let speakerSwitchThreshold: TimeInterval = 2.0
    
    func detectSpeaker(for transcription: Transcription) -> Int {
        guard let lastTime = lastTimestamp else {
            lastTimestamp = transcription.timestamp
            return 0
        }
        
        let timeDelta = transcription.timestamp.timeIntervalSince(lastTime)
        
        if timeDelta > speakerSwitchThreshold {
            lastSpeakerId = (lastSpeakerId + 1) % 4 // Max 4 speakers
        }
        
        lastTimestamp = transcription.timestamp
        return lastSpeakerId
    }
}
```

**Visual Indicators:**
- 4 distinct colors for speakers
- Simple avatar circles
- Color-coded translation bubbles

## Performance Optimization

### 1. Model Loading
- Load models on app launch (show splash screen)
- Keep models in memory during operation
- Unload when app backgrounded (optional)

### 2. Audio Processing
- Process audio on background queue
- Use circular buffer to minimize allocations
- Batch process when possible

### 3. Translation Caching
- LRU cache for repeated phrases
- Cache size: 1000 entries (~10MB)
- Invalidate on language change

### 4. UI Updates
- Update UI on main thread only
- Use `LazyVStack` for memory efficiency
- Limit conversation history to last 100 items

## Error Handling

### Error Types
```swift
enum TranslationError: Error {
    case audioCaptureFailed(Error)
    case modelLoadingFailed(String)
    case transcriptionFailed(Error)
    case translationFailed(Error)
    case insufficientMemory
    case microphonePermissionDenied
}
```

### Recovery Strategies
1. **Audio Capture Failure:** Retry with exponential backoff
2. **Model Loading Failure:** Show error, allow manual retry
3. **Transcription Failure:** Skip buffer, continue with next
4. **Translation Failure:** Show original text with error indicator

## Security & Privacy

### Data Handling
- **No network requests:** All processing on-device
- **No cloud storage:** No audio/text sent to servers
- **No analytics:** No usage tracking
- **Local only:** All data stays on device

### Permissions
- **Microphone:** Required for audio capture
- **Speech Recognition:** Not needed (using Whisper, not Siri)

## Build Configuration

### Xcode Settings
- **Deployment Target:** iOS 15.0+
- **Devices:** iPhone only (iPad optional)
- **Orientation:** Portrait only
- **Capabilities:** 
  - Microphone
  - Audio
  - Background processing (optional)

### App Store Requirements
- **Category:** Utilities or Productivity
- **Age Rating:** 4+
- **Price:** Free or Paid
- **In-App Purchases:** None (offline app)

## Testing Strategy

### Unit Tests
- Audio buffer processing
- Translation pipeline
- Speaker detection logic
- Cache management

### Integration Tests
- End-to-end audio → translation flow
- Model loading and inference
- UI state management

### Manual Tests
- Real Vietnamese conversation
- Dining table scenario (3-4 speakers)
- Battery drain over 1 hour
- Performance on iPhone 12, 13, 14, 15

## Future Enhancements (Post-MVP)

1. **Advanced Speaker Diarization**
   - ML-based speaker identification
   - Voice fingerprinting

2. **Additional Languages**
   - Support for other language pairs
   - Auto-language detection

3. **Conversation History**
   - Save past translations
   - Search and export

4. **Accessibility**
   - VoiceOver support
   - Dynamic Type
   - Reduce Motion

5. **Apple Watch Companion**
   - Quick glances at translations
   - Remote control

---

*Architecture Version: 1.0*
*Date: 2026-03-24*
*Author: ArchitectUX Agent*