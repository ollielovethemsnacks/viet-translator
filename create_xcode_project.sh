#!/bin/bash

# Create a proper Xcode project for Viet Translator

cd /home/johnny/.openclaw/agency-agents/workspace/viet-translator

# Create the project.pbxproj file
mkdir -p "VietTranslator.xcodeproj"

cat > "VietTranslator.xcodeproj/project.pbxproj" << 'PROJECTFILE'
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		AA000001 /* VietTranslatorApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000000 /* VietTranslatorApp.swift */; };
		AA000003 /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000002 /* ContentView.swift */; };
		AA000005 /* TranslationModels.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000004 /* TranslationModels.swift */; };
		AA000007 /* TranslationView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000006 /* TranslationView.swift */; };
		AA000009 /* SettingsView.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000008 /* SettingsView.swift */; };
		AA00000B /* AudioCaptureService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA00000A /* AudioCaptureService.swift */; };
		AA00000D /* SpeechRecognitionService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA00000C /* SpeechRecognitionService.swift */; };
		AA00000F /* TranslationService.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA00000E /* TranslationService.swift */; };
		AA000011 /* TranslationPipeline.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000010 /* TranslationPipeline.swift */; };
		AA000013 /* AudioSessionManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = AA000012 /* AudioSessionManager.swift */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		AA000000 /* VietTranslatorApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = VietTranslatorApp.swift; sourceTree = "<group>"; };
		AA000001 /* VietTranslator.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = VietTranslator.app; sourceTree = BUILT_PRODUCTS_DIR; };
		AA000002 /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ContentView.swift; sourceTree = "<group>"; };
		AA000004 /* TranslationModels.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TranslationModels.swift; sourceTree = "<group>"; };
		AA000006 /* TranslationView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TranslationView.swift; sourceTree = "<group>"; };
		AA000008 /* SettingsView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SettingsView.swift; sourceTree = "<group>"; };
		AA00000A /* AudioCaptureService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = AudioCaptureService.swift; sourceTree = "<group>"; };
		AA00000C /* SpeechRecognitionService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SpeechRecognitionService.swift; sourceTree = "<group>"; };
		AA00000E /* TranslationService.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TranslationService.swift; sourceTree = "<group>"; };
		AA000010 /* TranslationPipeline.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TranslationPipeline.swift; sourceTree = "<group>"; };
		AA000012 /* AudioSessionManager.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = AudioSessionManager.swift; sourceTree = "<group>"; };
		AA000014 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		AA000015 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		AA000016 = {
			isa = PBXGroup;
			children = (
				AA000017 /* VietTranslator */,
				AA000018 /* Products */,
			);
			sourceTree = "<group>";
		};
		AA000017 /* VietTranslator */ = {
			isa = PBXGroup;
			children = (
				AA000000 /* VietTranslatorApp.swift */,
				AA000002 /* ContentView.swift */,
				AA000019 /* Models */,
				AA00001A /* Views */,
				AA00001B /* Services */,
				AA000014 /* Info.plist */,
			);
			path = VietTranslator;
			sourceTree = "<group>";
		};
		AA000018 /* Products */ = {
			isa = PBXGroup;
			children = (
				AA000001 /* VietTranslator.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
		AA000019 /* Models */ = {
			isa = PBXGroup;
			children = (
				AA000004 /* TranslationModels.swift */,
			);
			path = Models;
			sourceTree = "<group>";
		};
		AA00001A /* Views */ = {
			isa = PBXGroup;
			children = (
				AA000006 /* TranslationView.swift */,
				AA000008 /* SettingsView.swift */,
			);
			path = Views;
			sourceTree = "<group>";
		};
		AA00001B /* Services */ = {
			isa = PBXGroup;
			children = (
				AA00000A /* AudioCaptureService.swift */,
				AA00000C /* SpeechRecognitionService.swift */,
				AA00000E /* TranslationService.swift */,
				AA000010 /* TranslationPipeline.swift */,
				AA000012 /* AudioSessionManager.swift */,
			);
			path = Services;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		AA00001C /* VietTranslator */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = AA00001D /* Build configuration list for PBXNativeTarget "VietTranslator" */;
			buildPhases = (
				AA00001E /* Sources */,
				AA000015 /* Frameworks */,
				AA00001F /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = VietTranslator;
			productName = VietTranslator;
			productReference = AA000001 /* VietTranslator.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		AA000020 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					AA00001C = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = AA000021 /* Build configuration list for PBXProject "VietTranslator" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = AA000016;
			productRefGroup = AA000018 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				AA00001C /* VietTranslator */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		AA00001F /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		AA00001E /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				AA000001 /* VietTranslatorApp.swift in Sources */,
				AA000003 /* ContentView.swift in Sources */,
				AA000005 /* TranslationModels.swift in Sources */,
				AA000007