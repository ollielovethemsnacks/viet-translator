//
//  ContentView.swift
//  VietTranslator
//
//  Main content view with translation interface
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var pipeline: TranslationPipeline
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            TranslationView()
                .navigationTitle("Viet Translator")
                .navigationBarTitleDisplayMode(.large)
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: { showingSettings = true }) {
                            Image(systemName: "gear")
                        }
                    }
                }
                .sheet(isPresented: $showingSettings) {
                    SettingsView()
                }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(TranslationPipeline())
    }
}
