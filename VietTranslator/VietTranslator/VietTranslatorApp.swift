//
//  VietTranslatorApp.swift
//  VietTranslator
//
//  Real-time Vietnamese to English translator
//  100% offline, privacy-first
//

import SwiftUI

@main
struct VietTranslatorApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(TranslationPipeline())
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Configure audio session
        AudioSessionManager.shared.configure()
        return true
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        // Optionally unload models to free memory
        // ModelManager.shared.unloadModels()
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        // Reload models if needed
        // ModelManager.shared.loadModels()
    }
}
