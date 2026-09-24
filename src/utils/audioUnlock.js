/**
 * iOS audio unlocking.
 *
 * Safari on iOS only lets audio start inside the synchronous turn of a real
 * user gesture. The speech path cannot satisfy that on its own: it awaits a TTS
 * fetch that takes seconds, and by the time the blob comes back the gesture is
 * long gone, so play() rejects with NotAllowedError.
 *
 * The fix is to unlock one <audio> element up front during a genuine tap, then
 * reuse that same element for every later playback. An element that has played
 * once stays playable, so swapping its src afterwards is allowed.
 */

let sharedAudio = null;
let audioContext = null;
let unlocked = false;

// A few milliseconds of silence — enough for Safari to mark the element played.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

/** The shared element. Playback should go through this, never `new Audio()`. */
export function getSharedAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    // Without these, iOS hijacks playback into its native fullscreen player.
    sharedAudio.playsInline = true;
    sharedAudio.setAttribute('playsinline', '');
    sharedAudio.setAttribute('webkit-playsinline', '');
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

export const isAudioUnlocked = () => unlocked;

/**
 * Call from inside a user-gesture handler (click / touch), before any await.
 * Safe to call repeatedly — it no-ops once unlocked.
 */
export async function unlockAudio() {
  if (unlocked) return true;

  const audio = getSharedAudio();
  try {
    audio.src = SILENT_WAV;
    audio.muted = true;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    unlocked = true;
  } catch {
    // Not fatal — the gesture may not have been trusted. Retry on the next one.
  }

  // The WebAudio graph has its own suspended state, independent of the element.
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      if (!audioContext) audioContext = new Ctx();
      if (audioContext.state === 'suspended') await audioContext.resume();
    }
  } catch {
    // WebAudio is optional here; element playback is what actually matters.
  }

  return unlocked;
}

/**
 * Play a URL through the already-unlocked element. Resolves false rather than
 * throwing when the browser refuses, so callers can fall back to speechSynthesis.
 */
export async function playUnlocked(src, handlers = {}) {
  const { volume = 1, playbackRate = 1, onPlay, onEnded, onError, onLoadedMetadata } = handlers;
  const audio = getSharedAudio();

  audio.onplay = onPlay || null;
  audio.onended = onEnded || null;
  audio.onerror = onError || null;
  audio.onloadedmetadata = onLoadedMetadata || null;

  audio.volume = volume;
  audio.playbackRate = playbackRate;
  audio.src = src;

  try {
    await audio.play();
    return true;
  } catch (err) {
    console.warn('[audio] Playback refused by the browser:', err?.name || err);
    return false;
  }
}

/** Detach handlers and rewind, without discarding the unlocked element. */
export function stopShared() {
  if (!sharedAudio) return;
  sharedAudio.onplay = null;
  sharedAudio.onended = null;
  sharedAudio.onerror = null;
  sharedAudio.onloadedmetadata = null;
  sharedAudio.pause();
  try {
    sharedAudio.currentTime = 0;
  } catch {
    // Safari throws if no media is loaded; harmless.
  }
}
