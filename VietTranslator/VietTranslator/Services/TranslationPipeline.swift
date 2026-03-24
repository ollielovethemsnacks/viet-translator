//
//  TranslationPipeline.swift
//  VietTranslator
//
//  Orchestrates the translation flow: Audio → Transcription → Translation
//

import Foundation
import Combine
import SwiftUI

class TranslationPipeline: ObservableObject {
    // MARK: - Published State
    @Published var translations: [TranslationItem] = []
    @Published var isRunning = false
    @Published var currentError: TranslationError?
    @Published var currentTranscription: String = ""
    
    // MARK: - Services
    private var speechRecognition: SpeechRecognitionService?
    private var translationService: TranslationService?
    private var speakerDetector = SimpleSpeakerDetector()
    
    // MARK: - Combine
    private var cancellables = Set<AnyCancellable>()
    private var pipelineTask: Task<Void, Never>?
    
    // MARK: - Initialization
    init() {
        setupServices()
    }
    
    deinit {
        stop()
        pipelineTask?.cancel()
    }
    
    // MARK: - Setup
    private func setupServices() {
        speechRecognition = SpeechRecognitionService()
        translationService = TranslationService()
        
        // Subscribe to speech recognition updates
        speechRecognition?.$currentTranscription
            .receive(on: DispatchQueue.main)
            .sink { [weak self] text in
                self?.currentTranscription = text
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Control Methods
    func start() async {
        guard !isRunning else { return }
        
        do {
            // Check permissions
            let hasPermission = await speechRecognition?.requestAuthorization() ?? false
            guard hasPermission else {
                currentError = .microphonePermissionDenied
                return
            }
            
            // Start speech recognition
            try await speechRecognition?.startRecognition()
            
            isRunning = true
            currentError = nil
            
            // Start processing pipeline
            startPipeline()
            
            print("🚀 Translation pipeline started")
            
        } catch {
            currentError = .audioCaptureFailed(error)
            isRunning = false
        }
    }
    
    func stop() {
        guard isRunning else { return }
        
        pipelineTask?.cancel()
        speechRecognition?.stopRecognition()
        
        isRunning = false
        currentTranscription = ""
        
        print("🛑 Translation pipeline stopped")
    }
    
    // MARK: - Pipeline Processing
    private func startPipeline() {
        pipelineTask = Task { [weak self] in
            guard let self = self,
                  let speechService = self.speechRecognition else { return }
            
            // Process transcriptions as they come in
            for await transcription in speechService.transcriptionStream {
                guard !Task.isCancelled else { break }
                
                await self.processTranscription(transcription)
            }
        }
    }
    
    private func processTranscription(_ transcription: Transcription) async {
        // Only process non-empty transcriptions
        guard !transcription.text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        
        // Detect speaker
        let speakerId = speakerDetector.detectSpeaker(for: transcription)
        let updatedTranscription = Transcription(
            id: transcription.id,
            text: transcription.text,
            confidence: transcription.confidence,
            timestamp: transcription.timestamp,
            isPartial: transcription.isPartial,
            speakerId: speakerId
        )
        
        // Translate
        do {
            let translation = try await translationService?.translate(
                updatedTranscription.text,
                from: .vietnamese,
                to: .english
            ) ?? Translation(
                originalText: updatedTranscription.text,
                translatedText: "[Translation unavailable]",
                confidence: 0.0
            )
            
            // Create translation item
            let item = TranslationItem(
                transcription: updatedTranscription,
                translation: translation,
                speakerColor: SpeakerColors.color(for: speakerId)
            )
            
            // Add to translations (only if it's a final result or significant update)
            await MainActor.run {
                if transcription.isFinal {
                    // Remove any previous partial translation for this utterance
                    self.translations.removeAll { $0.id == transcription.id && $0.transcription.isPartial }
                    self.translations.append(item)
                } else {
                    // Update or add partial translation
                    if let index = self.translations.firstIndex(where: { $0.id == transcription.id }) {
                        self.translations[index] = item
                    } else {
                        self.translations.append(item)
                    }
                }
                
                // Keep only last 100 translations to prevent memory issues
                if self.translations.count > 100 {
                    self.translations.removeFirst(self.translations.count - 100)
                }
            }
            
        } catch {
            print("Translation error: \(error)")
        }
    }
}

// MARK: - Simple Speaker Detector
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
