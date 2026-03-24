//
//  SpeechRecognitionService.swift
//  VietTranslator
//
//  Vietnamese speech-to-text using iOS Speech framework
//  Note: Uses internet for recognition (offline Whisper to be added later)
//

import Foundation
import Speech
import Combine

protocol SpeechRecognitionProtocol {
    var transcriptionStream: AsyncStream<Transcription> { get }
    func startRecognition() async throws
    func stopRecognition()
    func requestAuthorization() async -> Bool
}

class SpeechRecognitionService: SpeechRecognitionProtocol, ObservableObject {
    // MARK: - Published Properties
    @Published var isRecognizing = false
    @Published var currentTranscription: String = ""
    
    // MARK: - Properties
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    // Async stream for transcriptions
    private var transcriptionContinuation: AsyncStream<Transcription>.Continuation?
    private var _transcriptionStream: AsyncStream<Transcription>?
    
    var transcriptionStream: AsyncStream<Transcription> {
        if let stream = _transcriptionStream {
            return stream
        }
        let stream = AsyncStream { continuation in
            self.transcriptionContinuation = continuation
        }
        _transcriptionStream = stream
        return stream
    }
    
    // MARK: - Initialization
    init() {
        // Initialize speech recognizer for Vietnamese
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "vi-VN"))
        speechRecognizer?.delegate = self
    }
    
    // MARK: - Authorization
    func requestAuthorization() async -> Bool {
        // Request speech recognition authorization
        let speechStatus = await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
        
        // Request microphone authorization
        let audioSession = AVAudioSession.sharedInstance()
        let micStatus = await audioSession.requestRecordPermission()
        
        return speechStatus == .authorized && micStatus
    }
    
    // MARK: - Recognition Control
    func startRecognition() async throws {
        guard !isRecognizing else { return }
        
        // Check authorization
        guard await requestAuthorization() else {
            throw TranslationError.microphonePermissionDenied
        }
        
        // Cancel any existing task
        recognitionTask?.cancel()
        recognitionTask = nil
        
        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        
        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            throw TranslationError.transcriptionFailed(NSError(domain: "SpeechRecognition", code: -1))
        }
        
        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.requiresOnDeviceRecognition = false // Use cloud for better accuracy
        
        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            if let result = result {
                let transcription = result.bestTranscription.formattedString
                self.currentTranscription = transcription
                
                // Send transcription to stream
                let transcriptionObj = Transcription(
                    text: transcription,
                    confidence: result.bestTranscription.segments.first?.confidence ?? 0.5,
                    isPartial: !result.isFinal
                )
                self.transcriptionContinuation?.yield(transcriptionObj)
                
                // If final, reset for next utterance
                if result.isFinal {
                    self.currentTranscription = ""
                }
            }
            
            if error != nil {
                self.stopRecognition()
            }
        }
        
        // Configure audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        // Start audio engine
        audioEngine.prepare()
        try audioEngine.start()
        
        isRecognizing = true
        print("🎤 Speech recognition started")
    }
    
    func stopRecognition() {
        guard isRecognizing else { return }
        
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        
        recognitionTask?.cancel()
        recognitionTask = nil
        
        transcriptionContinuation?.finish()
        transcriptionContinuation = nil
        _transcriptionStream = nil
        
        isRecognizing = false
        currentTranscription = ""
        
        print("🛑 Speech recognition stopped")
    }
}

// MARK: - SFSpeechRecognizerDelegate
extension SpeechRecognitionService: SFSpeechRecognizerDelegate {
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        if !available {
            print("⚠️ Speech recognizer became unavailable")
            stopRecognition()
        }
    }
}
