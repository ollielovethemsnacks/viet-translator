//
//  TranslationModels.swift
//  VietTranslator
//
//  Core data models for the translation pipeline
//

import Foundation
import SwiftUI

/// Represents a captured audio buffer
struct AudioBuffer {
    let data: [Float]
    let timestamp: Date
    let sampleRate: Int
    
    var duration: TimeInterval {
        Double(data.count) / Double(sampleRate)
    }
}

/// Result from speech recognition
struct Transcription: Identifiable {
    let id: UUID
    let text: String
    let confidence: Double
    let timestamp: Date
    let isPartial: Bool
    let speakerId: Int?
    
    init(id: UUID = UUID(), 
         text: String, 
         confidence: Double, 
         timestamp: Date = Date(), 
         isPartial: Bool = false, 
         speakerId: Int? = nil) {
        self.id = id
        self.text = text
        self.confidence = confidence
        self.timestamp = timestamp
        self.isPartial = isPartial
        self.speakerId = speakerId
    }
}

/// Result from translation
struct Translation: Identifiable {
    let id: UUID
    let originalText: String
    let translatedText: String
    let sourceLanguage: Language
    let targetLanguage: Language
    let timestamp: Date
    let confidence: Double
    
    init(id: UUID = UUID(),
         originalText: String,
         translatedText: String,
         sourceLanguage: Language = .vietnamese,
         targetLanguage: Language = .english,
         timestamp: Date = Date(),
         confidence: Double) {
        self.id = id
        self.originalText = originalText
        self.translatedText = translatedText
        self.sourceLanguage = sourceLanguage
        self.targetLanguage = targetLanguage
        self.timestamp = timestamp
        self.confidence = confidence
    }
}

/// Combined item for UI display
struct TranslationItem: Identifiable {
    let id: UUID
    let transcription: Transcription
    let translation: Translation
    let speakerColor: Color
    
    init(transcription: Transcription, translation: Translation, speakerColor: Color) {
        self.id = transcription.id
        self.transcription = transcription
        self.translation = translation
        self.speakerColor = speakerColor
    }
}

/// Supported languages
enum Language: String, CaseIterable, Codable {
    case vietnamese = "vi"
    case english = "en"
    
    var displayName: String {
        switch self {
        case .vietnamese:
            return "Vietnamese"
        case .english:
            return "English"
        }
    }
    
    var localeIdentifier: String {
        rawValue
    }
}

/// Errors that can occur in the translation pipeline
enum TranslationError: Error, LocalizedError {
    case audioCaptureFailed(Error)
    case modelLoadingFailed(String)
    case transcriptionFailed(Error)
    case translationFailed(Error)
    case insufficientMemory
    case microphonePermissionDenied
    case invalidAudioFormat
    case pipelineNotStarted
    
    var errorDescription: String? {
        switch self {
        case .audioCaptureFailed(let error):
            return "Audio capture failed: \(error.localizedDescription)"
        case .modelLoadingFailed(let message):
            return "Model loading failed: \(message)"
        case .transcriptionFailed(let error):
            return "Transcription failed: \(error.localizedDescription)"
        case .translationFailed(let error):
            return "Translation failed: \(error.localizedDescription)"
        case .insufficientMemory:
            return "Insufficient memory. Please close other apps."
        case .microphonePermissionDenied:
            return "Microphone permission denied. Please enable in Settings."
        case .invalidAudioFormat:
            return "Invalid audio format"
        case .pipelineNotStarted:
            return "Translation pipeline not started"
        }
    }
}

/// Speaker colors for visual differentiation
struct SpeakerColors {
    static let colors: [Color] = [
        Color.blue,
        Color.green,
        Color.orange,
        Color.purple
    ]
    
    static func color(for speakerId: Int) -> Color {
        colors[speakerId % colors.count]
    }
}
