// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "VietTranslator",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "VietTranslator",
            targets: ["VietTranslator"]),
    ],
    dependencies: [
        // Dependencies will be added when we integrate Whisper and translation models
        // .package(url: "https://github.com/ggerganov/whisper.cpp", from: "1.0.0"),
    ],
    targets: [
        .target(
            name: "VietTranslator",
            dependencies: [],
            path: "VietTranslator",
            exclude: ["Info.plist"],
            swiftSettings: [
                .define("DEBUG", .when(configuration: .debug))
            ]
        ),
        .testTarget(
            name: "VietTranslatorTests",
            dependencies: ["VietTranslator"],
            path: "VietTranslatorTests"
        ),
    ]
)
