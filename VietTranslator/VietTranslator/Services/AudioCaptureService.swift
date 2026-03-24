//
//  AudioCaptureService.swift
//  VietTranslator
//
//  Real-time audio capture from microphone
//

import Foundation
import AVFoundation
import Combine

protocol AudioCaptureProtocol {
    var audioStream: AsyncStream<AudioBuffer> { get }
    var isCapturing: Bool { get }
    func startCapture() async throws
    func stopCapture()
    func requestPermission() async -> Bool
}

class AudioCaptureService: AudioCaptureProtocol, ObservableObject {
    // MARK: - Published Properties
    @Published var isCapturing = false
    @Published var currentAudioLevel: Float = 0.0
    
    // MARK: - Properties
    private var audioEngine: AVAudioEngine?
    private var audioSession: AVAudioSession { AVAudioSession.sharedInstance() }
    
    // Audio configuration - optimized for Whisper
    private let targetSampleRate: Double = 16000.0 // 16kHz optimal for Whisper
    private let bufferSize: UInt32 = 8192 // ~512ms at 16kHz for processing efficiency
    
    // Async stream for audio buffers
    private var audioContinuation: AsyncStream<AudioBuffer>.Continuation?
    private var _audioStream: AsyncStream<AudioBuffer>?
    
    var audioStream: AsyncStream<AudioBuffer> {
        if let stream = _audioStream {
            return stream
        }
        let stream = AsyncStream { continuation in
            self.audioContinuation = continuation
        }
        _audioStream = stream
        return stream
    }
    
    // MARK: - Initialization
    init() {
        setupNotifications()
    }
    
    deinit {
        stopCapture()
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - Permissions
    func requestPermission() async -> Bool {
        switch audioSession.recordPermission {
        case .granted:
            return true
        case .denied:
            return false
        case .undetermined:
            return await audioSession.requestRecordPermission()
        @unknown default:
            return false
        }
    }
    
    // MARK: - Control Methods
    func startCapture() async throws {
        guard !isCapturing else { return }
        
        // Check permission
        let hasPermission = await requestPermission()
        guard hasPermission else {
            throw TranslationError.microphonePermissionDenied
        }
        
        // Configure audio session
        try configureAudioSession()
        
        // Create and configure audio engine
        try setupAudioEngine()
        
        // Start engine
        try audioEngine?.start()
        isCapturing = true
        
        print("🎤 Audio capture started")
    }
    
    func stopCapture() {
        guard isCapturing else { return }
        
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine = nil
        
        audioContinuation?.finish()
        audioContinuation = nil
        _audioStream = nil
        
        // Deactivate audio session
        do {
            try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("⚠️ Failed to deactivate audio session: \(error)")
        }
        
        isCapturing = false
        currentAudioLevel = 0.0
        
        print("🛑 Audio capture stopped")
    }
    
    // MARK: - Setup
    private func configureAudioSession() throws {
        // Configure for recording with playback capability
        try audioSession.setCategory(
            .playAndRecord,
            mode: .default,
            options: [.defaultToSpeaker, .allowBluetooth]
        )
        
        // Set preferred sample rate
        try audioSession.setPreferredSampleRate(targetSampleRate)
        
        // Activate session
        try audioSession.setActive(true)
    }
    
    private func setupAudioEngine() throws {
        audioEngine = AVAudioEngine()
        guard let engine = audioEngine else {
            throw TranslationError.audioCaptureFailed(NSError(domain: "AudioCapture", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to create audio engine"]))
        }
        
        // Get input node
        let inputNode = engine.inputNode
        let hardwareFormat = inputNode.outputFormat(forBus: 0)
        
        print("📊 Hardware format: \(hardwareFormat.sampleRate)Hz, \(hardwareFormat.channelCount) channels")
        
        // Create format converter if needed
        guard let targetFormat = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: targetSampleRate,
            channels: 1,
            interleaved: false
        ) else {
            throw TranslationError.invalidAudioFormat
        }
        
        // Install tap on input node
        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: hardwareFormat) { [weak self] buffer, time in
            self?.processAudioBuffer(buffer, time: time, targetFormat: targetFormat)
        }
    }
    
    // MARK: - Audio Processing
    private func processAudioBuffer(_ buffer: AVAudioPCMBuffer, time: AVAudioTime, targetFormat: AVAudioFormat) {
        guard let channelData = buffer.floatChannelData else { return }
        
        // Calculate audio level for UI feedback
        let frameLength = Int(buffer.frameLength)
        var sum: Float = 0
        let channelDataValue = channelData.pointee
        
        for i in 0..<frameLength {
            sum += abs(channelDataValue[i])
        }
        
        let averageLevel = sum / Float(frameLength)
        DispatchQueue.main.async { [weak self] in
            self?.currentAudioLevel = min(averageLevel * 10, 1.0) // Scale for 0-1 range
        }
        
        // Convert to target sample rate if needed
        let audioData = stride(from: 0, to: frameLength, by: 1).map { channelDataValue[$0] }
        
        // Create audio buffer
        let audioBuffer = AudioBuffer(
            data: audioData,
            timestamp: Date(),
            sampleRate: Int(targetSampleRate)
        )
        
        // Yield to async stream
        audioContinuation?.yield(audioBuffer)
    }
    
    // MARK: - Notifications
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }
    
    @objc private func handleInterruption(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }
        
        switch type {
        case .began:
            print("⏸️ Audio interruption began")
            stopCapture()
        case .ended:
            print("▶️ Audio interruption ended")
            if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
                let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
                if options.contains(.shouldResume) {
                    Task {
                        try? await startCapture()
                    }
                }
            }
        @unknown default:
            break
        }
    }
    
    @objc private func handleRouteChange(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }
        
        switch reason {
        case .oldDeviceUnavailable:
            // Headphones unplugged, etc.
            print("🎧 Audio route changed: old device unavailable")
            stopCapture()
        case .newDeviceAvailable:
            // Headphones plugged in, etc.
            print("🎧 Audio route changed: new device available")
        default:
            break
        }
    }
}