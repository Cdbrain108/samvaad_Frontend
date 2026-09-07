import { detectSpeechLanguage, prepareTextForSpeech } from '../utils/speechText';

const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const LIVE_ORACLE_VOICE_URL = (typeof import.meta !== 'undefined' && import.meta.env.VITE_VOICE_CLONE_URL) || 'https://voice-ai-guru.example.com';

export const getVoiceCloneUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = (localStorage.getItem('guru_voice_clone_url') || '').trim();
    if (custom) return custom.replace(/\/$/, '');
    const winUrl = (window.VOICE_CLONE_URL || '').trim();
    if (winUrl) return winUrl.replace(/\/$/, '');
    const envUrl = (import.meta.env.VITE_VOICE_CLONE_URL || '').trim();
    if (envUrl) return envUrl.replace(/\/$/, '');
    return LIVE_ORACLE_VOICE_URL;
  }
  return (import.meta.env.VITE_VOICE_CLONE_URL || LIVE_ORACLE_VOICE_URL).replace(/\/$/, '');
};



export const setVoiceCloneUrl = (url) => {
  const clean = (url || '').trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    if (clean) {
      localStorage.setItem('guru_voice_clone_url', clean);
      window.VOICE_CLONE_URL = clean;
    } else {
      localStorage.removeItem('guru_voice_clone_url');
      delete window.VOICE_CLONE_URL;
    }
  }
  return clean;
};

export const testVoiceCloneUrl = async (url) => {
  const clean = (url || '').trim().replace(/\/$/, '');
  if (!clean) return { ok: false, error: 'Empty URL' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${clean}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message || 'Could not connect' };
  }
};

/**
 * High-Fidelity Guru Speech Synthesis Service:
 * 1. Tries authentic Chatterbox Voice Cloning server (if running in Colab/GPU tunnel).
 * 2. Tries the high-fidelity Neural Guru Audio endpoint at /api/tts/generate
 * 3. Gracefully falls back to browser speech synthesis.
 */
export async function generateSpeech(text, { language = 'auto', speed = 1 } = {}) {
  const preparedText = prepareTextForSpeech(text);
  if (!preparedText) throw new Error('No speech text available');

  // Priority 1: Custom Chatterbox Voice Cloning Server (Oracle Cloud with guru_voice_profile.pt)
  const cloneServer = getVoiceCloneUrl();
  if (cloneServer) {
    try {
      // For authentic neural voice cloning on CPU, focus on first 2 core sentences (~200 chars) to finish in ~25-30s without timing out
      const cloneText = preparedText.length > 220
        ? (preparedText.split(/(?<=[।!?.\n])\s+/).slice(0, 2).join(' ').trim() || preparedText.slice(0, 200))
        : preparedText;

      const cloneController = new AbortController();
      const cloneTimeout = setTimeout(() => cloneController.abort(), 18000);
      const cloneRes = await fetch(`${cloneServer}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cloneText,
          speed: speed || 1.0,
          full_vocal: true,
        }),
        signal: cloneController.signal,
      });
      clearTimeout(cloneTimeout);
      if (cloneRes.ok) {
        const blob = await cloneRes.blob();
        const audioUrl = URL.createObjectURL(blob);
        console.log('[Voice Clone TTS] Successfully fetched Chatterbox cloned audio blob from Oracle GPU/CPU!');
        return {
          provider: 'backend-neural',
          audioUrl,
          text: cloneText,
          language: language === 'auto' ? detectSpeechLanguage(cloneText) : language,
          isCloned: true,
        };
      }
    } catch (e) {
      console.warn('[Voice Clone TTS] Oracle clone endpoint timed out or failed, using neural engine:', e);
    }
  }

  // Priority 2: Backend Neural Indian Male TTS with acoustic softening (instant ~1.4s response)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const ratePercent = speed !== 1 ? `${Math.round((speed - 1) * 100 - 13)}%` : '-13%';
    const payload = JSON.stringify({
      text: preparedText,
      rate: ratePercent,
      pitch: '-2Hz',
      apply_softener: true,
    });

    let response = null;
    try {
      response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: controller.signal,
      });
    } catch (e) {
      console.warn('[Neural TTS] Proxy fetch threw, trying direct backend URL...');
    }

    if (!response || !response.ok) {
      console.info('[Neural TTS] Proxy returned non-OK or failed, trying direct backend URL:', `${BACKEND_BASE}/api/tts/generate`);
      response = await fetch(`${BACKEND_BASE}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      console.log('[Neural TTS] Successfully fetched backend audio blob, url:', audioUrl);
      return {
        provider: 'backend-neural',
        audioUrl,
        text: preparedText,
        language: language === 'auto' ? detectSpeechLanguage(preparedText) : language,
        isCloned: false,
      };
    } else {
      console.warn('[Neural TTS] Response not OK:', response?.status, await response?.text());
    }
  } catch (err) {
    console.error('[Neural TTS] Fetch threw error:', err);
    console.info('Backend neural TTS unreachable, falling back to browser speech synthesis.');
  }

  // Graceful browser fallback
  return {
    provider: 'browser-speech',
    text: preparedText,
    language: language === 'auto' ? detectSpeechLanguage(preparedText) : language,
    isCloned: false,
  };
}
