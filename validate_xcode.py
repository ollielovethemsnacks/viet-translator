#!/usr/bin/env python3
"""
Validate and fix Xcode project file
"""

import os
import re
import sys

def validate_pbxproj(filepath):
    """Validate the project.pbxproj file"""
    issues = []
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check for basic structure
    if not content.startswith('// !$*UTF8*$!'):
        issues.append("Missing UTF8 BOM header")
    
    # Check for required sections
    required_sections = [
        'PBXBuildFile',
        'PBXFileReference', 
        'PBXFrameworksBuildPhase',
        'PBXGroup',
        'PBXNativeTarget',
        'PBXProject',
        'PBXResourcesBuildPhase',
        'PBXSourcesBuildPhase',
        'XCBuildConfiguration',
        'XCConfigurationList'
    ]
    
    for section in required_sections:
        if f'/* Begin {section} section */' not in content:
            issues.append(f"Missing section: {section}")
    
    # Check for balanced braces
    open_count = content.count('{')
    close_count = content.count('}')
    if open_count != close_count:
        issues.append(f"Unbalanced braces: {open_count} open, {close_count} close")
    
    # Check for unclosed sections
    for section in required_sections:
        begin = f'/* Begin {section} section */'
        end = f'/* End {section} section */'
        if begin in content and end not in content:
            issues.append(f"Unclosed section: {section}")
    
    # Check for proper file references
    swift_files = [
        'VietTranslatorApp.swift',
        'ContentView.swift',
        'TranslationModels.swift',
        'TranslationView.swift',
        'SettingsView.swift',
        'AudioCaptureService.swift',
        'SpeechRecognitionService.swift',
        'TranslationService.swift',
        'TranslationPipeline.swift',
        'AudioSessionManager.swift'
    ]
    
    for swift_file in swift_files:
        if swift_file not in content:
            issues.append(f"Missing file reference: {swift_file}")
    
    return issues

def fix_pbxproj(filepath):
    """Attempt to fix common issues"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix 1: Ensure proper ending
    if not content.rstrip().endswith('}'):
        content = content.rstrip() + '\n}'
    
    # Fix 2: Ensure UTF8 header
    if not content.startswith('// !$*UTF8*$!'):
        content = '// !$*UTF8*$!\n' + content
    
    # Write fixed content
    with open(filepath, 'w') as f:
        f.write(content)
    
    return True

def main():
    project_path = 'VietTranslator.xcodeproj/project.pbxproj'
    
    if not os.path.exists(project_path):
        print(f"ERROR: {project_path} not found")
        sys.exit(1)
    
    print("Validating Xcode project...")
    issues = validate_pbxproj(project_path)
    
    if issues:
        print(f"\nFound {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
        
        print("\nAttempting to fix...")
        if fix_pbxproj(project_path):
            print("Applied basic fixes")
            
            # Re-validate
            issues = validate_pbxproj(project_path)
            if issues:
                print(f"\nRemaining issues ({len(issues)}):")
                for issue in issues:
                    print(f"  - {issue}")
            else:
                print("\nAll issues resolved!")
    else:
        print("No issues found - project looks valid")

if __name__ == '__main__':
    main()
