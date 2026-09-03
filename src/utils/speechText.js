export function prepareTextForSpeech(answer = '') {
  return answer
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/^\s*[-•*]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[🙏✨🌸]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{2,}/g, '. ')
    .trim();
}

export function detectSpeechLanguage(text = '') {
  return /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
}

export function splitSpeechText(text, maxLength = 320) {
  const sentences = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text];
  const chunks = [];
  let chunk = '';

  sentences.forEach((sentence) => {
    if ((chunk + sentence).length > maxLength && chunk) {
      chunks.push(chunk.trim());
      chunk = sentence;
    } else {
      chunk += sentence;
    }
  });
  if (chunk.trim()) chunks.push(chunk.trim());
  return chunks;
}
