# Quick Start Guide: Using PhoWhisper Offline Speech Recognition

## Getting Started with Offline Vietnamese Speech Recognition

### Step 1: Open the App
Navigate to `http://localhost:3000` in your web browser.

### Step 2: Grant Microphone Permissions
When prompted, allow the app to access your microphone. This is required for speech recognition.

### Step 3: Default Online Mode (No Setup Required)
The app starts in **Online Mode** using the Web Speech API:
- ✅ Works immediately without download
- ✅ Fast response time
- ❌ Requires internet connection
- ❌ Limited to browser's supported languages

**To use:**
1. Tap the blue microphone button
2. Speak Vietnamese text
3. See English translation appear instantly

### Step 4: Enable Offline Mode (Recommended)

#### A. Download the PhoWhisper Model
1. Tap the **Settings gear icon** (top right)
2. Find the "PhoWhisper Model" section
3. Tap **"Download Model"**
4. Wait for the download to complete (~74MB, 30-120 seconds)
5. A green checkmark will appear when done

#### B. Activate Offline Mode
1. In Settings, toggle **"Offline Mode"** to ON
2. Tap **"Back"** to return to the main screen
3. You'll see an **"OFFLINE" badge** in the header
4. Tap the microphone and start speaking Vietnamese!

### Step 5: Test Offline Functionality

**Quick Test:**
1. Start with simple Vietnamese phrases:
   - "Xin chào" (Hello)
   - "Cảm ơn" (Thank you)
   - "Tôi tên là..." (My name is...)
2. Watch the live translation appear
3. Verify accuracy and timing

### Understanding the Interface

#### Main Screen
- **Blue Mic Button**: Tap to start/stop listening
- **Red Pulsing Dot**: Indicates active listening
- **"Hearing:" Text**: Shows what the system hears in Vietnamese
- **Bold Text**: Shows English translation
- **Translation Bubbles**: History of conversations

#### Settings Screen
- **Offline Mode Toggle**: Switch between online/offline
- **Model Download Status**: Check if model is ready
- **Storage Info**: View available device storage
- **About PhoWhisper**: Learn about the technology

### Mode Comparison

| Feature | Online Mode | Offline Mode |
|---------|-------------|--------------|
| **Speed** | ⚡ Very fast | 🐢 Moderate |
| **Internet** | ✅ Required | ❌ Not required |
| **Setup** | ✅ None needed | ⏳ 74MB download |
| **Accuracy** | 📊 Good | 📊 Excellent (Vietnamese) |
| **Privacy** | 📡 Data goes to servers | 🔒 100% local |
| **Latency** | ~1 second | ~2-3 seconds |

### Tips for Best Results

#### Audio Quality
- 🎤 Speak clearly and at normal volume
- 🏠 Minimize background noise
- 📱 Hold phone 6-12 inches from mouth
- 🎧 Use headset for best audio input

#### Vietnamese Pronunciation
- 🗣️ Speak at a natural pace (not too fast)
- 📖 Use common phrases and vocabulary
- 🔊 Enunciate clearly, especially tones
- ⏸️ Pause briefly between sentences

#### Performance
- 🌐 For best accuracy, use offline mode
- 📦 Ensure model is fully downloaded
- 💾 Keep sufficient device storage free
- 🔄 Restart app if issues occur

### Troubleshooting

#### "Microphone access denied"
- Go to browser settings
- Allow microphone permissions
- Refresh the page

#### "Model download failed"
- Check internet connection
- Ensure sufficient storage (100MB+)
- Clear browser cache and retry

#### "Transcription not working"
- Verify offline mode is activated
- Check browser console for errors
- Try refreshing the page
- Test with online mode first

#### "Slow transcription"
- First run: Model still initializing
- Check device performance
- Close other browser tabs
- Try simpler phrases

### Advanced Features

#### Real-time Feedback
While listening, you'll see:
1. **"Hearing:"** - What the system hears (interim)
2. **Bold translation** - English translation
3. **Continuous updates** - Results update as you speak

#### Conversation History
- Each translation is saved as a bubble
- Color-coded by speaker
- Tap "Speak" button to hear English pronunciation
- Scroll through full conversation

#### Mode Switching
You can switch between modes anytime:
- **Settings → Toggle Offline Mode**
- App remembers your preference
- Changes take effect immediately

### Performance Optimization

#### First-Time Setup
- Allow 1-2 minutes for model download
- Keep browser open during download
- Don't interrupt the download process

#### Ongoing Performance
- Model persists in browser cache
- No re-download needed (unless cleared)
- Works offline indefinitely after download

#### Mobile Devices
- For iOS: Use Safari browser (best support)
- For Android: Chrome or Firefox recommended
- Close unused apps to free memory
- Keep device charged during long sessions

### Privacy & Security

#### Offline Mode
- ✅ 100% private - no data leaves your device
- ✅ No server communication
- ✅ Works without internet
- ✅ No recording or storage of your voice

#### Online Mode
- ⚠️ Audio sent to browser's speech service
- ⚠️ Requires internet connection
- ⚠️ Subject to browser's privacy policy

### System Requirements

#### Minimum Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Memory**: 2GB RAM minimum (4GB+ recommended)
- **Storage**: 200MB free space
- **Internet**: For model download (not for offline mode)

#### Recommended Setup
- **Browser**: Chrome 100+ or Safari 15+
- **Memory**: 4GB+ RAM
- **Storage**: 500MB+ free space
- **Device**: Modern smartphone or computer

### Support & Feedback

#### Getting Help
- Check the troubleshooting section above
- View browser console for error details
- Ensure all prerequisites are met

#### Known Limitations
- First use requires model download (~74MB)
- Slower than online mode initially
- Requires modern browser with Web Audio API support
- May be slower on older devices

### Summary

**You're now ready to use:**

✅ **Online Mode**: Immediate use, fast response
✅ **Offline Mode**: Vietnamese-optimized, works anywhere
✅ **Real-time Translation**: Instant Vietnamese-to-English
✅ **Privacy**: Your data stays on your device (offline mode)
✅ **No Internet Needed**: After model download

**Enjoy seamless Vietnamese-English conversations with your family!** 🎉