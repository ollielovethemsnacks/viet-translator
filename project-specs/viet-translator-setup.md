# Viet Translator - Project Specification

## Project Overview
**Name:** Viet Translator  
**Type:** iOS Native Application  
**Platform:** iPhone (iOS 15+)  
**Language:** Swift / SwiftUI  

## Problem Statement
User lives with Vietnamese-speaking in-laws and cannot understand their conversations. Need a real-time translation solution that works offline to help connect with family during dinner table conversations.

## Core Requirements

### Functional Requirements
1. **Real-time Vietnamese Speech Recognition**
   - Capture audio from iPhone microphone
   - Transcribe Vietnamese speech to text
   - Must work offline (no cloud APIs)

2. **Instant Translation**
   - Translate Vietnamese text to English
   - Near-instant translation speed (priority)
   - Must work 100% offline

3. **Multi-Speaker Support**
   - Handle multiple speakers in same conversation
   - Differentiate or aggregate speech from different people
   - Optimized for dining table scenarios (3-4 people)

4. **Visual Display**
   - Clean, readable UI showing English transcriptions
   - Real-time updating as conversation flows
   - Large text for easy reading during meals

### Non-Functional Requirements
- **Offline-First:** 100% functionality without internet connection
- **Speed Priority:** Near-instant translation over perfect accuracy
- **Privacy:** No audio or data leaves the device
- **Performance:** Run on modern iPhones (iPhone 12+)
- **Battery:** Efficient enough for 1-2 hour dinner conversations

## Technical Approach

### Speech Recognition
- **Option A:** Whisper.cpp (OpenAI Whisper ported to Core ML)
- **Option B:** iOS Speech framework with Vietnamese locale
- **Option C:** Vosk on-device ASR

### Translation
- **Option A:** Local LLM (Llama.cpp, Mistral 7B quantized)
- **Option B:** Rule-based/statistical translation
- **Option C:** Neural MT model (NLLB-200 distilled)

### Architecture
- SwiftUI for UI
- AVFoundation for audio capture
- Core ML / Metal for ML inference
- Combine or async/await for reactive UI updates

## MVP Scope
1. Basic audio capture and Vietnamese transcription
2. Vietnamese → English translation
3. Simple text display UI
4. Offline operation
5. Support for single speaker (multi-speaker v2)

## Success Criteria
- User can understand basic Vietnamese dinner conversations
- Translation appears within 1-2 seconds of speech
- Works without internet connection
- Battery lasts through a 1-hour dinner

## Constraints
- Must use on-device ML models only
- Vietnamese language support required
- iOS platform only (iPhone)
- No external API dependencies
