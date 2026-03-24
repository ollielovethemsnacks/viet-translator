//
//  SettingsView.swift
//  VietTranslator
//
//  App settings and configuration
//

import SwiftUI

struct SettingsView: View {
    @Environment(\.presentationMode) var presentationMode
    @AppStorage("translationSpeed") private var translationSpeed = 1.0
    @AppStorage("fontSize") private var fontSize = 18.0
    @AppStorage("showOriginalText") private var showOriginalText = true
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Translation")) {
                    Toggle("Show Original Text", isOn: $showOriginalText)
                    
                    VStack(alignment: .leading) {
                        Text("Translation Speed")
                            .font(.subheadline)
                        Slider(value: $translationSpeed, in: 0.5...2.0, step: 0.1) {
                            Text("Speed")
                        } minimumValueLabel: {
                            Text("Accurate")
                                .font(.caption)
                        } maximumValueLabel: {
                            Text("Fast")
                                .font(.caption)
                        }
                    }
                }
                
                Section(header: Text("Display")) {
                    VStack(alignment: .leading) {
                        Text("Font Size: \(Int(fontSize))pt")
                            .font(.subheadline)
                        Slider(value: $fontSize, in: 14...28, step: 2)
                    }
                }
                
                Section(header: Text("Models")) {
                    HStack {
                        Text("Speech Recognition")
                        Spacer()
                        Text("Whisper-small-vi")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Translation")
                        Spacer()
                        Text("NLLB-200")
                            .foregroundColor(.secondary)
                    }
                    
                    Button("Download Models") {
                        // Trigger model download
                    }
                    .disabled(false)
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Text("Viet Translator runs entirely on your device. No audio or data is sent to any server.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
