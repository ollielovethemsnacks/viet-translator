/**
 * Helper function to detect iOS devices
 * @returns True if the device is an iOS device, false otherwise
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