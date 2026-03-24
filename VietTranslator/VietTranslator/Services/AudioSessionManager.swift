//
//  AudioSessionManager.swift
//  VietTranslator
//
//  Manages AVAudioSession configuration for recording
//

import AVFoundation
import Combine

class AudioSessionManager: ObservableObject {
    static let shared = AudioSessionManager()
    
    @Published var isConfigured = false
    @Published var permissionStatus: AVAudioSession.RecordPermission = .undetermined
    
    private init() {}
    
    /// Configure the audio session for recording
    func configure() {
        let session = AVAudioSession.sharedInstance()
        
        do {
            // Configure for recording and playback
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
            isConfigured = true
        } catch {
            print("Failed to configure audio session: \(error)")
            isConfigured = false
        }
    }
    
    /// Request microphone permission
    func requestPermission() async -> Bool {
        let session = AVAudioSession.sharedInstance()
        
        switch session.recordPermission {
        case .granted:
            permissionStatus = .granted
            return true
        case .denied:
            permissionStatus = .denied
            return false
        case .undetermined:
            let granted = await session.requestRecordPermission()
            permissionStatus = granted ? .granted : .denied
            return granted
        @unknown default:
            permissionStatus = .denied
            return false
        }
    }
    
    /// Check if microphone permission is granted
    func checkPermission() -> Bool {
        let session = AVAudioSession.sharedInstance()
        permissionStatus = session.recordPermission
        return session.recordPermission == .granted
    }
    
    /// Handle audio session interruptions
    func setupInterruptionHandler() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInterruption),
            name: AVAudioSession.interruptionNotification,
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
            // Interruption began (e.g., phone call)
            print("Audio interruption began")
        case .ended:
            // Interruption ended
            if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
                let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
                if options.contains(.shouldResume) {
                    // Resume recording
                    print("Audio interruption ended, should resume")
                }
            }
        @unknown default:
            break
        }
    }
}
