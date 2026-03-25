#!/bin/bash

mkdir -p VietTranslator.xcodeproj

cat > VietTranslator.xcodeproj/project.pbxproj << 'EOF'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		AA0000000000000000000001 /* VietTranslatorApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000000 /* VietTranslatorApp.swift */; };
		AA0000000000000000000003 /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000002 /* ContentView.swift */; };
		AA0000000000000000000005 /* TranslationModels.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000004 /* TranslationModels.swift */; };
		AA0000000000000000000007 /* TranslationView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000006 /* TranslationView.swift */; };
		AA0000000000000000000009 /* SettingsView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000008 /* SettingsView.swift */; };
		AA000000000000000000000B /* AudioCaptureService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000000000000000000000A /* AudioCaptureService.swift */; };
		AA000000000000000000000D /* SpeechRecognitionService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000000000000000000000C /* SpeechRecognitionService.swift */; };
		AA000000000000000000000F /* TranslationService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000000000000000000000E /* TranslationService.swift */; };
		AA0000000000000000000011 /* TranslationPipeline.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000010 /* TranslationPipeline.swift */; };
		AA0000000000000000000013 /* AudioSessionManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA0000000000000000000012 /* AudioSessionManager.swift */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		AA0000000000000000000000 /* VietTranslatorApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = VietTranslatorApp.swift; path = VietTranslator/VietTranslatorApp.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000001 /* VietTranslator.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = VietTranslator.app; sourceTree = BUILT_PRODUCTS_DIR; };
		AA0000000000000000000002 /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = ContentView.swift; path = VietTranslator/ContentView.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000004 /* TranslationModels.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = TranslationModels.swift; path = VietTranslator/Models/TranslationModels.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000006 /* TranslationView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = TranslationView.swift; path = VietTranslator/Views/TranslationView.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000008 /* SettingsView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = SettingsView.swift; path = VietTranslator/Views/SettingsView.swift; sourceTree = SOURCE_ROOT; };
		AA000000000000000000000A /* AudioCaptureService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = AudioCaptureService.swift; path = VietTranslator/Services/AudioCaptureService.swift; sourceTree = SOURCE_ROOT; };
		AA000000000000000000000C /* SpeechRecognitionService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = SpeechRecognitionService.swift; path = VietTranslator/Services/SpeechRecognitionService.swift; sourceTree = SOURCE_ROOT; };
		AA000000000000000000000E /* TranslationService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = TranslationService.swift; path = VietTranslator/Services/TranslationService.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000010 /* TranslationPipeline.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = TranslationPipeline.swift; path = VietTranslator/Services/TranslationPipeline.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000012 /* AudioSessionManager.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; name = AudioSessionManager.swift; path = VietTranslator/Services/AudioSessionManager.swift; sourceTree = SOURCE_ROOT; };
		AA0000000000000000000014 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; name = Info.plist; path = VietTranslator/Info.plist; sourceTree = SOURCE_ROOT; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		AA0000000000000000000015 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		AA0000000000000000000016 = {
			isa = PBXGroup;
			children = (
				AA0000000000000000000000 /* VietTranslatorApp.swift */,
				AA0000000000000000000002 /* ContentView.swift */,
				AA0000000000000000000004 /* TranslationModels.swift */,
				AA0000000000000000000006 /* TranslationView.swift */,
				AA0000000000000000000008 /* SettingsView.swift */,
				AA000000000000000000000A /* AudioCaptureService.swift */,
				AA000000000000000000000C /* SpeechRecognitionService.swift */,
				AA000000000000000000000E /* TranslationService.swift */,
				AA0000000000000000000010 /* TranslationPipeline.swift */,
				AA0000000000000000000012 /* AudioSessionManager.swift */,
				AA0000000000000000000014 /* Info.plist */,
			);
			sourceTree = "<group>";
		};
		AA0000000000000000000017 /* Products */ = {
			isa = PBXGroup;
			children = (
				AA0000000000000000000001 /* VietTranslator.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		AA0000000000000000000018 /* VietTranslator */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = AA0000000000000000000019 /* Build configuration list for PBXNativeTarget "VietTranslator" */;
			buildPhases = (
				AA000000000000000000001A /* Sources */,
				AA0000000000000000000015 /* Frameworks */,
				AA000000000000000000001B /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = VietTranslator;
			productName = VietTranslator;
			productReference = AA0000000000000000000001 /* VietTranslator.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		AA000000000000000000001C /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					AA0000000000000000000018 = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = AA000000000000000000001D /* Build configuration list for PBXProject "VietTranslator" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = AA0000000000000000000016;
			productRefGroup = AA0000000000000000000017 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				AA0000000000000000000018 /* VietTranslator */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		AA000000000000000
