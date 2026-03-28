/**
 * iOS Audio Helper
 * Handles iOS-specific audio context issues
 */

/**
 * Ensures audio context is properly resumed on iOS devices
 * iOS often suspends audio context and requires user interaction to resume
 */
export async function resumeAudioContextIfNeeded(): Promise<void> {
  if (!isIOS()) {
    return;
  }

  // Check if we have an audio context that might be suspended
  if (typeof window !== 'undefined' && window.AudioContext) {
    // Look for any existing audio context
    const existingContext: AudioContext | null = (window as any).audioContext || (window as any).webkitAudioContext;
    
    if (existingContext && existingContext.state === 'suspended') {
      try {
        await existingContext.resume();
        console.log('Audio context resumed on iOS');
      } catch (error) {
        console.warn('Could not resume audio context:', error);
      }
    }
  }
}

/**
 * Check if the current device is iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMacintosh = /Macintosh/.test(userAgent);
  const hasTouch = navigator.maxTouchPoints ? navigator.maxTouchPoints > 1 : false;

  return isIosDevice || (isMacintosh && hasTouch);
}

/**
 * Request microphone access with iOS-friendly options
 */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // On iOS, we avoid specifying sampleRate to prevent issues
        ...(isIOS() ? {} : { sampleRate: 16000 })
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error('Error requesting microphone access:', error);
    throw error;
  }
}

/**
 * Initialize audio context with iOS compatibility
 */
export function createAudioContext(): AudioContext {
  const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
  const context = new AudioContextConstructor();

  // On iOS, we need to resume the context after a user interaction
  if (isIOS()) {
    const handleUserInteraction = () => {
      if (context.state === 'suspended') {
        context.resume().catch(e => console.warn('Could not resume audio context:', e));
      }
      // Remove the listeners after first successful interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);
  }

  return context;
}