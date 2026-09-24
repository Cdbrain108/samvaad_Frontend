/**
 * Device capability detection.
 *
 * Every 3D surface in the app (temple canvas, scripture book, sadhu avatar)
 * needs the same three answers: is this a phone, how many pixels should we
 * actually render, and can we afford antialiasing. Centralised here so the
 * call sites can't drift apart.
 */

const query = (q) => typeof window !== 'undefined' && window.matchMedia?.(q).matches === true;

// Coarse pointer with no hover is a far better "touch device" signal than
// sniffing the user agent, which lies constantly.
export const isTouchDevice = () => query('(any-pointer: coarse)') && query('(any-hover: none)');

export const isSmallScreen = () => query('(max-width: 900px)');

export const isMobile = () => isTouchDevice() || isSmallScreen();

// iOS needs its own branch for the audio-unlock path. iPadOS 13+ reports
// itself as a Mac, so the touch-point check is what catches modern iPads.
export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
};

/** Rough "this device is weak" signal: few cores or little memory. */
export const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  return cores <= 4 || memory <= 4;
};

export const prefersReducedMotion = () => query('(prefers-reduced-motion: reduce)');

/**
 * Pixel-ratio ceiling for a render surface.
 *
 * Phones ship DPR 3 (iPhone) and 3.5+ (many Androids). Rendering a WebGL scene
 * at native DPR means roughly 9x the fragments of a 1x surface, which is where
 * the heat and the dropped frames come from. 1.5 looks close to native on a
 * small screen for about a quarter of the work.
 */
export const getMaxPixelRatio = () => {
  const native = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  if (isLowPowerDevice()) return Math.min(native, 1.25);
  if (isMobile()) return Math.min(native, 1.5);
  return Math.min(native, 2);
};

/** MSAA is the first thing to drop on a phone — it costs more than it shows. */
export const shouldAntialias = () => !isMobile() && !isLowPowerDevice();

/**
 * 'high-performance' asks the OS for the discrete / high-clock GPU. On a laptop
 * that is effectively free; on a phone it just burns battery for a scene that
 * does not need it. 'default' lets the device decide.
 */
export const getPowerPreference = () => (isMobile() ? 'default' : 'high-performance');
