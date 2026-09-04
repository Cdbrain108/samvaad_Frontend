import { detectSpeechLanguage, prepareTextForSpeech } from '../utils/speechText';

const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const getVoiceCloneUrl = () => {
  if (typeof window !== 'undefined') {
    return (window.VOICE_CLONE_URL || localStorage.getItem('guru_voice_clone_url') || import.meta.env.VITE_VOICE_CLONE_URL || '').replace(/\/$/, '');
  }
  return (import.meta.env.VITE_VOICE_CLONE_URL || '').replace(/\/$/, '');
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

  // Priority 1: Custom Chatterbox Voice Cloning Server (Google Colab / GPU Tunnel with guru_voice_profile.pt)
  const cloneServer = getVoiceCloneUrl();
  if (cloneServer) {
    try {
      const cloneController = new AbortController();
      const cloneTimeout = setTimeout(() => cloneController.abort(), 25000);
      const cloneRes = await fetch(`${cloneServer}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preparedText }),
        signal: cloneController.signal,
      });
      clearTimeout(cloneTimeout);
      if (cloneRes.ok) {
        const blob = await cloneRes.blob();
        const audioUrl = URL.createObjectURL(blob);
        console.log('[Voice Clone TTS] Successfully fetched Chatterbox cloned audio blob from GPU!');
        return {
          provider: 'backend-neural',
          audioUrl,
          text: preparedText,
          language: language === 'auto' ? detectSpeechLanguage(preparedText) : language,
        };
      }
    } catch (e) {
      console.warn('[Voice Clone TTS] Custom GPU clone endpoint unreachable, using neural engine:', e);
    }
  }

  // Priority 2: Backend Neural TTS with acoustic softening
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

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
  };
}
