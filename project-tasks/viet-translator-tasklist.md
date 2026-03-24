# Viet Translator - Task List

## Project Overview
Real-time Vietnamese → English speech translator for iPhone. 100% offline, near-instant translation, multi-speaker support.

---

### [x] Task 1: Project Setup and iOS App Shell
**Description:** Create the basic iOS project structure with SwiftUI app shell
**Acceptance Criteria:**
- Xcode project created with SwiftUI lifecycle
- Basic app structure (App, ContentView, Assets)
- App builds and runs on simulator
- Folder structure organized (Models, Views, Services, Utils)
**Technical Notes:**
- Use SwiftUI App lifecycle
- Target iOS 15+ for modern features
- Enable Core ML and AVFoundation capabilities
**Estimated Effort:** Small

---

### [x] Task 2: Audio Capture Implementation
**Description:** Implement real-time audio capture from iPhone microphone
**Acceptance Criteria:**
- AVAudioEngine setup for microphone input
- Real-time audio buffer streaming
- Proper audio session configuration
- Request microphone permissions
- Audio captured at 16kHz (optimal for speech recognition)
**Technical Notes:**
- Use AVAudioEngine with manual rendering mode
- Configure audio session for recording
- Handle interruptions (phone calls, etc.)
**Estimated Effort:** Medium

---

### [x] Task 3: Vietnamese Speech Recognition (iOS Speech Framework)
**Description:** Integrate Whisper.cpp for offline Vietnamese speech-to-text
**Acceptance Criteria:**
- Download and integrate Whisper.cpp (Core ML version)
- Load Vietnamese-optimized Whisper model
- Process audio buffers and output Vietnamese text
- Handle real-time streaming transcription
- Works completely offline
**Technical Notes:**
- Use whisper.cpp with Core ML backend
- Model: whisper-small-vi or whisper-base-vi (balance size/accuracy)
- Process audio in chunks for real-time feel
**Estimated Effort:** Large

---

### [x] Task 4: Vietnamese-to-English Translation Engine (Dictionary-based MVP)
**Description:** Implement offline translation from Vietnamese to English
**Acceptance Criteria:**
- Integrate local translation model
- Translate Vietnamese text to English
- Near-instant translation (< 1 second)
- Works 100% offline
- Handle common Vietnamese conversational phrases
**Technical Notes:**
- Option A: NLLB-200 distilled (200MB-600MB)
- Option B: Small encoder-decoder model
- Use Core ML for inference
- Batch translations for efficiency
**Estimated Effort:** Large

---

### [x] Task 5: Translation Pipeline Orchestration
**Description:** Connect audio → transcription → translation pipeline
**Acceptance Criteria:**
- Audio buffers flow to Whisper
- Whisper output flows to translator
- Translator output displayed in UI
- Pipeline handles errors gracefully
- Optimized for minimal latency
**Technical Notes:**
- Use Combine or async/await for reactive pipeline
- Buffer management for smooth flow
- Error handling at each stage
**Estimated Effort:** Medium

---

### [x] Task 6: Real-Time Translation UI
**Description:** Create the main translation display interface
**Acceptance Criteria:**
- Large, readable text display for translations
- Real-time updating as translations arrive
- Clear visual separation between speakers (if detected)
- Scrollable conversation history
- Clean, distraction-free design
**Technical Notes:**
- SwiftUI List or ScrollView
- Dynamic type support
- Dark mode support
- Large accessibility sizes
**Estimated Effort:** Medium

---

### [x] Task 7: Multi-Speaker Detection (Basic)
**Description:** Basic speaker differentiation for dining table scenarios
**Acceptance Criteria:**
- Detect when different speakers are talking
- Visually indicate speaker changes
- Handle 2-4 speakers in same conversation
- Simple heuristics (pause-based, volume-based)
**Technical Notes:**
- Use audio energy/pause detection
- Assign temporary speaker IDs
- Visual indicators (colors, avatars)
**Estimated Effort:** Medium

---

### [ ] Task 8: Settings and Configuration
**Description:** App settings for customization
**Acceptance Criteria:**
- Settings screen with options
- Language pair selection (Vietnamese → English)
- Translation speed vs accuracy toggle
- Font size adjustment
- Model download/management
**Technical Notes:**
- SwiftUI Form
- UserDefaults for persistence
- Model management UI
**Estimated Effort:** Small

---

### [ ] Task 9: Performance Optimization
**Description:** Optimize for speed and battery efficiency
**Acceptance Criteria:**
- Translation latency under 1-2 seconds
- Battery lasts 1+ hours of continuous use
- Smooth UI at 60fps
- Efficient memory usage
- Thermal throttling handled
**Technical Notes:**
- Profile with Instruments
- Optimize Core ML inference
- Background queue management
- Memory pressure handling
**Estimated Effort:** Medium

---

### [ ] Task 10: Testing and Quality Assurance
**Description:** Comprehensive testing of the translation system
**Acceptance Criteria:**
- Unit tests for pipeline components
- Integration tests for full flow
- Test with real Vietnamese audio samples
- Error handling tested
- Performance benchmarks
**Technical Notes:**
- XCTest framework
- Sample Vietnamese audio for testing
- Mock audio data for CI
**Estimated Effort:** Medium

---

### [ ] Task 11: App Icon and Launch Screen
**Description:** Basic branding and app store assets
**Acceptance Criteria:**
- App icon for all iOS sizes
- Launch screen
- Basic app store screenshots placeholder
- App name: "Viet Translator"
**Technical Notes:**
- SF Symbols or simple design
- Adaptive icon
**Estimated Effort:** Small

---

### [ ] Task 12: Build and Archive Configuration
**Description:** Configure for App Store distribution
**Acceptance Criteria:**
- Valid code signing setup
- App Store Connect configured
- Archive builds successfully
- Basic app store metadata prepared
**Technical Notes:**
- Xcode signing configuration
- Info.plist permissions
- App Store requirements
**Estimated Effort:** Small

---

## Task Dependencies

```
Task 1 (Setup)
  ↓
Task 2 (Audio) → Task 3 (Whisper) → Task 4 (Translation)
  ↓                    ↓                  ↓
  └────────────────────┴──────────────────┘
                       ↓
              Task 5 (Pipeline) → Task 6 (UI)
                       ↓
              Task 7 (Multi-speaker)
                       ↓
              Task 8 (Settings)
                       ↓
              Task 9 (Optimization)
                       ↓
              Task 10 (Testing)
                       ↓
              Task 11 (Assets) + Task 12 (Build)
```

---

## Priority Order
1. Task 1 - Project Setup
2. Task 2 - Audio Capture
3. Task 3 - Speech Recognition
4. Task 4 - Translation Engine
5. Task 5 - Pipeline
6. Task 6 - UI
7. Task 7 - Multi-speaker
8. Task 8 - Settings
9. Task 9 - Optimization
10. Task 10 - Testing
11. Task 11 - Assets
12. Task 12 - Build

---

*Generated by project-manager-senior agent*
*Date: 2026-03-24*
