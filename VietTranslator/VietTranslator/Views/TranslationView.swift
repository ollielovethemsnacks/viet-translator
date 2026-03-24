//
//  TranslationView.swift
//  VietTranslator
//
//  Main translation interface showing conversation
//

import SwiftUI

struct TranslationView: View {
    @EnvironmentObject var pipeline: TranslationPipeline
    @State private var showingSettings = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Status bar
            StatusBarView(
                isRecording: pipeline.isRunning,
                translationCount: pipeline.translations.count,
                audioLevel: 0.5 // Placeholder - would come from audio service
            )
            .padding(.horizontal)
            .padding(.top, 8)
            
            // Current transcription (live)
            if pipeline.isRunning && !pipeline.currentTranscription.isEmpty {
                CurrentTranscriptionView(text: pipeline.currentTranscription)
                    .padding(.horizontal)
                    .padding(.top, 8)
            }
            
            // Translation list
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(pipeline.translations) { item in
                            TranslationBubble(item: item)
                                .id(item.id)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 16)
                }
                .onChange(of: pipeline.translations.count) { _ in
                    scrollToBottom(proxy: proxy)
                }
                .onChange(of: pipeline.translations.last?.translation.translatedText) { _ in
                    scrollToBottom(proxy: proxy)
                }
            }
            
            // Control bar
            ControlBarView(
                isRecording: pipeline.isRunning,
                onToggle: {
                    toggleRecording()
                }
            )
            .padding()
        }
        .alert(item: $pipeline.currentError) { error in
            Alert(
                title: Text("Error"),
                message: Text(error.errorDescription ?? "Unknown error"),
                dismissButton: .default(Text("OK"))
            )
        }
    }
    
    private func scrollToBottom(proxy: ScrollViewProxy) {
        if let lastId = pipeline.translations.last?.id {
            withAnimation(.easeOut(duration: 0.2)) {
                proxy.scrollTo(lastId, anchor: .bottom)
            }
        }
    }
    
    private func toggleRecording() {
        if pipeline.isRunning {
            pipeline.stop()
        } else {
            Task {
                await pipeline.start()
            }
        }
    }
}

struct StatusBarView: View {
    let isRecording: Bool
    let translationCount: Int
    let audioLevel: Float
    
    var body: some View {
        HStack {
            // Recording indicator
            HStack(spacing: 8) {
                Circle()
                    .fill(isRecording ? Color.red : Color.gray)
                    .frame(width: 8, height: 8)
                    .overlay(
                        Circle()
                            .stroke(isRecording ? Color.red.opacity(0.3) : Color.clear, lineWidth: 4)
                            .scaleEffect(isRecording ? 1.5 : 1.0)
                            .opacity(isRecording ? 0.0 : 1.0)
                            .animation(isRecording ? Animation.easeOut(duration: 1.0).repeatForever(autoreverses: false) : .default, value: isRecording)
                    )
                
                Text(isRecording ? "Listening..." : "Ready")
                    .font(.caption)
                    .fontWeight(isRecording ? .semibold : .regular)
                    .foregroundColor(isRecording ? .red : .secondary)
            }
            
            Spacer()
            
            // Translation count
            if translationCount > 0 {
                Text("\(translationCount) translations")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct CurrentTranscriptionView: View {
    let text: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("Hearing...")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.orange)
                
                Spacer()
                
                // Pulsing indicator
                HStack(spacing: 2) {
                    ForEach(0..<3) { i in
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 4, height: 4)
                            .opacity(0.4 + 0.6 * sin(Double(i) * 0.5 + Date().timeIntervalSince1970 * 3))
                    }
                }
            }
            
            Text(text)
                .font(.body)
                .foregroundColor(.primary)
                .lineLimit(2)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.orange.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.orange.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

struct TranslationBubble: View {
    let item: TranslationItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Speaker indicator
            HStack(spacing: 8) {
                Circle()
                    .fill(item.speakerColor)
                    .frame(width: 10, height: 10)
                
                Text("Speaker \(item.transcription.speakerId ?? 0 + 1)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(item.speakerColor)
                
                Spacer()
                
                if item.transcription.isPartial {
                    Text("typing...")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .italic()
                }
                
                Text(formatTime(item.transcription.timestamp))
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            // Original text (Vietnamese)
            Text(item.transcription.text)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .italic()
                .lineLimit(nil)
            
            Divider()
                .background(item.speakerColor.opacity(0.2))
            
            // Translated text (English)
            Text(item.translation.translatedText)
                .font(.body)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .lineLimit(nil)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.08), radius: 3, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(item.speakerColor.opacity(0.25), lineWidth: 2)
        )
        .opacity(item.transcription.isPartial ? 0.7 : 1.0)
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

struct ControlBarView: View {
    let isRecording: Bool
    let onToggle: () -> Void
    
    var body: some View {
        HStack {
            Spacer()
            
            Button(action: onToggle) {
                ZStack {
                    Circle()
                        .fill(isRecording ? Color.red : Color.blue)
                        .frame(width: 80, height: 80)
                        .shadow(color: (isRecording ? Color.red : Color.blue).opacity(0.4), radius: 8, x: 0, y: 4)
                    
                    Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .scaleEffect(isRecording ? 1.05 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: isRecording)
            
            Spacer()
        }
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color(.systemGray6))
        )
    }
}

struct TranslationView_Previews: PreviewProvider {
    static var previews: some View {
        TranslationView()
            .environmentObject(TranslationPipeline())
    }
}