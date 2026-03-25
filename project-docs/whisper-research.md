# Whisper Model Research for Viet Translator

## Executive Summary

For **offline Vietnamese speech recognition** on mobile devices, we have two excellent options:

1. **PhoWhisper** - Fine-tuned specifically for Vietnamese (BEST for accuracy)
2. **Whisper.cpp** - General multilingual with various sizes (BEST for flexibility)

---

## Option 1: PhoWhisper (Recommended for Vietnamese)

**What it is:**
- Fine-tuned version of Whisper specifically for Vietnamese
- Trained on 844 hours of Vietnamese audio with diverse accents
- State-of-the-art accuracy for Vietnamese ASR

**Model Sizes:**
- **PhoWhisper-tiny** (~39MB) - Fastest, good accuracy
- **PhoWhisper-base** (~74MB) - Balanced speed/accuracy
- **PhoWhisper-small** (~244MB) - Better accuracy
- **PhoWhisper-medium** (~769MB) - Best accuracy
- **PhoWhisper-large** (~1.5GB) - Ultimate accuracy

**Pros:**
- ✅ Optimized for Vietnamese
- ✅ Understands Vietnamese accents better
- ✅ State-of-the-art accuracy
- ✅ Works offline after download

**Cons:**
- ❌ Larger file sizes
- ❌ Requires WebAssembly setup
- ❌ More complex integration

**Best for:** Your use case (Vietnamese family conversations)

---

## Option 2: Standard Whisper.cpp

**What it is:**
- C++ port of OpenAI's Whisper
- Runs on device via WebAssembly
- Multiple model sizes available

**Model Size Comparison:**

| Model | Size | Memory | Speed | Accuracy | Best For |
|-------|------|--------|-------|----------|----------|
| **tiny** | 75MB | 273MB | Fastest | Basic | Quick tests |
| **base** | 142MB | 500MB | Fast | Good | Mobile apps |
| **small** | 466MB | 1GB | Medium | Better | Balanced |
| **medium** | 1.5GB | 2.6GB | Slow | Excellent | Desktop |
| **large** | 2.9GB | 3.9GB | Slowest | Best | Servers |

**Pros:**
- ✅ Multiple size options
- ✅ Well-documented
- ✅ Active community
- ✅ WebAssembly support

**Cons:**
- ❌ Generic (not optimized for Vietnamese)
- ❌ Larger models need powerful devices
- ❌ Complex setup

---

## Recommendation for Viet Translator

### **Best Choice: PhoWhisper-base or PhoWhisper-small**

**Why:**
1. **Specifically designed for Vietnamese** - Will understand your in-laws better
2. **Reasonable size** - 74MB (base) or 244MB (small)
3. **Excellent accuracy** - State-of-the-art for Vietnamese
4. **Offline capable** - Works without internet after download

### **Implementation Approach:**

**Phase 1: Web Speech API (Current)**
- Keep current implementation
- Works immediately
- Free
- Good enough for MVP

**Phase 2: Add PhoWhisper (Future Enhancement)**
- Download model on first use
- Store in IndexedDB
- Run via WebAssembly
- Fallback to Web Speech if needed

---

## Technical Implementation Notes

### For Web App (Current):

**Challenges:**
1. **WebAssembly** - Need to compile whisper.cpp to WASM
2. **Model Download** - 74-244MB download on first use
3. **Storage** - Need IndexedDB or similar
4. **Performance** - May be slow on older devices

**Alternative: React Native / Native App**
- Better performance
- Direct model access
- Can use Core ML (iOS) or NNAPI (Android)
- More complex development

---

## Cost Analysis

| Approach | Setup Cost | Runtime Cost | Accuracy | Offline |
|----------|-----------|--------------|----------|---------|
| Web Speech API | Free | Free | Good | ❌ |
| PhoWhisper | Free | Free | Excellent | ✅ |
| Whisper API | Free | ~$0.006/min | Excellent | ❌ |
| Google Cloud Speech | Free tier | ~$0.024/min | Excellent | ❌ |

---

## Conclusion

**For your dinner table use case:**

**Short term:** Keep Web Speech API - it's working and good enough

**Long term:** Add PhoWhisper-base (74MB) as optional offline mode
- Download once
- Works offline forever
- Better Vietnamese accuracy
- No internet needed

**Next Steps:**
1. ✅ Use current Web Speech API (working now)
2. 🔄 Plan PhoWhisper integration for v2.0
3. 📱 Consider React Native for ultimate performance

---

*Research completed: March 25, 2025*
