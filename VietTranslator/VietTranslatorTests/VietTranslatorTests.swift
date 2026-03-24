//
//  VietTranslatorTests.swift
//  VietTranslatorTests
//
//  Unit tests for Viet Translator
//

import XCTest
@testable import VietTranslator

final class VietTranslatorTests: XCTestCase {
    
    // MARK: - Model Tests
    func testAudioBufferDuration() {
        let buffer = AudioBuffer(
            data: Array(repeating: 0.0, count: 16000),
            timestamp: Date(),
            sampleRate: 16000
        )
        
        XCTAssertEqual(buffer.duration, 1.0, accuracy: 0.001)
    }
    
    func testSpeakerColors() {
        let color0 = SpeakerColors.color(for: 0)
        let color1 = SpeakerColors.color(for: 1)
        let color4 = SpeakerColors.color(for: 4) // Should wrap to color0
        
        XCTAssertEqual(color0, color4)
        XCTAssertNotEqual(color0, color1)
    }
    
    func testLanguageDisplayName() {
        XCTAssertEqual(Language.vietnamese.displayName, "Vietnamese")
        XCTAssertEqual(Language.english.displayName, "English")
    }
    
    // MARK: - Translation Cache Tests
    func testTranslationCache() {
        let cache = TranslationCache()
        let translation = Translation(
            originalText: "Xin chào",
            translatedText: "Hello",
            confidence: 0.95
        )
        
        // Test set and get
        cache.set(translation, for: "Xin chào")
        let retrieved = cache.get(for: "Xin chào")
        
        XCTAssertNotNil(retrieved)
        XCTAssertEqual(retrieved?.translatedText, "Hello")
    }
    
    func testTranslationCacheEviction() {
        let cache = TranslationCache()
        
        // Fill cache beyond capacity
        for i in 0..<1005 {
            let translation = Translation(
                originalText: "Text \(i)",
                translatedText: "Translation \(i)",
                confidence: 0.9
            )
            cache.set(translation, for: "Text \(i)")
        }
        
        // First items should be evicted
        XCTAssertNil(cache.get(for: "Text 0"))
        XCTAssertNil(cache.get(for: "Text 1"))
        
        // Recent items should still exist
        XCTAssertNotNil(cache.get(for: "Text 1004"))
    }
    
    // MARK: - Speaker Detector Tests
    func testSimpleSpeakerDetector() {
        let detector = SimpleSpeakerDetector()
        
        let transcription1 = Transcription(text: "Hello", confidence: 0.9, timestamp: Date())
        let speaker1 = detector.detectSpeaker(for: transcription1)
        XCTAssertEqual(speaker1, 0)
        
        // Immediate next transcription should be same speaker
        let transcription2 = Transcription(text: "World", confidence: 0.9, timestamp: Date())
        let speaker2 = detector.detectSpeaker(for: transcription2)
        XCTAssertEqual(speaker2, 0)
        
        // Transcription after long pause should be different speaker
        let futureDate = Date().addingTimeInterval(3.0)
        let transcription3 = Transcription(text: "Hi", confidence: 0.9, timestamp: futureDate)
        let speaker3 = detector.detectSpeaker(for: transcription3)
        XCTAssertEqual(speaker3, 1)
    }
    
    // MARK: - Error Tests
    func testTranslationErrorDescriptions() {
        let audioError = TranslationError.audioCaptureFailed(NSError(domain: "Test", code: -1))
        XCTAssertTrue(audioError.errorDescription?.contains("Audio capture failed") ?? false)
        
        let permissionError = TranslationError.microphonePermissionDenied
        XCTAssertTrue(permissionError.errorDescription?.contains("Microphone permission") ?? false)
    }
}
