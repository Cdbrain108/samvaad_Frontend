import React from 'react';

/**
 * Formats a Firebase/JavaScript timestamp into a readable HH:MM string.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Renders inline **bold** and `code` spans inside text.
 */
export function renderInline(text, keyPrefix) {
  if (!text) return null;
  // Clean any leading markdown heading hashes that might slip into inline text
  const cleanText = typeof text === 'string' ? text.replace(/^#{1,4}\s+/, '') : text;
  const nodes = [];
  const parts = String(cleanText).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, index) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      nodes.push(<code key={`${keyPrefix}-c${index}`} className="inline-code">{part.slice(1, -1)}</code>);
    } else {
      nodes.push(part);
    }
  });
  return nodes;
}

/**
 * Intelligent semantic paragraph segmenter:
 * Splits dense AI discourse only at natural thematic transitions
 * (Solace -> Root Cause -> Perspective Shift -> Verse -> Practice -> Citations).
 */
export function intelligentSegmentResponse(text) {
  if (!text || typeof text !== 'string') return text;

  let processed = text.replace(/\r\n/g, '\n');

  // Strip newlines immediately preceding punctuation
  processed = processed.replace(/\n\s*([.,;!?।])/g, '$1');

  // Collapse soft single newlines within narrative prose
  processed = processed.replace(/([^\n])\n(?!\n|#{1,4}\s|[•\-*]\s|\d+[.)]\s|[«📖─\-]|\*\*[«📖]|(?:\*\*|\*)*(?:Meaning|अर्थात्|भावार्थ))/g, '$1 ');

  // Separate horizontal rules and supporting references
  processed = processed.replace(/\s*(?:---|───|\*\*\*)\s*(?=📖|\*\*📖|$)/g, '\n\n---\n\n');
  processed = processed.replace(/\s*(📖\s*(?:\*\*)?(?:Supporting Scriptural References|पूरक शास्त्र प्रमाण)[^\n]*)/gi, '\n\n$1\n\n');

  // Separate inline bullets in supporting section
  processed = processed.replace(/([.!?।»])\s*[•\-]\s*(?=[«\*\u0900-\u097F[A-Z])/g, '$1\n\n• ');

  // Separate inline numbered points
  processed = processed.replace(/([.!?।»”"])\s+(\d{1,2}[.)]\s+)(?=[A-Z*«"“(\u0900-\u097F])/g, '$1\n$2');

  // Shloka quotation isolation
  processed = processed.replace(/([.!?।])\s*(?=\*?\*?«)/g, '$1\n\n');
  processed = processed.replace(/(»\*?\*?)\s*(?=(?:\*\*?Meaning|\*\*?अर्थात्|\*\*?भावार्थ|Meaning —|अर्थात् —))/gi, '$1\n');

  // After shloka meaning quote, isolate next practice section
  processed = processed.replace(/(["”»])\s+(?=(?:For your daily practice|As a daily practice|Daily practice|For daily contemplation|Each morning|Throughout the day|दैनिक साधना|प्रतिदिन|सुबह|साधना अभ्यास)[\s:,])/gi, '$1\n\n');

  // Natural sequence transitions
  processed = processed.replace(/([.!?।]["”]?)\s+(?=(?:The root of your distress|The root cause of|The divine wisdom teaches|The essence of true freedom|इस पीड़ा का मूल कारण|कष्ट का मूल कारण|शास्त्रों का मर्म यह है कि)[\sA-Za-z\u0900-\u097F])/g, '$1\n\n');
  processed = processed.replace(/([.!?।]["”]?)\s+(?=(?:By shifting your focus|Shifting your focus from|जब आप अपने दृष्टिकोण को बदलते हैं)[\sA-Za-z\u0900-\u097F])/g, '$1\n\n');
  processed = processed.replace(/([.!?।]["”]?)\s+(?=(?:Remember,\s*(?:child|my child)|Let the Holy Name|May the blessings|याद रखो बच्चा|निरंतर नाम जप|श्री राधा नाम)[\sA-Za-z\u0900-\u097F])/g, '$1\n\n');

  // Safety balance: Split paragraphs longer than 3 sentences and > 220 chars
  const rawParas = processed.split('\n\n');
  const balanced = [];
  for (const para of rawParas) {
    const trimmed = para.trim();
    if (!trimmed || trimmed.startsWith('«') || trimmed.startsWith('**«') || trimmed.startsWith('•') || trimmed.startsWith('---') || trimmed.startsWith('📖') || trimmed.startsWith('Meaning') || trimmed.startsWith('**Meaning')) {
      balanced.push(trimmed);
      continue;
    }
    const sentences = trimmed.match(/[^.!?।]+[.!?।]+(?:["”']|\s+|$)/g) || [trimmed];
    if (sentences.length >= 4 && trimmed.length > 220) {
      let chunk = '';
      let sCount = 0;
      for (const s of sentences) {
        chunk += s;
        sCount++;
        if (sCount >= 2 && chunk.length > 120) {
          balanced.push(chunk.trim());
          chunk = '';
          sCount = 0;
        }
      }
      if (chunk.trim()) balanced.push(chunk.trim());
    } else {
      balanced.push(trimmed);
    }
  }

  return balanced.join('\n\n').trim();
}
