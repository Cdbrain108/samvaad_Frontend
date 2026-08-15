import { detectSpeechLanguage, prepareTextForSpeech } from '../utils/speechText';

/**
 * Provider boundary for future server TTS. This free default deliberately keeps
 * speech synthesis in the browser, so no credentials are shipped to GitHub Pages.
 */
export async function generateSpeech(text, { language = 'auto' } = {}) {
  const preparedText = prepareTextForSpeech(text);
  if (!preparedText) throw new Error('No speech text available');

  return {
    provider: 'browser-speech',
    text: preparedText,
    language: language === 'auto' ? detectSpeechLanguage(preparedText) : language,
  };
}
