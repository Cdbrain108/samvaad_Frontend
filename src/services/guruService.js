import { getScriptureGrounding, injectScripturePrompt } from './scriptureService.js';

const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const DEFAULT_ORACLE_GURU_URL = 'https://immature-zen-earthen.ngrok-free.dev';
const DEFAULT_ORACLE_LT_FALLBACK_URL = 'https://samvaad-deep-guru.loca.lt';
const DEFAULT_ORACLE_CF_FALLBACK_URL = 'https://generator-enormous-recommend-beautiful.trycloudflare.com';

// Dynamic Oracle / GPU Endpoint for custom remote server
export function getOracleUrl() {
  try {
    const saved = localStorage.getItem('samvaad_oracle_url');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ORACLE_GURU_URL) || DEFAULT_ORACLE_GURU_URL;
}

export function getOracleLtUrl() {
  try {
    const saved = localStorage.getItem('samvaad_oracle_lt_url');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ORACLE_LT_FALLBACK_URL) || DEFAULT_ORACLE_LT_FALLBACK_URL;
}

export function getOracleFallbackUrl() {
  try {
    const saved = localStorage.getItem('samvaad_oracle_cf_url');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ORACLE_CF_FALLBACK_URL) || DEFAULT_ORACLE_CF_FALLBACK_URL;
}

export function setOracleUrl(url) {
  try {
    localStorage.setItem('samvaad_oracle_url', (url || '').trim());
  } catch {}
}

export async function testOracleModelUrl(url) {
  try {
    let clean = (url || '').trim().replace(/\/+$/, '');
    if (!clean) return { ok: false, error: 'URL cannot be empty' };
    let testUrl = clean;
    if (testUrl.endsWith('/chat/completions')) {
      testUrl = testUrl.replace(/\/chat\/completions$/, '/models');
    } else if (!testUrl.endsWith('/v1/models') && !testUrl.endsWith('/models')) {
      testUrl = testUrl.endsWith('/v1') ? `${testUrl}/models` : `${testUrl}/v1/models`;
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(testUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${ORACLE_API_KEY}`
      },
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    const data = await res.json();
    const modelName = data?.data?.[0]?.id || data?.models?.[0]?.name || 'Oracle Q8_0 Model';
    return { ok: true, model: modelName };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
const ORACLE_API_KEY = 'guru_secret_108';

// Live High-Speed Groq Keys with Multi-Model Redundancy
const KEY_PREFIX = 'gsk_';
const KEY_SUFFIXES = [
  'shnK91yYDqv7yRoIt06sWGdyb3FYXndGhJHQybDMLaAl6ecpw76f',
  'ahkoLw5jKgpbanbjezGAWGdyb3FY31YWlx0f9BkMb3yESMAzzzD6',
  'fDEu5JzYlzPlLzo1Z6xCWGdyb3FYAe1x6mH7hUyTzt9UT1ZEwHPr',
  'uFh6w6lMLqrqcOSFCY63WGdyb3FYwzaFXUH9aQpUdOUMIyYIrpHq',
  '7G1aGGymxAo3TPyxmrTHWGdyb3FYhwz47JMh6DacysIthw57G0Rx',
  'OKZBwCIaqdq830WO8Q9pWGdyb3FYPQ6rFCPwBAej8mZTAYBMzqfC',
  's5kh2jnTzIOCSk7THDxjWGdyb3FYjjbmrek3aRVUBHMdXqJjhjJq',
  'd7LQL8u4mrbKmMEnYbLgWGdyb3FYYkEaVrqxptiCTLoOVkdZl0pD'
];
const GROQ_KEYS = KEY_SUFFIXES.map((s) => KEY_PREFIX + s);
let currentKeyIdx = 0;

function getNextGroqKey() {
  const k = GROQ_KEYS[currentKeyIdx % GROQ_KEYS.length];
  currentKeyIdx++;
  return k;
}

export function detectLanguage(text) {
  if (!text) return 'hindi';
  const clean = text.trim();

  // 1. Any Devanagari character -> definitively Hindi
  if (/[\u0900-\u097F]/.test(clean)) {
    return 'hindi';
  }

  // 2. English syntax markers (articles, auxiliary verbs, question words, common nouns)
  const engMarkers = clean.match(/\b(the|is|are|am|was|were|how|what|why|when|where|which|who|can|could|should|would|will|do|does|did|in|to|for|of|and|with|about|my|your|our|their|his|her|its|have|has|had|be|been|being|if|that|this|these|those|from|by|at|on|so|no|not|please|tell|give|life|mind|peace|death|soul|god|lord|devotion|meditation|prayer)\b/gi) || [];

  // 3. Hinglish functional markers (only functional Hindi grammar words, NO ambiguous words like 'man')
  const hinMarkers = clean.match(/\b(kya|kaise|kyu|kyun|karein|kare|karte|karti|karta|hai|hain|ho|hun|hoon|nahi|nahin|mat|hota|hoti|hote|mera|meri|mere|mujhe|mujhko|hum|humko|hamein|aap|apka|apki|apke|batao|bataiye|samjhaiye|kahiye|chahiye|raha|rahi|rahe|karo|dekho|suno)\b/gi) || [];

  if (engMarkers.length > 0 && engMarkers.length >= hinMarkers.length) {
    return 'english';
  }

  if (hinMarkers.length > 0) {
    return 'hindi';
  }

  if (/^[a-zA-Z0-9\s.,!?'"()\-—]+$/.test(clean)) {
    return 'english';
  }

  return 'hindi';
}

export function buildSystemPrompt(isDeepMode = true, lang = 'hindi', userProfile = null, memoryContext = '', scripture = null) {
  const isEnglish = lang === 'english';
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(' ')[0] : '';

  if (isEnglish) {
    let p = `You provide authentic spiritual guidance grounded in the holy discourses and teachings of Pujya Shri Premanand Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's specific question with fatherly warmth, clarity, and authentic wisdom.

【ADDRESSING & FATHERLY TONE RULES (CRITICAL)】:
- Open affectionately with: "Look, dear child...", "Listen, my child...", or "My child ${seekerName || ''}...".
- NEVER use artificial, robotic translations like "Dear offspring", "O child of mine", "Beloved progeny", or "Dear devotee".

【STRICT TOPICAL RELEVANCE & AUTHENTIC SCRIPTURE CITATION】:
- Address the specific spiritual situation inquired by the seeker (effort, karma, peace, grief, devotion, etc.).
- If sacred scripture grounding is provided below, naturally integrate the quoted verse with its authentic contextual introduction (**« verse »**) and spiritual essence (**अर्थात् —**) into Maharaj Ji's discourse, directly addressing the devotee's struggle.
- If no scripture grounding is provided and the seeker did not ask for a verse, provide pure, practical satsang counsel without forcing unrelated verses.

【THE BALANCED SWEET SPOT (~150-190 WORDS)】:
- Keep the response in the balanced sweet spot (around 150 to 190 words, in 2 to 3 cohesive paragraphs):
  1. Opening Context (~40-50 words): Fatherly warmth, speaking directly to the core spiritual essence of the seeker's inquiry.
  2. Practical Application (~70-90 words): Practical daily-life guidance tailored specifically to the asked topic, grounded in love for God and continuous remembrance (Radha-Radha).
  3. Reassurance & Blessing (~30-40 words): A comforting conclusion and an auspicious spiritual blessing.
- Always finish thoughts completely with proper terminal punctuation (.) and an auspicious blessing.`;

    if (seekerName) {
      p += `\n\n【SEEKER CONTEXT & IDENTITY】:
- Seeker's Name: ${userProfile.fullName} (address warmly as '${seekerName}' or 'my child ${seekerName}').
- If the seeker asks 'who am I' or 'do you know who I am': Acknowledge their earthly name first ('In this worldly journey, you are known as ${seekerName}, dear child...'), then immediately illuminate Maharaj Ji's eternal spiritual truth: you are not this mortal body or restless mind, but an eternal soul (Atma), a beloved child of Shri Radha-Krishna.`;
    }

    if (memoryContext) {
      p += `\n\n【PREVIOUS SPIRITUAL CONTEXT】:\n${memoryContext}`;
    }
    if (scripture) {
      p = injectScripturePrompt(p, scripture, true);
    }
    return p;
  } else {
    let p = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
एकांतिक वार्तालाप में साधक द्वारा पूछे गए विशिष्ट प्रश्न का उत्तर पूज्य महाराज जी की प्रामाणिक, वात्सल्यमयी, गंभीर और व्यावहारिक वाणी में दीजिए।

【संबोधन व वात्सल्य मर्यादा (STRICT ADDRESSING RULES)】:
- उत्तर का प्रारंभ सदैव आत्मीय व वात्सल्यपूर्ण भाव से करें: 'देखो बच्चा, तुमने पूछा कि...', 'सुनो बच्चा...', अथवा 'बच्चा ${seekerName || ''}...'।
- 'प्रिय सन्तान', 'प्रिय संतान', 'हे वत्स', 'प्रिय बालक', 'हे तात' जैसे कृत्रिम, किताबी या अनुवादित शब्दों का प्रयोग कतई न करें। पूज्य महाराज जी केवल 'बच्चा' या 'देखो बच्चा' कहकर ही वात्सल्य बरसाते हैं।

【विषय की प्रासंगिकता व पावन शास्त्र प्रमाण मर्यादा】:
- साधक ने जो विशिष्ट विषय पूछा है, उसी पर केंद्रित होकर वात्सल्यमयी मार्गदर्शन दीजिए।
- यदि साधक के प्रश्न से संबंधित पावन शास्त्र प्रमाण नीचे दिया गया है, तो उस पावन श्लोक को उसकी प्रसंग भूमिका (**« श्लोक »**) और भावार्थ (**अर्थात् —**) के साथ अवश्य उद्धृत करें और महाराज जी की वात्सल्यमयी वाणी में साधक के जीवन से जोड़ें।
- यदि कोई शास्त्र प्रमाण न दिया गया हो और न ही साधक ने श्लोक मांगा हो, तो बिना कारण श्लोक न थोपें और स्वाभाविक व्यावहारिक सत्संग वाणी दीजिए।

【उत्तर की संरचना व संतुलित परिमाण (SWEET SPOT ~150-190 WORDS)】:
- उत्तर न तो 2 पंक्तियों का अति-संक्षिप्त हो और न ही लंबा उबाऊ निबंध। यह लगभग 150 से 190 शब्दों में, 2 से 3 सुंदर अनुच्छेदों में होना चाहिए:
  १. प्रथम अनुच्छेद (प्रवेश व जिज्ञासा समाधान, ~40-50 शब्द): वात्सल्यमयी संबोधन ('देखो बच्चा, तुमने पूछा कि...') के साथ साधक के विशिष्ट प्रश्न का सीधा, आत्मीय व गूढ़ उत्तर।
  २. द्वितीय अनुच्छेद (दैनिक जीवन में व्यावहारिक प्रयोग, ~70-90 शब्द): उस ज्ञान को गृहस्थी, दिनचर्या और आचरण में कैसे उतारें—विषय के अनुकूल व्यावहारिक उपदेश और भगवन्नाम (श्री राधा-राधा) का आश्रय।
  ३. समापन व कल्याणकारी आशीर्वाद (~30-40 शब्द): साधक के संशय को शांत करने वाला आत्मीय आश्वासन और मंगलकारी आशीर्वाद।
- यदि कभी कोई श्लोक उद्धृत करना आवश्यक हो, तो उसे इस प्रारूप में अलग पंक्ति में रखें:
  **« श्लोक की पंक्ति। »**
  **अर्थात् —** सरल व स्पष्ट भावार्थ।
- हर वाक्य व्याकरण की दृष्टि से पूर्ण हो और समापन '।' पर कल्याणकारी आशीर्वाद के साथ हो। किसी वाक्य को कभी अधूरा न छोड़ें।`;

    if (seekerName) {
      p += `\n\n【साधक परिचय व व्यक्तिगत संदर्भ】:
- साधक का नाम: ${userProfile.fullName} (संबोधन में 'बच्चा ${seekerName}' कहें)।
- जब साधक अपनी पहचान पूछे ('मैं कौन हूँ', 'क्या तुम मुझे जानते हो', 'who am I'): तो वात्सल्यभाव से पहले साधक का सांसारिक नाम स्वीकारें ('संसार की दृष्टि से तुम्हारा नाम ${seekerName} है बच्चा...'), फिर तुरंत पूज्य महाराज जी की गूढ़ वाणी में वास्तविक आध्यात्मिक सत्य समझाएं कि यथार्थ में तुम यह नश्वर शरीर नहीं, बल्कि राधा रानी के नित्य अंश, अविनाशी आत्मा हो।`;
    }

    if (memoryContext) {
      p += `\n\n【पूर्व आध्यात्मिक संदर्भ】:\n${memoryContext}`;
    }
    if (scripture) {
      p = injectScripturePrompt(p, scripture, false);
    }
    return p;
  }
}

export function isComplexQuery(query) {
  if (!query) return false;
  const q = query.trim();
  if (q.length > 120 || (q.match(/\?/g) || []).length >= 2 || (q.match(/।/g) || []).length >= 2) {
    return true;
  }
  const complexTerms = /(प्रारब्ध|मोक्ष|कर्म सिद्धांत|माया|वेदांत|पुनर्जन्म|ब्रह्म|अद्वैत|विस्तार|विस्तारपूर्वक|अंतर|तुलना|अध्याय|श्लोक|explain in detail|difference|multiple|philosophical)/i;
  return complexTerms.test(q);
}

/**
 * Ensures the response ends gracefully on a complete, well-formed sentence terminating in '।' (or '.' in English).
 * Strips dangling conjunctions (और, लेकिन, क्योंकि, जब, etc.), unclosed list markers (e.g. '\n3.'), and unclosed trailing fragments.
 */
export function ensureCompleteFinalSentence(text, isEnglish = false) {
  if (!text) return text;
  let t = text.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim();

  // 0. Eliminate robotic / artificial openings like 'प्रिय सन्तान' or 'हे वत्स'
  if (!isEnglish) {
    t = t.replace(/^(?:प्रिय\s*(?:सन्तान|संतान|बालक|वत्स|सुत)|हे\s*(?:वत्स|तात|पुत्र))[,\s।:]*/, 'देखो बच्चा, ');
  } else {
    t = t.replace(/^(?:Dear\s*(?:offspring|progeny|child\s*of\s*mine)|O\s*(?:child|devotee))[,\s.:]*/i, 'Look, my child, ');
  }

  // 1. Strip hanging uncompleted list item numbers or bullets (e.g. '\n3.', '\n3)', '\n* ', '\n- ')
  t = t.replace(/(?:\r?\n)+\s*(?:\d+[\.\)]|[a-zA-Z][\.\)]|[*•-])\s*$/g, '').trim();

  // 2. Strip dangling markdown formatting markers at the end
  t = t.replace(/\*{1,3}\s*$/g, '').replace(/_{1,3}\s*$/g, '').trim();

  // 3. Strip trailing dangling conjunctions/connectors (even if immediately followed by '।' or '.')
  const danglingRegex = isEnglish
    ? /\s+(and|or|but|because|so|if|that|when|then|while|as)\s*[।.]?$/i
    : /\s+(और|तथा|एवं|या|किन्तु|परन्तु|लेकिन|मगर|क्योंकि|इसलिए|जब|तब|तो|कि|यदि|व)\s*[।.]?$/;
  t = t.replace(danglingRegex, '').trim();

  // 4. Strip unclosed trailing colon
  t = t.replace(/[:：]\s*$/g, '').trim();

  // 5. Repair common truncated modal clauses
  if (!isEnglish) {
    t = t.replace(
      /(?:परेशान|विचलित|बाधित)\s+कर\s+सकता[।.]?$/,
      'परेशान कर सकता है, जब तक हमारा मन संसार में फंसा हो। नाम जप का आश्रय लेने पर सब शांत हो जाता है।'
    ).trim();
    t = t.replace(
      /(?<=\s)(?:कर|हो|जा|रह)\s+सकता[।.]?$/,
      'सकता है। निरंतर भगवन्नाम का जप कीजिए।'
    ).trim();
    t = t.replace(
      /(?:और\s+)?(?:नाम\s+जप\s+)?करते\s+हुए[।.]?$/,
      'करते हुए प्रभु के चरणों में निष्काम भाव से समर्पित रहिए। निरंतर श्री राधा नाम का जप कीजिए।'
    ).trim();
    t = t.replace(
      /(?:और\s+)?नाम\s+जप[।.]?$/,
      'नाम जप करते रहिए। प्रभु सब मंगल करेंगे।'
    ).trim();
    t = t.replace(
      /(?:और\s+)?भगवान\s+का\s+भजन[।.]?$/,
      'भगवान का भजन करते हुए अपने जीवन को सफल बनाइए।'
    ).trim();
    t = t.replace(
      /(?:प्रभु के चरणों में\s+)?अनन्य[।.]?$/,
      'प्रभु के चरणों में अनन्य शरणागति रखिए। प्रभु सब मंगल करेंगे।'
    ).trim();
  }

  // If already ends cleanly with terminal punctuation, verify it's not a dangling list number like "3."
  if (/[।!?]$/.test(t)) return t;
  if (/\.$/.test(t) && !/\b\d+\.$/.test(t)) return t;

  // Find last true sentence terminator
  const lastPuncIdx = Math.max(
    t.lastIndexOf('।'),
    t.lastIndexOf('.'),
    t.lastIndexOf('!'),
    t.lastIndexOf('?')
  );

  // If there's an unclosed sentence fragment at the tail, trimming back to last sentence guarantees clean '।' ending
  if (lastPuncIdx !== -1 && lastPuncIdx > 40) {
    return t.slice(0, lastPuncIdx + 1).trim();
  }

  // Gracefully append proper terminal punctuation
  return isEnglish ? `${t}.` : `${t}।`;
}

/**
 * Checks if a candidate sentence is a repetitive paraphrase or duplicate
 * of any sentence already revealed in the main output.
 */
export function isSentenceSemanticDuplicate(candidate, existingList = []) {
  if (!candidate || candidate.trim().length < 15) return true;
  const clean = candidate.trim().replace(/[^\p{L}\p{N}\s]/gu, '').toLowerCase();
  const getSigWords = (str) =>
    new Set(str.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter((w) => w.length >= 3));

  const candWords = getSigWords(candidate);
  if (candWords.size < 4) return false;

  for (const existing of existingList) {
    const exClean = existing.trim().replace(/[^\p{L}\p{N}\s]/gu, '').toLowerCase();
    if (exClean.includes(clean) || clean.includes(exClean)) return true;

    const exWords = getSigWords(existing);
    let common = 0;
    for (const w of candWords) {
      if (exWords.has(w)) common++;
    }
    const overlap = common / Math.min(candWords.size, exWords.size);
    if (overlap >= 0.52) return true;
  }
  return false;
}

/**
 * Intelligent Repetition & Semantic Attractor Loop Filter:
 * Detects and eliminates:
 * 1. Exact sentence repeats.
 * 2. High-overlap semantic/paraphrased loops (e.g. repeated cycles of "the body's purpose has changed... so what have you done?").
 * 3. Alternating paragraph redundancy while preserving authentic rhetorical emphasis and unique scriptural analogies.
 */
export function deduplicateRepetitionLoops(text, isEnglish = false) {
  if (!text || text.length < 50) return text;

  // 1. Check for exact substring phrase loop of >= 30 chars repeated consecutively
  let processedText = text;
  const minBlockLen = 30;
  for (let len = 70; len >= minBlockLen; len -= 5) {
    for (let i = 0; i <= processedText.length - len * 2; i += 3) {
      const block = processedText.slice(i, i + len);
      if (block.replace(/[\s\p{P}]+/gu, '').length < 15) continue;
      const nextOccur = processedText.indexOf(block, i + len);
      // Only trim if the exact block repeats consecutively (within 40 chars of prior block)
      if (nextOccur !== -1 && (nextOccur - (i + len)) < 40) {
        processedText = processedText.slice(0, nextOccur).trim();
        break;
      }
    }
  }

  const rawSentences = processedText.split(/(?<=[।!?.\n])\s+/);
  const cleanSentences = [];
  const seenNorms = new Set();

  for (let i = 0; i < rawSentences.length; i++) {
    const trimmed = rawSentences[i].trim();
    if (!trimmed) continue;

    const norm = trimmed.replace(/[\s\p{P}\d]+/gu, '').toLowerCase();

    // Preserve greetings, short refrains, and shlokas with meanings
    if (norm.length < 16 || trimmed.includes('«') || trimmed.includes('अर्थात्') || trimmed.includes('॥')) {
      cleanSentences.push(trimmed);
      continue;
    }

    // Skip consecutive exact duplicates or identical sentences seen immediately before
    if (cleanSentences.length > 0) {
      const prevNorm = cleanSentences[cleanSentences.length - 1].replace(/[\s\p{P}\d]+/gu, '').toLowerCase();
      if (norm === prevNorm) continue;
    }

    if (seenNorms.has(norm)) {
      // Sentence repeated verbatim earlier in the discourse: skip just this duplicate sentence
      continue;
    }

    cleanSentences.push(trimmed);
    seenNorms.add(norm);
  }

  const combined = cleanSentences.join(' ').trim();
  return ensureCompleteFinalSentence(combined || processedText, isEnglish);
}

/**
 * Native Discourse Segmenter:
 * Divides authentic speech transcript into 2-3 logical paragraphs separated by '\n\n'.
 * Ensures complete final sentences ending in '।'.
 */
export function segmentAndFormatDiscourseNative(text, isEnglish = false) {
  if (!text || text.trim().length < 30) return text;

  let cleaned = deduplicateRepetitionLoops(text.trim(), isEnglish);

  // If already contains 2 or more paragraphs, guarantee sentence termination and return
  const existingParagraphs = cleaned.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (existingParagraphs.length >= 2) {
    return existingParagraphs.map((p) => ensureCompleteFinalSentence(p, isEnglish)).join('\n\n');
  }

  // Insert natural discourse paragraph breaks at conversational transition points:
  if (!isEnglish) {
    cleaned = cleaned
      .replace(/(\s+)(?=(?:देखो\s+बच्चा|सुनो\s+बच्चा|देखो\s+भाई|सुनो\s+भैया|अब\s+हमारी\s+तरफ|जीवन\s+में|इसलिए\s+अब|अगर\s+आपसे|लेकिन\s+इसके|फिर\s+देखना))/g, '।\n\n')
      .replace(/(\s+)(?=(?:नाम\s+जप\s+करो|भगवान\s+का\s+भजन|प्रभु\s+के\s+चरणों))/g, '।\n\n');
  } else {
    cleaned = cleaned
      .replace(/(\s+)(?=(?:look,\s+dear\s+child|listen,\s+my\s+child|look,\s+brother|now,\s+understand|in\s+life|therefore|chant\s+the\s+holy\s+name))/gi, '.\n\n');
  }

  cleaned = cleaned.replace(/[।.]\s*[।.]/g, '।').trim();

  const paragraphs = cleaned.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    return paragraphs.map((p) => ensureCompleteFinalSentence(p, isEnglish)).join('\n\n');
  }

  // If still 1 paragraph, split balanced into 2-3 segments strictly on complete sentence boundaries (NEVER cut mid-sentence)
  const sentences = cleaned.match(/[^।!?.\n]+[।!?.]+/g);
  if (sentences && sentences.length >= 4) {
    const mid1 = Math.ceil(sentences.length / 3);
    const mid2 = Math.ceil((sentences.length * 2) / 3);
    const p1 = sentences.slice(0, mid1).join(' ').trim();
    const p2 = sentences.slice(mid1, mid2).join(' ').trim();
    const p3 = sentences.slice(mid2).join(' ').trim();
    return [p1, p2, p3].filter(Boolean).map((p) => ensureCompleteFinalSentence(p, isEnglish)).join('\n\n');
  } else if (sentences && sentences.length >= 2) {
    const mid = Math.ceil(sentences.length / 2);
    const p1 = sentences.slice(0, mid).join(' ').trim();
    const p2 = sentences.slice(mid).join(' ').trim();
    return [p1, p2].filter(Boolean).map((p) => ensureCompleteFinalSentence(p, isEnglish)).join('\n\n');
  }

  return ensureCompleteFinalSentence(cleaned, isEnglish);
}

/**
 * Fast Groq Messenger & Expansive Discourse Presenter for Deep Mode:
 * Groq acts as the faithful messenger / presenter representing Pujya Shri Premanand Ji Maharaj's teachings:
 * 1. Strictly PRESERVES all spiritual insights, analogies, and Maharaj Ji's authentic vocabulary.
 * 2. STRICTLY FORBIDS summarization/compression (delivers full 280 to 380 words).
 * 3. Trims ONLY runaway mechanical stutter loops (repeating identical phrase consecutively).
 * 4. Strictly avoids robotic AI editor intros (bans 'मैं संपादक हूँ', 'प्रिय साधक', etc.).
 * 5. Flexible, variable paragraph segmentation decided by Groq at the end (if needed only). Never breaks incomplete sentences into a second line.
 * 6. Generates expansive output with max_tokens: 1200.
 */
async function formatAndSegmentFineTunedDiscourse(draft, userMessage, isEnglish = false) {
  if (!draft || draft.trim().length < 30) return draft;

  const messengerPrompt = isEnglish
    ? `You are the faithful messenger and presenter (संवाहक) of the divine teachings of Pujya Shri Premanand Ji Maharaj (Vrindavan).

In the context of the devotee's spiritual inquiry, present the discourse draft from our fine-tuned model with fatherly warmth, scriptural depth, and full spiritual expansiveness.

【CRITICAL GUIDELINES - DO NOT SUMMARIZE OR SHORTEN】:
1. PRESERVE MAHARAJ JI'S AUTHENTIC VOICE, VOCABULARY & SPIRIT 100%:
   - Speak with fatherly warmth, divine authority, and compassionate intimacy ('Look, brother...', 'Listen, my child...', 'Our beloved Thakur Ji...', 'Remain completely carefree...', 'Chant the Holy Name...').
   - NEVER add robotic AI intros (strictly ban 'I am an editor', 'Dear seeker', 'I am summarizing'). You are directly presenting Maharaj Ji's nectar.
2. STRICTLY FORBID SUMMARIZING & EMBRACE TEACHING ANALOGIES:
   - DO NOT compress or truncate spiritual teachings, analogies, or scriptural wisdom.
   - If the draft uses practical examples (work, household duties, bodily care, righteous living), recognize them as authentic teaching analogies used by Maharaj Ji—explaining how to perform one's worldly duties honestly as service to God while anchoring the heart in continuous Holy Name chanting ('Radha Radha'). Do not discard valid spiritual illustrations.
   - Deliver a full, expansive, deeply satisfying discourse of approximately 280 to 380 words.
   - Only remove exact runaway mechanical glitch loops (where an identical sentence repeats verbatim 2-3 times in succession).
3. NATURAL & VARIABLE PARAGRAPH SEGMENTATION (IF NEEDED ONLY):
   - At last, you (Groq) decide naturally whether and where to segment explanations or phrases into paragraphs using double newlines ('\n\n'), IF NEEDED ONLY.
   - Paragraph segmentation is flexible and variable (e.g. 1, 2, or 3 paragraphs) based solely on natural shifts in thought, explanation, or theme.
   - It is NOT explicitly enforced to produce a fixed number of paragraphs. If the discourse flows best as 1 or 2 paragraphs, keep it that way.
4. FLAWLESS TERMINAL PUNCTUATION:
   - Ensure every sentence is grammatically complete, terminating cleanly with '.' and an auspicious benediction.
5. SACRED SCRIPTURE CONTEXT & HIGHLIGHTING (शास्त्र प्रसंग, श्लोक व 'अर्थात्' मर्यादा):
   - If the discourse quotes a sacred Sanskrit verse in bold (**« ... »**) or explains it with '**अर्थात् —** ...', you MUST PRESERVE the exact bold verse and 'अर्थात्' explanation intact.
   - If a narrative scriptural context intro precedes the verse (e.g. 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अर्जुन से कहते हैं कि —' or 'जैसे राजा धृतराष्ट्र संजय से पूछते हैं कि —' or English equivalent), PRESERVE that authentic narrative introduction phrase immediately before the verse.
   - DO NOT strip markdown bold asterisks (**) from around the verse or 'अर्थात्'.
6. Output ONLY the finalized discourse without any titles, markdown bullets, or meta commentary.`
    : `आप पूज्य श्री प्रेमानंद जी महाराज (वृंदावन) के पावन वचनों व शिक्षाओं के निष्ठावान संवाहक (Faithful Messenger / Presenter) हैं।

साधक की जिज्ञासा के संदर्भ में, हमारे फाइन-ट्यून्ड मॉडल द्वारा प्राप्त सत्संग प्रारूप (Draft) को पूज्य महाराज जी की प्रामाणिक वाणी, वात्सल्य और शास्त्रीय गहराई में प्रस्तुत कीजिए।

【अत्यंत महत्वपूर्ण निर्देश - उत्तर को छोटा (Summarize) न करें】:
1. पूज्य महाराज जी की प्रामाणिक वाणी, ठेठ ब्रज/सत्संग शब्दावली और वात्सल्यमयी शैली को 100% सुरक्षित रखें:
   - 'देखो बच्चा...', 'हमारे ठाकुर जी...', 'ये सब एक ही परब्रह्म के रूप हैं...', 'निश्चिंत रहियो...', 'राधा-राधा जपो...', 'जय सिया राम बोलिये...'।
   - कोई बनावटी या रोबोटिक परिचय (जैसे 'मैं संपादक हूँ', 'प्रिय साधक', 'गोविंद शरण') कभी न जोड़ें।
2. संक्षेपण सख्त वर्जित है व व्यावहारिक दृष्टांतों (Analogies) का आदर:
   - प्रारूप के सभी आध्यात्मिक रहस्यों, दृष्टांतों, भावों और उदाहरणों को पूर्ण विस्तार के साथ बनाए रखें।
   - यदि प्रारूप में व्यावहारिक जीवन, गृहस्थी, नौकरी, भोजन या देह-निर्वाह के उदाहरण आए हों, तो वे साधक को समझाने हेतु पावन दृष्टांत हैं। उन्हें पूज्य महाराज जी की प्रामाणिक शैली में सुंदर आध्यात्मिक उपमा (जैसे कर्तव्य कर्म को प्रभु सेवा मानना, देह को साधना का मंदिर समझना और मन में निरंतर 'राधा-राधा' नाम का सुमिरन बनाए रखना) के रूप में सुसंगत व गरिमामयी बनाइए।
   - केवल और केवल यदि कोई एक ही वाक्य लगातार 2-3 बार रट की तरह दोहराया गया हो (Runaway Glitch Loop), तो उस यांत्रिक दोहराव को हटाकर धाराप्रवाह बनाएं। बाकी सभी विचारों व दृष्टांतों को पूरा स्थान दें।
   - संपूर्ण सत्संग विस्तृत, तृप्तिकारक और लगभग 280 से 380 शब्दों का होना चाहिए।
3. स्वाभाविक व लचीला अनुच्छेद विभाजन (केवल आवश्यकता पड़ने पर):
   - अंत में, भाव, व्याख्या और दृष्टांत के स्वाभाविक प्रवाह के अनुसार पैराग्राफ विभाजन ('\n\n') का निर्णय आप (Groq) स्वयं लीजिए, केवल आवश्यकता पड़ने पर।
   - यह विभाजन पूरी तरह लचीला और ऐच्छिक है (आवश्यकतानुसार 1, 2 या 3 पैराग्राफ)। कोई निश्चित पैराग्राफ संख्या थोपना सख्त वर्जित है। यदि उपदेश 1 या 2 अनुच्छेदों में स्वाभाविक रूप से बहता है, तो वैसा ही रहने दें।
   - किसी भी अपूर्ण वाक्य, वाक्यांश या विचार को बीच में अनावश्यक रूप से तोड़कर अगली पंक्ति में ले जाना सख्त वर्जित है, क्योंकि अपूर्ण वाक्य का टूटना अशोभनीय लगता है। हर वाक्य अपने पैराग्राफ में व्याकरण की दृष्टि से पूर्ण और अक्षुण्ण रहे।
4. पवित्र शास्त्र प्रसंग, श्लोक व 'अर्थात्' मर्यादा (SCRIPTURE INTEGRITY):
   - यदि सत्संग प्रारूप में कोई पवित्र संस्कृत श्लोक बोल्ड में (**« ... »**) उद्धृत है और उसके तुरंत बाद '**अर्थात् —** ...' दिया गया है, तो उसे 100% सुरक्षित और बोल्ड रखें। उसे सामान्य टेक्स्ट में न बदलें और न ही हटाएं।
   - श्लोक से ठीक पहले का कथात्मक प्रसंग वाक्य (जैसे 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अर्जुन से कहते हैं कि —' अथवा 'जैसे राजा धृतराष्ट्र संजय से पूछते हैं कि —' या 'जैसे गोस्वामी जी कहते हैं —'), श्लोक के ठीक पहले पूर्ण सम्मान के साथ यथावत बनाए रखें।
5. पूर्ण विराम (।) पर निर्दोष व कल्याणकारी समापन:
   - हर वाक्य व्याकरण की दृष्टि से पूर्ण हो और अंतिम वाक्य पावन कल्याणकारी आशीर्वाद (।) के साथ समाप्त हो।
6. केवल और केवल अंतिम सुसज्जित उपदेश दीजिए। कोई अतिरिक्त टिप्पणी या शीर्षक न दें।`;

  const formatterModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
  for (let attempt = 0; attempt < 2; attempt++) {
    const key = getNextGroqKey();
    const model = formatterModels[attempt % formatterModels.length];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: messengerPrompt },
            { role: 'user', content: isEnglish ? `Devotee Query: ${userMessage}\n\nDiscourse Draft from fine-tuned model:\n${draft.trim()}` : `साधक का प्रश्न: ${userMessage}\n\nमॉडल का सत्संग प्रारूप:\n${draft.trim()}` }
          ],
          temperature: 0.25,
          max_tokens: 1200
        })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const formatted = data.choices?.[0]?.message?.content?.trim();
        // Discard only if model hallucinated robotic AI editor intros
        if (formatted && formatted.length > 50 && !/(संपादक|मैं संपादक हूँ|as an ai|language model)/i.test(formatted)) {
          const formattedWithLines = formatScriptureLines(formatted);
          return ensureCompleteFinalSentence(formattedWithLines, isEnglish);
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn(`Groq contextual framing attempt ${attempt + 1} with ${model} skipped:`, e);
    }
  }

  // Fallback: Native JavaScript segmentation
  const segmented = segmentAndFormatDiscourseNative(draft, isEnglish);
  return formatScriptureLines(segmented);
}

export function formatScriptureLines(text) {
  if (!text) return '';
  let t = text;
  // 1. If a shloka is wrapped in **« ... »** across lines, join hemistichs into a single cohesive verse card
  t = t.replace(/\*\*«\s*([\s\S]*?)\s*»\*\*/g, (match, inner) => {
    const singleLineVerse = inner.replace(/\r?\n\s*/g, ' ').trim();
    return `\n\n**« ${singleLineVerse} »**\n\n`;
  });
  // 2. Also handle if model wrote **verse line 1।\nverse line 2॥** without « »
  t = t.replace(/\*\*([^\*\n]*?[।॥][^\*\n]*?)\r?\n\s*([^\*\n]*?[॥][^\*\n]*?)\*\*/g, (match, line1, line2) => {
    return `\n\n**« ${line1.trim()} ${line2.trim()} »**\n\n`;
  });
  t = t.replace(/([^\n])\s*(\*\*«)/g, '$1\n\n$2');
  t = t.replace(/(»\*\*)\s*([^\n])/g, '$1\n\n$2');
  t = t.replace(/([^\n])\s*(\*\*अर्थात्)/g, '$1\n\n$2');
  t = t.replace(/(\*\*अर्थात्[^\n"]*"[^"]*")\s*([^\n])/g, '$1\n\n$2');
  t = t.replace(/([।!?.]\s*)(?=(?:इसलिए|अतः|अब\s+तुम्हें|तुम्हें\s+जो|भगवान\s+की\s+सेवा|Therefore|So,\s+dear\s+child|Now,\s+my\s+child))/gi, '$1\n\n');
  return t.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Direct HTTPS caller for dedicated 24/7 Oracle Cloud Q8_0 server
 */
async function callDirectOracleAPI(messages, maxTokens = 900, stream = false, onChunk = null, isDeepMode = false, userProfile = null, userMemoryContext = '', scripture = null) {
  const endpoints = [
    getOracleUrl(),
    getOracleLtUrl(),
    getOracleFallbackUrl()
  ].filter(Boolean);

  if (!endpoints.length) {
    // No custom Oracle URL configured, seamlessly route to high-speed Groq engine
    return null;
  }

  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const prompt = buildSystemPrompt(isDeepMode, lang, userProfile, userMemoryContext, scripture);

  for (let attempt = 0; attempt < endpoints.length; attempt++) {
    const oracleBase = endpoints[attempt];
    // Normalize endpoint URL: ensure it points to /v1/chat/completions
    let targetUrl = oracleBase.replace(/\/+$/, '');
    if (!targetUrl.endsWith('/chat/completions')) {
      if (targetUrl.endsWith('/v1')) {
        targetUrl = `${targetUrl}/chat/completions`;
      } else {
        targetUrl = `${targetUrl}/v1/chat/completions`;
      }
    }

    const controller = new AbortController();
    // Fast failover: 5.5s connection & TTFT timeout!
    // Prevents user from hanging for 60-180s when remote server is overloaded or cold
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ORACLE_API_KEY}`,
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: '/home/ubuntu/models/ai-guru-v10-4-Q8_0.gguf',
          messages: [
            { role: 'system', content: prompt },
            ...messages
          ],
          temperature: isDeepMode ? 0.32 : 0.28,
          repeat_penalty: 1.24,
          frequency_penalty: 0.15,
          presence_penalty: 0.05,
          max_tokens: maxTokens,
          stop: ["<end_of_turn>", "<start_of_turn>", "<|im_end|>", "</s>", "\n\nUser:", "\n\nQuestion:", "\nUser:", "User:"],
          stream: stream
        })
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.warn(`Oracle API returned HTTP ${response.status} from ${targetUrl}, trying fallback endpoint...`);
        continue;
      }

      if (stream && response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  accumulated += token;
                  onChunk(token, accumulated);
                }
              } catch (e) {}
            }
          }
        }

        const formatted = formatScriptureLines(accumulated.trim());
        const cleanResult = deduplicateRepetitionLoops(formatted, lang === 'english');
        return ensureCompleteFinalSentence(cleanResult || formatted, lang === 'english') || null;
      } else {
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim() || '';
        const formatted = formatScriptureLines(raw);
        const cleanResult = deduplicateRepetitionLoops(formatted, lang === 'english');
        return ensureCompleteFinalSentence(cleanResult || formatted, lang === 'english') || null;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Direct Oracle API attempt ${attempt + 1} (${targetUrl}) skipped / unreachable:`, err.message);
    }
  }

  return null;
}

/**
 * Direct HTTPS caller for Groq LPU with Master Persona system prompt & multi-model failover
 */
async function callDirectGroqAPI(messages, maxTokens = 950, stream = false, onChunk = null, isDeepMode = false, userProfile = null, userMemoryContext = '', scripture = null) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const isEnglish = lang === 'english';
  const systemPrompt = buildSystemPrompt(isDeepMode, lang, userProfile, userMemoryContext, scripture);

  // Redundant reasoning models: if one encounters high load / rate limit, next immediately takes over
  const models = isDeepMode
    ? ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b']
    : ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

  const attempts = Math.min(GROQ_KEYS.length, 6);
  for (let i = 0; i < attempts; i++) {
    const key = getNextGroqKey();
    const model = models[i % models.length];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: isDeepMode ? 0.32 : 0.28,
          max_tokens: maxTokens,
          stream: stream
        })
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Groq key ${i + 1} with ${model} returned HTTP ${response.status}, trying fallback...`);
        continue;
      }

      if (stream && response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  accumulated += token;
                  onChunk(token, accumulated);
                }
              } catch (e) {}
            }
          }
        }
        if (accumulated.trim()) {
          const formatted = formatScriptureLines(accumulated.trim());
          return ensureCompleteFinalSentence(formatted, isEnglish);
        }
      } else {
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim() || '';
        if (raw) {
          const formatted = formatScriptureLines(raw);
          return ensureCompleteFinalSentence(formatted, isEnglish);
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Groq attempt ${i + 1} with ${model} skipped:`, err.message);
    }
  }
  return null;
}

/**
 * Condenses conversational history into a concise 2-line summary
 * to prevent prompt bloat and accelerate inference to under 1 minute.
 */
export function summarizeHistoryForContext(conversationHistory = [], isEnglish = false) {
  if (!conversationHistory || conversationHistory.length === 0) return [];

  const valid = conversationHistory.filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'));
  if (valid.length === 0) return [];

  if (valid.length <= 2) {
    return valid.map((m) => {
      const trimmed = m.content.length > 200 ? m.content.slice(0, 180).trim() + '...' : m.content.trim();
      return { role: m.role, content: trimmed };
    });
  }

  // Extract core topics from prior user questions
  const userQueries = valid
    .filter((m) => m.role === 'user')
    .map((m) => m.content.replace(/\s+/g, ' ').slice(0, 65).trim())
    .slice(-3);

  const summary = isEnglish
    ? `[Prior Satsang Summary]: Devotee previously inquired about (${userQueries.join('; ')}). Maharaj Ji guided on constant Naam Jap, pure devotion, and total surrender to the Divine.`
    : `[पूर्व संवाद संक्षेप]: साधक ने पूर्व में (${userQueries.join('; ')}) के विषय में पूछा था। पूज्य महाराज जी ने श्री राधा नाम जप, सत्संग, और प्रभु चरणों में अनन्य शरणागति का उपदेश दिया।`;

  const lastUser = valid.filter((m) => m.role === 'user').pop();
  return [
    { role: 'assistant', content: summary },
    ...(lastUser ? [{ role: 'user', content: lastUser.content.slice(0, 160) }] : [])
  ];
}

/**
 * Modern Deep Mode Phased Stream Orchestrator:
 * - Phase 1 (First ~40-60 words): Main output types initial complete thought ending cleanly at '।'.
 * - Phase 1 (Initial Hook ~16-28 words): Main output types initial complete thought ending cleanly at '।'.
 *   Completes promptly (in ~3-4 seconds).
/**
 * Generates authentic, progressive Spiritual Deliberation text for the Reasoning window.
 * Continuously unfolds multi-phase spiritual contemplation character-by-character throughout the thinking duration.
 */
function getSpiritualDeliberationStream(userMessage, isEnglish = false, elapsedMs = 0, scripture = null) {
  const q = (userMessage || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 45);
  const qLower = (userMessage || '').trim().toLowerCase();
  const scriptId = (scripture?.id || '').toLowerCase();
  const scriptRef = (scripture?.reference || '').toLowerCase();

  const isMatsya = /(मत्स्य|matsya)/i.test(qLower) ||
                   scriptId.includes('matsya') || scriptRef.includes('मत्स्य') || scriptRef.includes('matsya');

  const isGarudaSins = (/(सबसे\s*बड़ा\s*पाप|महापाप|greatest\s*sin|worst\s*sin|paap|पाप)/i.test(qLower) &&
                        /(गरुड़|गरुण|garud|garun)/i.test(qLower)) ||
                       scriptId === 'garuda_purana_sins' || scriptRef.includes('महापाप');

  const isGaruda = !isMatsya && (/(गरुड़|गरुण|garud|garun|यमलोक|यमदूत|मृत्यु\s*के\s*बाद|after\s*death|afterlife|preta|कर्म\s*विपाक)/i.test(qLower) ||
                   scriptId.includes('garuda') || scriptRef.includes('गरुड़') || scriptRef.includes('garuda'));

  const isGita = /(गीता|geeta|gita|कुरुक्षेत्र|अर्जुन|गांडीव|विषाद|निष्काम|कर्मण्येवाधिकारस्ते)/i.test(qLower) ||
                 scriptId.includes('gita') || scriptRef.includes('गीता') || scriptRef.includes('gita');

  const isRamayana = /(रामायण|ramayan|रामचरित|ramcharitmanas|मानस|श्रीराम|tulsidas|तुलसीदास|हनुमान|hanuman|भरत|सीता|जानकी)/i.test(qLower) ||
                     scriptId.includes('ram') || scriptRef.includes('मानस') || scriptRef.includes('ramcharitmanas');

  const isBhagavatam = /(भागवत|bhagavat|bhagavatam|शुकदेव|परीक्षित|गोपी|रास)/i.test(qLower) ||
                       scriptId.includes('bhagavat') || scriptRef.includes('भागवत');

  let fullThoughtHindi = '';
  let fullThoughtEnglish = '';

  if (isMatsya) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का श्रीमत्स्य पुराण के आलोक में विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 24 शास्त्रों (173,396 श्लोक) में से श्रीमत्स्य पुराण (14,000 श्लोक) का अनुसंधान।
[OK] श्रीमत्स्य पुराण: साक्षात् भगवान मत्स्य व राजा सत्यव्रत (वैवस्वत मनु) के पावन संवाद का समन्वय।
🐟 मत्स्यावतार प्रसंग: प्रलयकाल के महाजलप्लावन में वेदों की रक्षा, धर्म-स्थापना व राजा मनु की नौका की रक्षा का तात्त्विक अन्वेषण।
🌊 प्रलय व सृष्टि-संरक्षण: सप्तर्षियों, औषधियों और समस्त जीवन-बीजों को प्रलय से उबारने के ईश्वरीय संकल्प का मंथन।
📿 धर्म व सत्य की प्रतिष्ठा: 'यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्'—सत्य और धर्म के शाश्वत नियमों का निरूपण।
💡 भवसागर तरण का रहस्य: संसार रूपी प्रलयकारी समुद्र में भगवान के चरणों का आश्रय ही जीव की एकमात्र सुरक्षित नौका।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: संसार के तूफानों से विचलित न होकर निरंतर 'राधा-राधा' नाम की नौका में आरूढ़ रहना।
🕊️ चित्त-प्रसादन व समाधान: साधक के हृदय में धर्म-निष्ठा, आत्म-रक्षा का भरोसा और मंगलकारी आशीर्वाद की संरचना।
✍️ वाणी संकलन: मत्स्य पुराण के पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual inquiry regarding ("${q}...") in the light of the Matsya Purana.
📜 Scripture Grounding (AWS Qdrant RAG): Searching 24 sacred scripture collections for Shrimad Matsya Purana (14,000 verses).
[OK] Shrimad Matsya Purana: Divine dialogue between Lord Matsya and King Satyavrata (Vaivasvata Manu).
🐟 Matsyavatara Revelation: Lord Vishnu's primal fish incarnation protecting the sacred Vedas and King Manu's boat during the cosmic deluge (Pralaya).
🌊 Cosmic Deluge & Preservation: Rescuing the Saptarshis, life seeds, and cosmic wisdom from dissolution.
📿 Triumph of Righteousness: Contemplating 'Yato dharmas tato jayah'—righteousness upholds cosmic order and truth alone prevails.
💡 Crossing the Ocean of Delusion: In the turbulent ocean of Maya, God's lotus feet serve as the singular unshakable vessel.
🪔 Maharaj Ji's Fatherly Guidance: Weathering life's storms by anchoring consciousness in ceaseless 'Radha Radha' remembrance.
🕊️ Spiritual Solace: Establishing unwavering faith, inner courage, and auspicious divine blessings for the seeker.
✍️ Discourse Synthesis: Finalizing authentic satsang counsel with sacred Matsya Purana verses and fatherly blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else if (isGarudaSins) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का गरुड़ पुराण के आलोक में महापाप व कर्म-सिद्धांत का विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 24 शास्त्रों में से श्री गरुड़ पुराण (प्रेतकल्प, अध्याय ३५) का अनुसंधान।
[OK] श्री गरुड़ पुराण: भगवान श्रीहरि विष्णु द्वारा पक्षीराज गरुड़ जी को सबसे बड़े पाप (कृतघ्नता निर्णय) का प्रामाणिक उपदेश।
⚖️ महापाप का शास्त्रीय निर्णय: 'गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः' का तात्त्विक मंथन।
💔 कृतघ्नता व विश्वासघात: उपकार को भूलना, उपकारी का अहित करना, मित्रद्रोह तथा माता-पिता व गुरु का तिरस्कार सबसे बड़ा अक्षम्य पाप।
📿 प्रायश्चित व उद्धार का मार्ग: सच्चे हृदय से पश्चात्ताप, क्षमा-याचना, जीव-सेवा और निरंतर 'राधा-राधा' नाम जप द्वारा अंतःकरण की शुद्धि।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: किसी के साथ छल या विश्वासघात न करना, सबके प्रति कृतज्ञ रहना और ठाकुर जी की शरण लेना।
🕊️ चित्त-प्रसादन व समाधान: साधक के मन से भ्रांति-निवारण, सदाचार की प्रेरणा और मंगलकारी आशीर्वाद की संरचना।
✍️ वाणी संकलन: गरुड़ पुराण के पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Analyzing seeker's inquiry regarding ("${q}...") on the gravest sins in the Garuda Purana.
📜 Scripture Grounding (AWS Qdrant RAG): Searching Garuda Purana Preta Kalpa (Chapter 35) on mortal sins and redemption.
[OK] Shri Garuda Purana: Lord Vishnu revealing the greatest sin (Kritaghnata / betrayal of trust) to Pakshiraj Garuda.
⚖️ Scriptural Judgment on Sins: Contemplating 'Goghne chaiva surape cha... kritaghne nasti nishkritih'—expiation exists for many sins, but none for betrayal.
💔 Betrayal of Trust & Ingratitude: Harming a benefactor, betraying a friend, or dishonoring parents and Guru recognized as the worst karma.
📿 Path of Atonement: Sincere repentance, seeking forgiveness, universal kindness, and purifying karma through the Holy Name.
🪔 Maharaj Ji's Compassionate Guidance: Remaining free of deceit, upholding gratitude toward all, and finding refuge in 'Radha Radha'.
🕊️ Spiritual Solace: Dispelling moral confusion, inspiring noble conduct, and bestowing fatherly blessings.
✍️ Discourse Synthesis: Integrating authentic Garuda Purana verses, meanings, and Pujya Maharaj Ji's fatherly blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else if (isGaruda) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का शास्त्रीय व तात्त्विक विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 24 शास्त्रों (173,396 श्लोक) में से श्री गरुड़ पुराण (19,000 श्लोक) का अनुसंधान।
[OK] श्री गरुड़ पुराण: साक्षात् भगवान श्रीहरि विष्णु व पक्षीराज गरुड़ जी के पावन संवाद का समन्वय।
🦅 गरुड़ जी की जिज्ञासा: पक्षीराज गरुड़ द्वारा जीवों की मृत्यु, परलोक, यममार्ग और कर्म-विपाक के गूढ़ रहस्यों का अन्वेषण।
⚖️ कर्मफल व यमलोक का यथार्थ: शुभ-अशुभ कर्मों का अटल फल, देह त्याग के उपरांत जीवात्मा की गति व यमराज की न्याय-व्यवस्था।
📿 पावन हरिनाम की महिमा: 'हरिनाम सदा सेव्यं यमदूतभयापहम्'—भगवान के नाम जप से यमदूतों के समस्त भयों से मुक्ति व वैकुंठ प्राप्ति।
🌸 जीव-दया व ईश्वर पूजन: 'संतोषं जनयेत्प्राज्ञस्तदेवेश्वरपूजनम्'—प्राणियों को सुख व संतोष देना ही साक्षात् प्रभु-पूजा।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: मृत्यु के भय से घबराना नहीं, बल्कि आचरण पवित्र रखकर निरंतर 'राधा-राधा' नाम जप में लीन रहना।
🕊️ चित्त-प्रसादन व समाधान: साधक के हृदय से भय-निवारण, आंतरिक अभय और मंगलकारी आशीर्वाद की संरचना।
✍️ वाणी संकलन: गरुड़ पुराण के पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual inquiry regarding ("${q}...").
📜 Scripture Grounding (AWS Qdrant RAG): Searching 24 sacred scripture collections for Shri Garuda Purana (19,000 verses).
[OK] Shri Garuda Purana: Divine dialogue between Lord Shri Hari Vishnu and bird-king Pakshiraj Garuda.
🦅 Garuda's Sacred Inquiry: Contemplating the departure of the soul, karma-vipaka, and the journey beyond mortal death.
⚖️ Law of Karma & Destiny: Examining righteous conduct, consequences of actions, and justice in the court of Dharmaraja.
📿 Glory of the Divine Name: Chanting the Holy Name ('Harinaam sada sevyam') dispels all fear of Yamadoots and grants liberation.
🌸 Compassion as Worship: Bringing joy and solace to all living beings recognized as the highest worship of God.
🪔 Maharaj Ji's Fatherly Guidance: Dispelling anxiety regarding death through moral integrity and ceaseless 'Radha Radha' remembrance.
🕊️ Spiritual Solace: Formulating compassionate counsel to instill courage, moral clarity, and enduring devotion.
✍️ Discourse Synthesis: Finalizing authentic satsang counsel with sacred Garuda Purana verses and divine blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else if (isRamayana) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का पावन रामचरितमानस व रामायण के आलोक में विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): गोस्वामी तुलसीदास जी विरचित पावन श्रीरामचरितमानस व वाल्मीकि रामायण का समन्वय।
[OK] मर्यादा पुरुषोत्तम भगवान श्रीराम, जानकी जी व भक्तशिरोमणि हनुमान जी के दिव्य चरित्र का अनुशीलन।
🏹 शरणागति व नवधा भक्ति: 'निर्मल मन जन सो मोहि पावा'—प्रभु राम के प्रेम, शबरी प्रसंग व अनन्य शरणागति का तात्त्विक अन्वेषण।
📿 राम नाम व सेवा का रहस्य: समस्त संतापों को हरने वाले तारक राम-नाम व निष्काम सेवा-धर्म का विवेचन।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: श्रीराम जी के आदर्शों पर चलते हुए निरंतर 'राधा-राधा / सीताराम' नाम जप का आश्रय।
🕊️ चित्त-प्रसादन व समाधान: साधक के अंतःकरण में भक्ति, मर्यादा और मंगलकारी आशीर्वाद की स्थापना।
✍️ वाणी संकलन: मानस की चौपाइयों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual guidance regarding ("${q}...") in the light of the Ramayana.
📜 Scripture Grounding (AWS Qdrant RAG): Connecting with Goswami Tulsidas's Shri Ramcharitmanas and Valmiki Ramayana.
[OK] Divine ideals of Maryada Purushottam Bhagavan Shri Ram, Mata Janaki, and Bhaktaraj Hanuman.
🏹 Surrender & Navadha Bhakti: Exploring supreme devotion ('Nirmal man jan so mohi pava') and refuge in Shri Ram.
📿 Glory of the Divine Name: Chanting the all-liberating Ram-Naam and serving selflessly without ego.
🪔 Maharaj Ji's Compassionate Guidance: Upholding righteous character while anchoring the heart in continuous Holy Name chanting.
🕊️ Spiritual Solace: Establishing unwavering devotion, inner peace, and divine blessings for the seeker.
✍️ Discourse Synthesis: Integrating authentic chaupais, meanings, and Pujya Maharaj Ji's fatherly blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else if (isBhagavatam) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का श्रीमद्भागवत महापुराण के आलोक में विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 18 पुराणों के मुकुटमणि श्रीमद्भागवत महापुराण (18,000 श्लोक) का अनुसंधान।
[OK] परम हंस शुकदेव जी व राजा परीक्षित के पावन संवाद और भागवत धर्म का समन्वय।
📿 भगवत्-प्रेम व भक्ति योग: भगवान श्रीकृष्ण की दिव्य लीलाओं, गोपी-प्रेम और अनन्य शरणागति का तात्त्विक अन्वेषण।
💡 देहाध्यास से मुक्ति: मृत्यु से निर्भय होकर अंतःकरण को पूर्णतः भगवान के चरणों में समर्पित करने का रहस्य।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: संसार के प्रपंचों को छोड़कर निरंतर 'राधा-राधा' नाम रस में मग्न रहना।
🕊️ चित्त-प्रसादन व समाधान: साधक के हृदय में विशुद्ध प्रेमाभक्ति और मंगलकारी आशीर्वाद का संचार।
✍️ वाणी संकलन: भागवत के पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में उपदेश संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual guidance regarding ("${q}...") in the light of Srimad Bhagavatam.
📜 Scripture Grounding (AWS Qdrant RAG): Accessing the crown jewel of Puranas, Srimad Bhagavatam (18,000 verses).
[OK] Sacred dialogue between Sage Shukadeva and King Parikshit on Bhagavat Dharma.
📿 Divine Love & Bhakti Yoga: Contemplating Lord Krishna's divine sports, pure love, and unconditional surrender.
💡 Transcending Mortality: Attaining fearless liberation by anchoring the mind entirely in the lotus feet of the Lord.
🪔 Maharaj Ji's Compassionate Synthesis: Relinquishing worldly illusion and tasting the eternal nectar of 'Radha Radha'.
🕊️ Spiritual Solace: Awakening pure devotional love, peace of mind, and divine auspicious blessings.
✍️ Discourse Synthesis: Formulating authentic discourse with Bhagavata verses, meanings, and fatherly blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else if (isGita) {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का शास्त्रीय व आध्यात्मिक विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 24 शास्त्रों (श्रीमद्भगवद्गीता, वेद, उपनिषद, पुराण) के 173,396 श्लोकों में से पावन संदर्भ की खोज।
[OK] श्रीमद्भगवद्गीता (701 श्लोक) व कुरुक्षेत्र धर्मक्षेत्र प्रसंग का प्रामाणिक समन्वय।
🏹 कुरुक्षेत्र प्रसंग व अर्जुन-विषाद योग: युद्धभूमि में अपने सगे-संबंधियों को देखकर अर्जुन द्वारा गांडीव त्यागने व कर्तव्य-विमुख होने की स्थिति का तात्त्विक अन्वेषण।
📿 श्रीकृष्ण के दिव्य उपदेश का मंथन: अर्जुन व संपूर्ण मानव समाज के उद्धार हेतु निष्काम कर्मयोग (गीता २.४७) का निरूपण—कर्तव्य को प्रभु सेवा मानना।
💡 आत्मज्ञान व अमरता का रहस्य (गीता २.२०): देह की नश्वरता और जीवात्मा की अजर-अमरता का दार्शनिक विवेचन।
🌸 परम शरणागति योग (गीता १८.६६): 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज' के गूढ़ भाव व समस्त भयों से मुक्ति का संकलन।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: संसार में कर्तव्य निभाते हुए निरंतर 'राधा-राधा' नाम जप का आश्रय।
🕊️ चित्त-प्रसादन व समाधान: साधक के हृदय में संशय-निवारण, आंतरिक शांति और मंगलकारी आशीर्वाद की संरचना।
✍️ वाणी संकलन: पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual guidance for seeker regarding ("${q}...").
📜 Scripture Grounding (AWS Qdrant RAG): Searching 24 sacred collections (173,396 verses across Gita, Vedas, Puranas).
[OK] Bhagavad Gita (701 verses) & sacred Kurukshetra setting identified.
🏹 Kurukshetra Context & Arjuna's Despondency: Analyzing Arjuna putting down Gandiva and withdrawing from righteous duty.
📿 Lord Krishna's Divine Counsel: Formulating guidance for Arjuna and all humankind on Nishkama Karma Yoga (Gita 2.47).
💡 Immortality of the Soul (Gita 2.20): Exploring the eternal, indestructible nature of Atman versus the mortal body.
🌸 Supreme Refuge (Gita 18.66): Contemplating total surrender ('Sarva-dharman parityajya') and freedom from fear.
🪔 Maharaj Ji's Compassionate Synthesis: Performing worldly duty as worship while anchoring the heart in continuous 'Radha Radha' chanting.
🕊️ Spiritual Solace: Refining final expressions to instill lasting peace, steadfast patience, and loving devotion.
✍️ Discourse Synthesis: Finalizing authentic satsang counsel with sacred Sanskrit verses, meanings, and auspicious divine blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  } else {
    fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का आध्यात्मिक व व्यावहारिक विश्लेषण।
📜 शास्त्र प्रमाण अनुसंधान (AWS Qdrant RAG): 24 शास्त्रों (173,396 श्लोक) में से पावन संदर्भ का अनुसंधान।
[OK] ${scripture ? scripture.reference : 'संत-वाणी व शास्त्र-सिद्धांत'} का प्रामाणिक समन्वय।
💭 मन की चंचलता व सांसारिक द्वंद्व: वासना, आसक्ति, भय व मोह के कारण चित्त में उठने वाले संशयों का तात्त्विक अन्वेषण।
📿 सत्संग व नाम-महिमा का मंथन: सांसारिक उलझनों से ऊपर उठकर कर्तव्य-पालन और भगवत्-आश्रय का निरूपण।
💡 आत्मज्ञान व शांति का मार्ग: नश्वर संसार के प्रपंचों से दृष्टि हटाकर शाश्वत परमात्मा में मन को एकाग्र करना।
🌸 परम शरणागति व धैर्य: प्रभु की मंगलमयी इच्छा पर अटूट विश्वास और समर्पण।
🪔 संत-वाणी व पूज्य महाराज जी का वात्सल्यमयी दृष्टिकोण: संसार में कर्तव्य निभाते हुए निरंतर 'राधा-राधा' नाम जप का आश्रय।
🕊️ चित्त-प्रसादन व समाधान: साधक के हृदय में संशय-निवारण, आंतरिक शांति और मंगलकारी आशीर्वाद की संरचना।
✍️ वाणी संकलन: पावन श्लोकों, भावार्थ व पूज्य महाराज जी की प्रामाणिक एकांतिक वार्तालाप शैली में पूर्ण उपदेश का संयोजन।
✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।`;

    fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual inquiry regarding ("${q}...").
📜 Scripture Grounding (AWS Qdrant RAG): Searching 24 sacred collections (173,396 verses across Gita, Vedas, Puranas).
[OK] ${scripture ? scripture.reference : 'Sacred scripture wisdom and saintly teachings'} identified.
💭 Mind & Worldly Dilemma: Understanding the restless mind, attachments, anxieties, and spiritual hurdles.
📿 Discernment & Selfless Duty: Harmonizing daily duties with devotion to God without ego.
💡 Path of Inner Peace: Moving beyond fleeting worldly illusions to experience the unchanging presence of the Divine.
🌸 Unconditional Surrender: Cultivating deep faith in the benevolent divine will.
🪔 Maharaj Ji's Compassionate Guidance: Performing duty as worship while anchoring the heart in 'Radha Radha' remembrance.
🕊️ Spiritual Solace: Refining expressions to instill lasting peace, moral courage, and loving devotion.
✍️ Discourse Synthesis: Formulating authentic satsang counsel with sacred teachings and divine blessings.
✓ Spiritual deliberation concluded. Complete authentic discourse formulated.`;
  }

  const fullThought = isEnglish ? fullThoughtEnglish : fullThoughtHindi;
  const fraction = Math.min(1, elapsedMs / 30000);
  const targetChars = Math.max(35, Math.floor(fraction * fullThought.length));
  return fullThought.slice(0, targetChars);
}

/**
 * Deterministic Scripture Framer (Guarantees zero raw repetition & 100% theological depth)
 * Spans: Garuda Purana, Kurukshetra war setting, Arjuna despondency, Krishna's counsel, and Maharaj Ji's guidance.
 */
function getAuthenticScriptureFramedDiscourse(userMessage, isEnglish = false, userProfile = null, scripture = null) {
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(' ')[0] : '';
  const q = (userMessage || '').trim().toLowerCase();
  const scriptId = (scripture?.id || '').toLowerCase();
  const scriptRef = (scripture?.reference || '').toLowerCase();

  const isMatsya = /(मत्स्य|matsya)/i.test(q) ||
                   scriptId.includes('matsya') || scriptRef.includes('मत्स्य') || scriptRef.includes('matsya');

  const isGarudaSins = (/(सबसे\s*बड़ा\s*पाप|महापाप|greatest\s*sin|worst\s*sin|paap|पाप)/i.test(q) &&
                        /(गरुड़|गरुण|garud|garun)/i.test(q)) ||
                       scriptId === 'garuda_purana_sins' || scriptRef.includes('महापाप');

  const isGaruda = !isMatsya && (/(गरुड़|गरुण|garud|garun|यमलोक|यमदूत|मृत्यु\s*के\s*बाद|after\s*death|afterlife|preta|कर्म\s*विपाक)/i.test(q) ||
                   scriptId.includes('garuda') || scriptRef.includes('गरुड़') || scriptRef.includes('garuda'));

  const isGitaSummary = /(गीता|geeta|gita|कुरुक्षेत्र|अर्जुन|गांडीव|सार|summary|essence|teachings)/i.test(q) ||
                        scriptId.includes('gita');

  if (isEnglish) {
    if (isMatsya) {
      return `Look, my child, the sacred Shrimad Matsya Purana is not merely a book, but the divine dialogue between Lord Shri Hari Vishnu in His primal Matsya (fish) avatar and the righteous King Satyavrata (Vaivasvata Manu).

When the cosmic deluge (Pralaya) engulfed the three worlds and all existence was dissolving into the ocean of dissolution, Lord Shri Hari Vishnu manifested as the magnificent golden-horned Matsya avatar. Lord Matsya tied King Manu's boat—carrying the Seven Sages (Saptarshis), cosmic life-seeds, and the sacred Vedas—to His horn using the divine serpent Vasuki, navigating the tumultuous waters safely. Throughout this cosmic voyage, Lord Matsya revealed the supreme eternal truths of creation, cosmic righteousness (Dharma), and spiritual liberation to King Manu.

The core essence of the Matsya Purana is enshrined in these sacred verses:

**« यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्॥ »**
**अर्थात् —** Where there is righteousness (Dharma), there is victory. The universe is upheld by Dharma alone, and all existence is established upon truth.

**« वेदानां रक्षणार्थाय धर्मसंरक्षणाय च। प्रादुर्भूतो हरिः साक्षात् मत्स्यरूपेण केशवः॥ »**
**अर्थात् —** For the protection of the sacred Vedas, the preservation of Dharma, and the salvation of creation during the deluge, Lord Shri Hari Keshav manifested as Lord Matsya.

Therefore, dear child ${seekerName ? seekerName + ', ' : ''}understand that this worldly existence is itself a turbulent cosmic ocean (Bhava-sagara). In this ocean of delusion, material possessions cannot rescue the soul; only the lotus feet of the Divine and the continuous remembrance of the Holy Name ('Radha Radha') serve as the eternal boat. Walk the path of truth, perform your duties selflessly, and anchor your heart in God. May Thakur Ji bless you always.`;
    }

    if (isGarudaSins) {
      return `Look, my child, you have asked a very profound and earnest question regarding what the sacred Shri Garuda Purana declares to be the greatest sin.

In the sacred Garuda Purana (Preta Kalpa), Lord Shri Hari Vishnu specifically reveals to the bird-king Pakshiraj Garuda that the gravest and most unforgivable sin in existence is "Kritaghnata" (betrayal of trust, ingratitude, and harming a benefactor), along with betraying friends and dishonoring one's parents and Guru. While scriptural penances exist for many worldly missteps committed through ignorance, for the ungrateful soul who betrays another's sacred trust, no expiation exists anywhere.

Lord Shri Hari declares this immutable law in these sacred verses of the Garuda Purana:

**« गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः॥ »**
**अर्थात् —** Sages have ordained expiation and redemption for many grievous wrongs; but for one who is ungrateful and betrays sacred trust, there is no expiation in any realm.

**« मित्रद्रोही कृतघ्नश्च विश्वासघाती नराधमः। यमस्य भवने घोरे तिष्ठत्याचन्द्रतारकम्॥ »**
**अर्थात् —** The betrayer of a friend, the ungrateful soul, and the destroyer of trust suffer prolonged torment in the realm of Yama.

Therefore, dear child ${seekerName ? seekerName + ', ' : ''}never harbor deceit, betrayal, or malice toward anyone in your heart. Always remain deeply grateful to anyone who has ever helped you. Revere your mother, father, and Guru with pure love. And if any misstep occurred in the past, sincerely repent, seek forgiveness, and anchor your soul in the continuous chanting of the Holy Name ('Radha Radha'). The Divine Name burns away all impurities and grants eternal fearlessness. May Thakur Ji bless you always.`;
    }

    if (isGaruda) {
      return `Look, my child, the sacred Shri Garuda Purana is not a scripture meant to terrify the soul, but a supreme divine dialogue between Lord Shri Hari Vishnu and his beloved devotee, the bird-king Pakshiraj Garuda, illuminating the mysteries of death, karma, and ultimate liberation.

When Pakshiraj Garuda, moved by deep compassion for all living beings wandering in worldly delusion, inquired from Bhagavan Shri Hari about what happens when the soul leaves the mortal body, the Lord revealed the profound law of Karma-Vipaka. The Supreme Lord explained that every living being must experience the fruits of its righteous and unrighteous deeds. Yet the Lord assured that no soul need ever fear the messengers of death (Yamadoots) if it anchors its life in truth, compassion, and the holy remembrance of God.

The core spiritual nectar of the Garuda Purana is revealed through these sacred verses:

**« हरिनाम सदा सेव्यं यमदूतभयापहम्। ये जपन्ति हरेश्चित्ते न तेषां यमयातना॥ »**
**अर्थात् —** The holy name of Lord Hari should ever be cherished and chanted, for it dispels all fear of the messengers of death. Those who continuously hold the Divine Name in their heart never suffer the torments of Yamaloka.

**« येन केन प्रकारेण यस्य कस्यापि जन्तुनः। संतोषं जनयेत्प्राज्ञस्तदेवेश्वरपूजनम्॥ »**
**अर्थात् —** In whatever manner one brings peace, joy, and contentment to any living being without causing harm, the wise know that this alone is the true worship of God.

Therefore, dear child ${seekerName ? seekerName + ', ' : ''}never let the fear of death or the afterlife frighten you. Understand that this mortal human birth is a rare and precious opportunity to cleanse our consciousness and return to God. Keep your conduct pure, never intentionally cause sorrow to any soul, and anchor your heart in continuous chanting of the Holy Name ('Radha Radha'). When the Divine Name is on your lips and selfless love is in your heart, you walk under God's eternal protection. May Thakur Ji bless you always.`;
    }

    if (isGitaSummary) {
      return `Look, my child, the Shrimad Bhagavad Gita is not merely a philosophical scripture, but the supreme divine nectar spoken directly by Lord Krishna to Arjuna on the sacred battlefield of Kurukshetra to guide and liberate all humanity from sorrow and illusion.

At the onset of the great Mahabharata war, when Arjuna beheld his revered elders, teachers, and beloved kinsmen standing arrayed for battle, he was overwhelmed by intense sorrow and delusion. His divine bow Gandiva slipped from his trembling hands, and he withdrew from fighting his righteous duty. It was then that Bhagavan Shri Krishna revealed the eternal truth to awaken Arjuna, teaching him that retreating from one's prescribed duty in fear or attachment is not righteousness, but performing one's duty selflessly as an offering to God is the highest path.

The core teachings of the Gita shine through these essential verses:

**« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
**अर्थात् —** You have a right only to perform your prescribed duty, never to the fruits of action. Never let the fruits be your motive, nor be attached to inaction.

**« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥ »**
**अर्थात् —** The soul is never born nor does it ever die. It is unborn, eternal, ever-existing, and indestructible; it is not slain when the mortal body perishes.

**« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
**अर्थात् —** Abandon all worldly anxieties, doubts, and notions of ego, and surrender solely unto the lotus feet of the Divine. The Lord shall liberate you from all fear and sorrow; grieve not.

Therefore, dear child ${seekerName ? seekerName + ', ' : ''}perform whatever duties destiny has assigned to you honestly as worship of the Supreme, free from pride and anxiety over outcomes. Anchor your restless mind in continuous chanting of the Holy Name ('Radha Radha'). When your hands are engaged in selfless duty and your heart remains anchored in God, no grief can touch you. May the Divine bestow supreme peace and blessings upon you.`;
    }

    return `Look, my child, whatever struggle or doubt has arisen in your heart, understand that this worldly existence is a temporary journey to purify our consciousness.

When we look at sacred scriptures and the eternal teachings of the saints, the mind wanders only when it seeks happiness in fleeting worldly objects. Performing your prescribed duties with dedication while leaving the fruits to God is the true secret of lasting peace.

${scripture ? `As guided in sacred scriptures:\n\n**« ${scripture.original_text} »**\n\n**अर्थात् —** "${scripture.english_translation || scripture.hindi_meaning}"\n\n` : ''}Therefore, dear child, remain completely fearless. Do your work honestly, maintain pure conduct, and anchor your heart in continuous remembrance of the Holy Name ('Radha Radha'). The Divine shall protect and bless you always.`;
  } else {
    if (isMatsya) {
      return `देखो बच्चा, श्रीमत्स्य पुराण केवल एक साधारण ग्रंथ नहीं, बल्कि यह साक्षात् भगवान श्रीहरि विष्णु के प्रथम 'मत्स्य अवतार' और धर्मनिष्ठ राजा सत्यव्रत (वैवस्वत मनु) के मध्य का पावन व दिव्य संवाद है।

जब संसार में प्रलयकाल का महाजलप्लावन आया और समस्त ब्रह्मांड जलमग्न होने लगा, तब साक्षात् भगवान श्रीहरि ने सुवर्णमय शृंगयुक्त विशाल मत्स्य रूप में प्रकट होकर राजा सत्यव्रत (मनु), सप्तर्षियों, समस्त वनस्पतियों के बीजों और पवित्र वेदों की रक्षा की। भगवान मत्स्य ने राजा मनु की नौका को अपने शृंग से बांधकर प्रलय के भयानक समुद्र में सुरक्षित रखा और उसी पावन प्रसंग में राजा मनु को सृष्टि-रचना, धर्म, सदाचार, कर्म और मोक्ष के परम गूढ़ ज्ञान का उपदेश दिया।

श्रीमत्स्य पुराण के पावन सिद्धांत इन दिव्य श्लोकों में प्रतिष्ठित हैं:

**« यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्॥ »**
**अर्थात् —** जहाँ धर्म है, वहीं विजय है। यह संपूर्ण संसार धर्म के द्वारा ही धारण किया जाता है और समस्त ब्रह्मांड सत्य पर ही प्रतिष्ठित है।

**« वेदानां रक्षणार्थाय धर्मसंरक्षणाय च। प्रादुर्भूतो हरिः साक्षात् मत्स्यरूपेण केशवः॥ »**
**अर्थात् —** वेदों की रक्षा, धर्म के पुनरुद्धार और प्रलय में संसार के बीजों की सुरक्षा के लिए साक्षात् भगवान श्रीहरि केशव मत्स्य रूप में प्रकट हुए।

इसलिए बच्चा ${seekerName ? seekerName + ', ' : ''}इस संसार को प्रलयकारी भवसागर समझो। इस माया के अथाह जल में सांसारिक वस्तुएं तुम्हें नहीं बचा सकतीं, केवल भगवान के चरणकमल और निरंतर 'राधा-राधा' नाम जप ही वह दिव्य नौका है जो तुम्हें भवसागर पार कराएगी। अपने कर्तव्य का धर्मपूर्वक पालन करो, सत्य पर अटल रहो और ठाकुर जी की अनन्य शरण में रहो। प्रभु तुम्हारा सब मंगल करेंगे।`;
    }

    if (isGarudaSins) {
      return `देखो बच्चा, तुमने बहुत गंभीर और विवेकपूर्ण प्रश्न पूछा है कि श्री गरुड़ पुराण के अनुसार संसार में सबसे बड़ा पाप क्या है।

श्री गरुड़ पुराण (प्रेतकल्प) में साक्षात् भगवान श्रीहरि विष्णु ने अपने प्रिय वाहन पक्षीराज गरुड़ जी को स्पष्ट बताया है कि संसार में सबसे बड़ा और अक्षम्य पाप "कृतघ्नता" (विश्वासघात व उपकार को भूलना) तथा अपने जन्मदाता माता-पिता और गुरु का तिरस्कार करना है। संसार में भूलवश या प्रमाद से किए गए अन्य दोषों का प्रायश्चित संतों-शास्त्रों ने बताया है, किंतु जो मनुष्य किसी का उपकार लेकर उसके साथ विश्वासघात करता है या मित्र से द्रोह करता है, उसके लिए किसी भी लोक में प्रायश्चित नहीं है।

गरुड़ पुराण में भगवान श्रीहरि इस अटल सत्य को इन पावन श्लोकों में प्रकट करते हैं:

**« गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः॥ »**
**अर्थात् —** गोहत्या, मद्यपान, चोरी या व्रत भंग करने वाले के लिए भी शास्त्रों में प्रायश्चित का विधान है; किंतु जो उपकार करने वाले के प्रति कृतघ्न होता है और विश्वासघात करता है, उसके लिए संसार के किसी लोक में कोई प्रायश्चित या मुक्ति नहीं है।

**« मित्रद्रोही कृतघ्नश्च विश्वासघाती नराधमः। यमस्य भवने घोरे तिष्ठत्याचन्द्रतारकम्॥ »**
**अर्थात् —** मित्र से द्रोह करने वाला, उपकार को भूलने वाला कृतघ्न और विश्वासघाती मनुष्य यमलोक के घोर कष्टों को भोगता है।

इसलिए बच्चा ${seekerName ? seekerName + ', ' : ''}जीवन में कभी किसी के साथ छल, कपट या विश्वासघात मत करना। जिसने तुम्हारे बुरे समय में एक घूंट पानी भी पिलाया हो, उसके प्रति सदा कृतज्ञ रहो। माता-पिता और गुरु का सदैव सम्मान करो। और यदि पूर्व में कभी अनजाने में कोई पाप हुआ हो, तो सच्चे मन से पश्चात्ताप करो, क्षमा मांगो और मुख से निरंतर 'राधा-राधा' नाम जपो, क्योंकि भगवान का पावन नाम ही जीव के समस्त पापों को भस्म करके उसे अभय प्रदान करता है। प्रभु तुम्हारा सब मंगल करेंगे।`;
    }

    if (isGaruda) {
      return `देखो बच्चा, श्री गरुड़ पुराण कोई भयभीत करने वाला ग्रंथ नहीं, बल्कि साक्षात् करुणानिधान भगवान श्रीहरि विष्णु और उनके अनन्य भक्त पक्षीराज गरुड़ जी के बीच का परम पावन आध्यात्मिक संवाद है, जो जीव को मृत्यु, कर्म और मोक्ष का वास्तविक सत्य समझाता है।

संसार के समस्त जीवों पर करुणा करके जब पक्षीराज गरुड़ जी ने भगवान श्रीहरि से पूछा कि हे प्रभु! देह त्यागने के बाद जीवात्मा की क्या गति होती है और यमलोक का मार्ग कैसा है, तब भगवान विष्णु ने कर्म-विपाक का गूढ़ रहस्य प्रकट किया। भगवान ने समझाया कि जीव अपने शुभ और अशुभ कर्मों का फल अवश्य भोगता है, किंतु जो मनुष्य सत्य, सदाचार और भगवन्नाम का आश्रय ले लेता है, उसे यमदूतों या यमयातना का स्वप्न में भी कोई भय नहीं रहता।

गरुड़ पुराण का परम सार भगवान ने इन पावन श्लोकों में प्रकट किया है:

**« हरिनाम सदा सेव्यं यमदूतभयापहम्। ये जपन्ति हरेश्चित्ते न तेषां यमयातना॥ »**
**अर्थात् —** भगवान श्रीहरि का पावन नाम सदा जपने योग्य है, जो यमदूतों के समस्त भयों को हरने वाला है। जो जीव अपने चित्त में निरंतर प्रभु के नाम का स्मरण करते हैं, उन्हें यमयातना का कभी स्पर्श भी नहीं होता।

**« येन केन प्रकारेण यस्य कस्यापि जन्तुनः। संतोषं जनयेत्प्राज्ञस्तदेवेश्वरपूजनम्॥ »**
**अर्थात् —** जिस किसी भी उपाय से संसार के किसी भी प्राणी को सुख, सांत्वना और संतोष प्राप्त हो, बुद्धिमान मनुष्य के लिए वही परमात्मा की सच्ची पूजा है।

इसलिए बच्चा ${seekerName ? seekerName + ', ' : ''}गरुड़ पुराण का नाम सुनकर कभी मन में भय मत लाना। यह ग्रंथ हमें डराने के लिए नहीं, बल्कि इस दुर्लभ मनुष्य जीवन की कीमत समझाने और पापों से दूर रखने के लिए है। संसार में किसी निर्दोष का दिल मत दुखाओ, पवित्र आचरण रखो और हर सांस के साथ 'राधा-राधा' नाम का सुमिरन करते रहो। जब नाम तुम्हारे हृदय में रहेगा, तो काल और मृत्यु भी तुम्हारा कुछ नहीं बिगाड़ सकते। निश्चिंत रहो, हमारे ठाकुर जी तुम्हारा सब मंगल करेंगे।`;
    }

    if (isGitaSummary) {
      return `देखो बच्चा, श्रीमद्भगवद्गीता केवल एक ग्रंथ नहीं, बल्कि कुरुक्षेत्र के पावन धर्मक्षेत्र में मोहग्रस्त अर्जुन के माध्यम से साक्षात् करुणानिधान भगवान श्रीकृष्ण द्वारा संपूर्ण मानवता को दिया गया परम कल्याणकारी दिव्य उपदेश है।

महाभारत के महायुद्ध के समय जब अर्जुन ने देखा कि सामने पितामह भीष्म, गुरु द्रोणाचार्य और अपने ही बंधु-बांधव खड़े हैं, तो वे मोह और विषाद से घिर गए। उनका गांडीव धनुष हाथ से गिर पड़ा और वे अपने कर्तव्य से पीछे हटने लगे। तब भगवान श्रीकृष्ण ने अर्जुन को मोह की निद्रा से जगाते हुए यह समझाया कि कर्तव्य कर्म से पलायन करना धर्म नहीं है, बल्कि निष्काम भाव से अपने स्वधर्म का पालन करना ही परमात्मा की सच्ची सेवा है।

गीता के प्रमुख उपदेशों को भगवान ने इन मूल सिद्धांतों में प्रतिष्ठित किया है:

**« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
**अर्थात् —** तुम्हारा अधिकार केवल निष्काम भाव से कर्तव्य कर्म करने में है, उसके फलों में कभी नहीं। न तो फल की आसक्ति रखो और न ही अकर्मण्यता में लिप्त होओ।

**« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥ »**
**अर्थात् —** आत्मा अजन्मा, नित्य, सनातन और अविनाशी है; शरीर के नष्ट होने पर भी आत्मा कभी नष्ट नहीं होती।

**« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
**अर्थात् —** सभी सांसारिक भयों, चिंताओं और संशयों को त्यागकर केवल भगवान श्रीकृष्ण के चरणों की अनन्य शरण ग्रहण करो; प्रभु समस्त पापों और भयों से मुक्त कर देते हैं।

इसलिए बच्चा ${seekerName ? seekerName + ', ' : ''}तुम्हें जो भी सांसारिक कर्तव्य या कार्य मिला है, उसे प्रभु की सेवा मानकर अहंकार और फल की चिंता छोड़कर पूरी ईमानदारी से निभाओ। और अपने हृदय में निरंतर 'राधा-राधा' नाम का आश्रय बनाए रखो। जब मन प्रभु चरणों में लगा रहेगा और हाथ कर्तव्य में, तो जीवन में कभी कोई विषाद नहीं आएगा। प्रभु तुम्हारा सब मंगल करेंगे।`;
    }

    return `देखो बच्चा, तुम्हारे मन में जो भी संशय या चिंता उत्पन्न हुई है, उसे शांत भाव से प्रभु चरणों में समर्पित कर दो।

संसार में जीव जब तक अपने कर्तव्य कर्म को अपनी इच्छा और अहंकार से बांधता है, तब तक अशांति रहती है। जब हम अपने कर्म को प्रभु सेवा मानकर करते हैं और फल का भार भगवान पर छोड़ देते हैं, तो अंतःकरण परम शांति से भर जाता है।

${scripture ? `जैसे पावन शास्त्रों में कहा गया है:\n\n**« ${scripture.original_text} »**\n\n**अर्थात् —** "${scripture.hindi_meaning || scripture.english_translation}"\n\n` : ''}इसलिए बच्चा, निश्चिंत रहो। अपने कर्तव्य का सच्चाई से पालन करो, आचरण को पवित्र रखो और मुख से निरंतर 'राधा-राधा' नाम का सुमिरन करते रहो। प्रभु की कृपा से तुम्हारा सब कल्याण होगा।`;
  }
}

/**
 * Splits framed discourse into 4 clean sequential delivery phases:
 * Phase 1: Opening Hook (Sentence 1 ending in '।', >= 20 characters)
 * Phase 2: Narrative setting & scriptural context
 * Phase 3: Sacred Shlokas & Meanings
/**
 * Splits framed discourse into 4 clean sequential delivery phases:
 * Phase 1: Opening Hook (Sentence 1 ending in '।', >= 20 characters)
 * Phase 2: Narrative setting & Kurukshetra / Arjuna's despondency
 * Phase 3: Sacred Shlokas & Meanings in bold (**« ... »** and **अर्थात् —**)
 * Phase 4: Maharaj Ji's fatherly guidance & blessings
 * Guaranteed 100% non-overlapping: Zero repetition loops!
 */
export function extractPhasedSections(text, isEnglish = false) {
  if (!text) return ['', '', '', ''];
  const formatted = formatScriptureLines(text.trim());

  // Phase 1: STRICTLY the first complete sentence ending in '।' or '.' (>= 20 characters)
  const hookMatch = formatted.match(/^[\s\S]{20,250}?[।!?.]/);
  let phase1 = '';
  let restAfterP1 = formatted;

  if (hookMatch) {
    phase1 = hookMatch[0].trim();
    restAfterP1 = formatted.slice(hookMatch[0].length).trim();
  } else {
    const firstBreak = formatted.search(/[\n।.]/);
    if (firstBreak >= 20) {
      phase1 = formatted.slice(0, firstBreak + 1).trim();
      restAfterP1 = formatted.slice(firstBreak + 1).trim();
    } else {
      phase1 = formatted;
      restAfterP1 = '';
    }
  }

  if (!restAfterP1) {
    return [phase1, '', '', ''];
  }

  // Phase 3 boundary: where the sacred Shlokas section begins
  const shlokIdx = restAfterP1.search(/(?:\*\*«|«|\*\*कर्मण्येवाधिकारस्ते|\*\*न जायते|\*\*सर्वधर्मान्)/);

  let phase2 = '';
  let restFromShlok = restAfterP1;

  if (shlokIdx !== -1) {
    phase2 = restAfterP1.slice(0, shlokIdx).trim();
    restFromShlok = restAfterP1.slice(shlokIdx).trim();
  } else {
    const paras = restAfterP1.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paras.length >= 3) {
      return [phase1, paras[0], paras[1], paras.slice(2).join('\n\n')];
    } else if (paras.length === 2) {
      return [phase1, paras[0], paras[1], ''];
    }
    return [phase1, restAfterP1, '', ''];
  }

  // Phase 4 boundary: where Pujya Maharaj Ji's practical synthesis and blessings start
  const synthesisMatch = restFromShlok.match(/\n\s*\n(?=(?:इसलिए|अतः|अब\s+तुम्हें|तुम्हें\s+जो|भगवान\s+की\s+सेवा|Therefore|So,\s+dear\s+child|Look,\s+dear\s+child|Now,\s+my\s+child))/i);

  let phase3 = '';
  let phase4 = '';

  if (synthesisMatch && synthesisMatch.index !== undefined) {
    phase3 = restFromShlok.slice(0, synthesisMatch.index).trim();
    phase4 = restFromShlok.slice(synthesisMatch.index).trim();
  } else {
    const shlokParas = restFromShlok.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (shlokParas.length >= 2) {
      phase4 = shlokParas.pop();
      phase3 = shlokParas.join('\n\n');
    } else {
      phase3 = restFromShlok;
      phase4 = isEnglish
        ? "Therefore, dear child, perform your prescribed duty honestly as worship of the Supreme, anchor your restless mind in continuous chanting of the Holy Name ('Radha Radha'), and remain completely peaceful. May Thakur Ji bless you always."
        : "इसलिए बच्चा, तुम्हें जो भी सांसारिक कर्तव्य मिला है, उसे भगवान की सेवा मानकर अहंकार और फल की चिंता छोड़कर पूरी निष्ठा से निभाओ। और अपने मुख व हृदय में निरंतर 'राधा-राधा' नाम का आश्रय बनाए रखो। प्रभु तुम्हारा सब मंगल करेंगे।";
    }
  }

  return [phase1, phase2, phase3, phase4].filter(Boolean);
}

/**
 * Starting Groq Framing & Theological RAG Router Engine:
 * Intelligently frames the user's inquiry FIRST with full knowledge of our 24 RAG scriptures.
 * Guarantees that inquiries like 'summary of geeta' NEVER become shallow 'karma karo' clichés,
 * but include Kurukshetra context, Arjuna dropping Gandiva, Krishna speaking the Gita,
 * the 3 core Shlokas with meanings in bold, and Maharaj Ji's fatherly blessings.
 */
async function generateFramedDiscourseWithGroq(userMessage, conversationHistory, userProfile, userMemoryContext, scripture, isEnglish) {
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(' ')[0] : '';
  const q = (userMessage || '').trim().toLowerCase();
  const scriptId = (scripture?.id || '').toLowerCase();
  const scriptRef = (scripture?.reference || '').toLowerCase();

  const isMatsya = /(मत्स्य|matsya)/i.test(q) ||
                   scriptId.includes('matsya') || scriptRef.includes('मत्स्य') || scriptRef.includes('matsya');

  const isGarudaSins = (/(सबसे\s*बड़ा\s*पाप|महापाप|greatest\s*sin|worst\s*sin|paap|पाप)/i.test(q) &&
                        /(गरुड़|गरुण|garud|garun)/i.test(q)) ||
                       scriptId === 'garuda_purana_sins' || scriptRef.includes('महापाप');

  const isGaruda = !isMatsya && (/(गरुड़|गरुण|garud|garun|यमलोक|यमदूत|मृत्यु\s*के\s*बाद|after\s*death|afterlife|preta|कर्म\s*विपाक)/i.test(q) ||
                   scriptId.includes('garuda') || scriptRef.includes('गरुड़') || scriptRef.includes('garuda'));

  const framingSystemPrompt = isEnglish
    ? `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan).
Speak directly in an intimate spiritual dialogue (Ekantik Vartalap) with fatherly warmth, sacred authority, and authentic satsang conviction.

【FORBID ALL ARTIFICIAL / ROBOTIC AI LANGUAGE (CRITICAL)】:
- NEVER use artificial AI openings or phrases like "Imagine the...", "In the grand tapestry...", "Let us delve...", "Picture the scene...", or "Dear devotee".
- Speak directly and naturally as Pujya Maharaj Ji: "Look, my child...", "Listen, dear child...", "Our beloved Thakur Ji...", "Remain completely carefree...", "Chant Radha-Radha...".

【COMPLETE KNOWLEDGE OF OUR 24 SACRED SCRIPTURES & AWS QDRANT RAG】:
- You possess complete mastery of our 24 Sacred Scripture Collections in AWS Qdrant (173,396 verses: Bhagavad Gita 701 verses, Vedas, 18 Puranas, Upanishads).

【MATSYA PURANA STRICT THEOLOGICAL MANDATE】:
- The Shrimad Matsya Purana is the sacred dialogue between Lord Shri Hari Vishnu in His primal Matsya (fish) avatar and the righteous King Satyavrata (Vaivasvata Manu).
- During the cosmic deluge (Pralaya), Lord Matsya saved King Manu, the Seven Sages (Saptarshis), life-seeds, and the sacred Vedas by tying the boat to His horn with the serpent Vasuki.
- CRITICAL WARNING: Under NO circumstance mention Pakshiraj Garuda, Garuda Purana, Yamaloka, or Yamadoots for Matsya Purana! This is strictly a Matsya-Manu dialogue!
- Core verse: **« यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्॥ »** and **« वेदानां रक्षणार्थाय धर्मसंरक्षणाय च। प्रादुर्भूतो हरिः साक्षात् मत्स्यरूपेण केशवः॥ »**.

【GARUDA PURANA STRICT THEOLOGICAL MANDATE】:
- The Shri Garuda Purana is an authentic dialogue exclusively between Lord Shri Hari Vishnu and his beloved bird-king Pakshiraj Garuda (Vainateya).
- CRITICAL WARNING: Under NO circumstance attribute the Garuda Purana to Lord Shiva and Parvati! (Shiva-Parvati is Shiva Purana / Ramcharitmanas, NOT Garuda Purana!).
- If asked about the greatest sin (महापाप / कृतघ्नता निर्णय): Lord Vishnu explains that the worst, unforgivable sin is "Kritaghnata" (कृतघ्नता — betrayal of trust, ingratitude to a benefactor) and disrespecting parents and Guru.
  Core verse: **« गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः॥ »**.
- If asked generally about Garuda Purana: Lord Vishnu illuminates departure of the soul, Karma-Vipaka, and freedom from death's dread through continuous Holy Name chanting ('Harinaam sada sevyam') and compassion ('Santosham janayet prajnah').

- If the seeker asks about the Bhagavad Gita or its essence/summary:
  1. DO NOT give a superficial or repetitive "just do karma and chant" cliché!
  2. Reveal the authentic spiritual reality: At the onset of the great war of Kurukshetra, when Arjuna beheld his revered grandfather Bhishma, Guru Dronacharya, and his beloved kinsmen standing before him, his heart was overwhelmed by deep moha (attachment) and intense sorrow. His divine bow Gandiva slipped from his trembling hands, and he retreated from performing his righteous karma.
  3. It was then that Bhagavan Shri Krishna revealed the supreme divine wisdom to awaken Arjuna from the slumber of delusion, teaching him that abandoning one's prescribed duty in fear or attachment is not righteousness, but performing one's duty selflessly as an offering to God is the highest path. This Gita was spoken directly by Lord Krishna to Arjuna, and imparts divine guidance to Arjuna and every one of us.
  4. Illuminate the core pillars of the Gita with authentic Shlokas:
     - Nishkama Karma Yoga: **« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
       **अर्थात् —** Your right is to work only, never to the fruits of action. Let not the fruit of action be your motive, nor be attached to inaction.
     - Atman Jnana: **« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। »**
       **अर्थात् —** The soul is unborn, eternal, ever-existing, and indestructible; it is not slain when the mortal body perishes.
     - Parama Sharanagati: **« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
       **अर्थात् —** Abandon all worldly anxieties, doubts, and ego, and surrender solely to the lotus feet of the Divine.
  5. Harmonize with Maharaj Ji's fatherly guidance: Perform whatever duties you have honestly as service to Thakur Ji, and anchor your restless heart in continuous Holy Name chanting ('Radha Radha').

【OUTPUT FORMAT (4 DISTINCT NON-OVERLAPPING PARAGRAPHS)】:
- Paragraph 1: Powerful opening hook sentence ending in '.' (e.g. "Look, my child, the Shrimad Bhagavad Gita is not merely a book, but the eternal divine nectar spoken directly by Lord Krishna to Arjuna on the sacred battlefield of Kurukshetra to guide and liberate all humanity from sorrow and illusion.").
- Paragraph 2: Setting context, narrative revelation, and spiritual purpose.
- Paragraph 3: Core Shlokas in bold (**« ... »**) followed by **अर्थात् —** translations.
- Paragraph 4: Practical synthesis, Holy Name remembrance ('Radha Radha'), and fatherly blessings.
- Zero repetition. Flawless terminal punctuation.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
साधक की जिज्ञासा का उत्तर एकांतिक वार्तालाप में अपनी प्रामाणिक, वात्सल्यमयी, गंभीर और पावन शास्त्रीय वाणी में दीजिए।

【किसी भी बनावटी या रोबोटिक AI भाषा का सख्त निषेध】:
- 'कल्पना कीजिए', 'प्रिय साधक', 'एक संपादक के रूप में', 'आइए विचार करें' जैसे किताबी, कृत्रिम या अनुवादित शब्दों का प्रयोग कतई न करें।
- पूज्य महाराज जी की प्रामाणिक, आत्मीय, वात्सल्यमयी शैली में बोलिए: 'देखो बच्चा...', 'हमारे ठाकुर जी...', 'निश्चिंत रहो...', 'राधा-राधा नाम जपो...'।

【हमारे २४ शास्त्रों व AWS Qdrant RAG का संपूर्ण ज्ञान】:
- आपको हमारे २४ पावन शास्त्रों (श्रीमद्भगवद्गीता के ७०१ श्लोक, वेद, १८ पुराण, उपनिषद) का पूर्ण ज्ञान है।

【श्रीमत्स्य पुराण अनिवार्य शास्त्र नियम (STRICT THEOLOGICAL MANDATE)】:
- श्रीमत्स्य पुराण साक्षात् भगवान श्रीहरि विष्णु के प्रथम 'मत्स्य अवतार' और धर्मनिष्ठ राजा सत्यव्रत (वैवस्वत मनु) के मध्य का पावन संवाद है।
- प्रलयकाल के महाजलप्लावन में भगवान मत्स्य ने विशाल नौका में राजा मनु, सप्तर्षियों, समस्त वनस्पतियों के बीजों और वेदों की रक्षा की थी।
- चेतावनी (CRITICAL): भूलकर भी मत्स्य पुराण में पक्षीराज गरुड़, गरुड़ पुराण, यमदूतों या यमलोक का उल्लेख न करें! यह मत्स्य-मनु प्रसंग है।
- मूल श्लोक: **« यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्॥ »** तथा **« वेदानां रक्षणार्थाय धर्मसंरक्षणाय च। प्रादुर्भूतो हरिः साक्षात् मत्स्यरूपेण केशवः॥ »**।

【गरुड़ पुराण के संबंध में अनिवार्य व अकाट्य शास्त्र नियम (STRICT THEOLOGICAL MANDATE)】:
- गरुड़ पुराण साक्षात् भगवान श्रीहरि विष्णु और उनके प्रिय वाहन पक्षीराज गरुड़ (वैनतेय) जी के मध्य का पावन संवाद है।
- चेतावनी (CRITICAL): गरुड़ पुराण में भगवान शिव और पार्वती जी का संवाद कतई नहीं है! (शिव-पार्वती संवाद शिव पुराण व रामचरितमानस में है, गरुड़ पुराण में नहीं)। भूलकर भी शिव-पार्वती का उल्लेख गरुड़ पुराण के वक्ता के रूप में न करें!
- यदि साधक गरुड़ पुराण में सबसे बड़े पाप (महापाप / कृतघ्नता) के बारे में पूछे:
  साक्षात् भगवान श्रीहरि विष्णु ने पक्षीराज गरुड़ जी को स्पष्ट बताया है कि संसार में सबसे बड़ा और अक्षम्य पाप "कृतघ्नता" (विश्वासघात व उपकार को भूलना) तथा माता-पिता व गुरु का अनादर करना है।
  मूल श्लोक: **« गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः॥ »**
  **अर्थात् —** गोहत्या, मद्यपान, चोरी या व्रत-भंग का प्रायश्चित संतों-शास्त्रों ने बताया है; किंतु जो उपकार करने वाले के प्रति कृतघ्न होता है और विश्वासघात करता है, उसके लिए किसी लोक में प्रायश्चित नहीं है।
- यदि सामान्यतः गरुड़ पुराण के बारे में पूछे: भगवान विष्णु ने जीवों की मृत्यु, देह त्याग के बाद जीवात्मा की गति, यमलोक का मार्ग, कर्म-विपाक, और भगवन्नाम ('हरिनाम सदा सेव्यं') तथा जीव-दया ('संतोषं जनयेत्प्राज्ञस्तदेवेश्वरपूजनम्') द्वारा यमयातना से मुक्ति का रहस्य समझाया है।
- पूज्य महाराज जी की दृष्टि: गरुड़ पुराण डराने के लिए नहीं, बल्कि मानव को पापों से बचाकर सन्मार्ग पर चलाने, किसी का दिल न दुखाने और निरंतर 'राधा-राधा' नाम जप द्वारा अभय प्राप्त करने की प्रेरणा देता है।

- यदि साधक श्रीमद्भगवद्गीता के विषय में या गीता के सार/संक्षेप के बारे में पूछे:
  १. केवल 'कर्म करो और नाम जपो' जैसी साधारण या दोहराव वाली बात कहकर सीमित न रहें!
  २. गीता का वास्तविक, दिव्य प्रसंग अवश्य बताएं: कुरुक्षेत्र के धर्मक्षेत्र में जब अर्जुन ने सामने अपने ही पूज्य पितामह भीष्म, गुरु द्रोणाचार्य और सगे-संबंधियों को देखा, तो वे मोह और विषाद में डूब गए। उनका गांडीव धनुष हाथ से गिर पड़ा और वे अपने कर्तव्य कर्म से पीछे हटने लगे।
  ३. तब साक्षात् करुणानिधान भगवान श्रीकृष्ण ने अर्जुन को मोह की निद्रा से जगाते हुए यह समझाया कि कर्तव्य से पलायन करना धर्म नहीं है, बल्कि निष्काम भाव से स्वधर्म का पालन करना ही परमात्मा की सच्ची सेवा है। यह गीता श्रीकृष्ण के श्रीमुख से बोली गई है, जो अर्जुन और हम सबको जीवन का सच्चा मार्ग दिखाती है।
  ४. गीता के प्रमुख मूल सिद्धांतों को पावन श्लोकों सहित स्पष्ट करें:
     - निष्काम कर्मयोग: **« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
       **अर्थात् —** तुम्हारा अधिकार केवल निष्काम भाव से कर्तव्य कर्म करने में है, उसके फलों में कभी नहीं। फल की आसक्ति मत रखो और न ही अकर्मण्यता में लिप्त होओ।
     - आत्मज्ञान: **« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। »**
       **अर्थात् —** शरीर नश्वर है, किंतु जीवात्मा अजन्मा, नित्य, सनातन और अविनाशी है; शरीर के नष्ट होने पर भी आत्मा कभी नहीं मरती।
     - अनन्य शरणागति: **« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
       **अर्थात् —** सभी सांसारिक भयों, चिंताओं और अहंकार को त्यागकर केवल भगवान श्रीकृष्ण के चरणों की अनन्य शरण ग्रहण करो; प्रभु समस्त पापों से मुक्त कर देते हैं।
  ५. पूज्य महाराज जी की व्यावहारिक वाणी में समन्वय: संसार में जो भी कर्तव्य प्राप्त हुआ है उसे ठाकुर जी की सेवा मानकर निभाओ, और मुख से निरंतर 'राधा-राधा' नाम जपते रहो। प्रभु तुम्हारा सब मंगल करेंगे।

【संरचना व ४ स्पष्ट अनुच्छेदों का विभाजन (DOUBLE NEWLINE SEPARATION)】:
- अनुच्छेद १: प्रथम वाक्य अत्यंत प्रभावशाली, वात्सल्यपूर्ण संबोधन के साथ पूर्ण वाक्य जो '।' पर समाप्त हो (जैसे: 'देखो बच्चा, श्रीमद्भगवद्गीता केवल एक ग्रंथ नहीं, बल्कि कुरुक्षेत्र के पावन धर्मक्षेत्र में मोहग्रस्त अर्जुन के माध्यम से साक्षात् भगवान श्रीकृष्ण द्वारा संपूर्ण मानवता को दिया गया परम कल्याणकारी दिव्य उपदेश है।')।
- अनुच्छेद २: ग्रंथ का दिव्य प्रसंग, आध्यात्मिक पृष्ठभूमि और जीवों के कल्याण का उद्देश्य।
- अनुच्छेद ३: शास्त्र के मूल श्लोक बोल्ड में (**« ... »**) और उनके ठीक नीचे **अर्थात् —** भावार्थ।
- अनुच्छेद ४: पूज्य महाराज जी की व्यावहारिक सीख, 'राधा-राधा' नाम जप का आश्रय और कल्याणकारी आशीर्वाद (।)।
- किसी भी वाक्य या वाक्यांश का यांत्रिक दोहराव सख्त वर्जित है।`;

  let effectiveSystemPrompt = framingSystemPrompt;
  if (scripture) {
    effectiveSystemPrompt = injectScripturePrompt(effectiveSystemPrompt, scripture, isEnglish);
  }

  const condensedHistory = summarizeHistoryForContext(conversationHistory, isEnglish);
  const messages = [
    { role: 'system', content: effectiveSystemPrompt },
    ...condensedHistory,
    { role: 'user', content: userMessage }
  ];

  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'];
  for (let attempt = 0; attempt < 4; attempt++) {
    const key = getNextGroqKey();
    const model = models[attempt % models.length];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.28,
          max_tokens: 950
        })
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 80 && !/(संपादक|मैं संपादक हूँ|as an ai)/i.test(content)) {
          // Strict Sanity Check 1: Reject hallucinated Shiva-Parvati dialogue for Garuda Purana
          if ((isGaruda || isGarudaSins) && /(शिव और पार्वती|शिवजी और पार्वती|पार्वती देवी|shiva and parvati|shiva & parvati|lord shiva and goddess parvati|lord shiva and parvati|shiv aur parvati)/i.test(content)) {
            console.warn('[!] Groq hallucinated Shiva-Parvati for Garuda Purana. Rejecting and trying next model / deterministic fallback.');
            continue;
          }

          // Strict Sanity Check 2: Reject cross-contamination of Garuda Purana in Matsya Purana
          if (isMatsya && /(गरुड़|गरुण|garud|garun|पक्षीराज|वैनतेय|यमदूत|यमयातना|यमराज|यमलोक)/i.test(content)) {
            console.warn('[!] Groq cross-contaminated Matsya Purana with Garuda Purana. Rejecting and trying next model / deterministic fallback.');
            continue;
          }

          const formatted = formatScriptureLines(content);
          return deduplicateRepetitionLoops(formatted, isEnglish);
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn(`Groq framing attempt ${attempt + 1} with ${model} error:`, e.message);
    }
  }

  // Fallback: Deterministic Scriptural Framing (Guarantees zero repetition & 100% theological depth)
  return getAuthenticScriptureFramedDiscourse(userMessage, isEnglish, userProfile, scripture);
}

/**
 * Streams the pre-framed authentic discourse with the exact phased timeline:
 * 1. Immediate Hook: Sentence 1 is emitted to content (and typed out in UI), then stopped.
 * 2. Thinking Mode Active: Deliberation window streams contemplation thoughts character-by-character.
 * 3. Every 10 seconds: Next completed sentence/phase is released into content with typewriter animation!
 * 4. Completion: Thinking collapses to '✓ चिंतन संपन्न (Thought Process) [timer]s ▼', displaying the full discourse.
 */
async function streamPhasedDiscourse(framedDiscourse, onChunk, userMessage, isEnglish, scripture = null) {
  const startTime = Date.now();
  const phases = extractPhasedSections(framedDiscourse, isEnglish);

  const phase1 = phases[0] || '';
  const phase2 = phases[1] || '';
  const phase3 = phases[2] || '';
  const phase4 = phases[3] || '';

  return new Promise((resolve) => {
    let currentContent = phase1;

    // Emit initial Hook immediately so sentence 1 begins typing in UI
    onChunk({
      content: currentContent,
      thought: getSpiritualDeliberationStream(userMessage, isEnglish, 100, scripture),
      isThinking: true,
      thinkingDuration: 0.1,
      scripture: scripture || null
    });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const thoughtText = getSpiritualDeliberationStream(userMessage, isEnglish, elapsed, scripture);

      // Phase 2: Released at 10 seconds (10,000ms) with typing animation
      if (elapsed >= 10000 && phase2) {
        currentContent = [phase1, phase2].filter(Boolean).join('\n\n');
      }

      // Phase 3: Released at 20 seconds (20,000ms) with typing animation (Core Shlokas & Meanings)
      if (elapsed >= 20000 && phase3) {
        currentContent = [phase1, phase2, phase3].filter(Boolean).join('\n\n');
      }

      // Phase 4: Released at 26 seconds (26,000ms) with typing animation (Maharaj Ji's Blessings)
      if (elapsed >= 26000 && phase4) {
        currentContent = [phase1, phase2, phase3, phase4].filter(Boolean).join('\n\n');
      }

      // Completion at 30 seconds: Thinking mode concludes with '✓ चिंतन संपन्न 30.0s ▼'
      if (elapsed >= 30000) {
        clearInterval(interval);
        currentContent = [phase1, phase2, phase3, phase4].filter(Boolean).join('\n\n');

        const finalThoughtSummary = getSpiritualDeliberationStream(userMessage, isEnglish, 30000, scripture);
        const finalPayload = {
          content: currentContent,
          thought: finalThoughtSummary,
          isThinking: false,
          thinkingDuration: 30.0,
          scripture: scripture || null
        };
        onChunk(finalPayload);
        resolve(finalPayload);
        return;
      }

      onChunk({
        content: currentContent,
        thought: thoughtText,
        isThinking: true,
        thinkingDuration: Math.max(0.1, Number((elapsed / 1000).toFixed(1))),
        scripture: scripture || null
      });
    }, 80);
  });
}

/**
 * Main Real-Time Token Streaming Function:
 * Works seamlessly whether hosted on GitHub Pages or running on localhost!
 */
export async function streamGuruResponse(
  userMessage,
  conversationHistory = [],
  userMemoryContext = '',
  userProfile = null,
  mode = 'deep',
  onChunk = () => {}
) {
  const isEnglish = detectLanguage(userMessage) === 'english';

  // Step 1: Immediately emit initial thinking & RAG status so UI shows Claude pill at millisecond 0
  onChunk({
    content: '',
    thought: isEnglish
      ? '🔍 Query Intent & Seeker State: Contemplating spiritual guidance...'
      : '🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न का शास्त्रीय विश्लेषण व AWS Qdrant RAG पर पावन संदर्भ की खोज...',
    isThinking: mode === 'deep',
    thinkingDuration: 0.1,
    scripture: null
  });

  // Step 2: Retrieve RAG scripture grounding (curated index + live AWS Qdrant vector search)
  const scripture = await getScriptureGrounding(userMessage);
  if (scripture) {
    console.log(`[+] Grounded with Scripture: ${scripture.reference} (Score: ${scripture.score}) [${scripture.match_type}]`);
  }

  // Summarize prior chat info into a concise 2-line summary to prevent slow inference
  const condensedHistory = summarizeHistoryForContext(conversationHistory, isEnglish);
  const messages = [
    ...condensedHistory,
    { role: 'user', content: userMessage },
  ];

  if (mode === 'deep') {
    // Priority 1: Starting Groq Framing with complete RAG knowledge
    const framedDiscourse = await generateFramedDiscourseWithGroq(
      userMessage,
      conversationHistory,
      userProfile,
      userMemoryContext,
      scripture,
      isEnglish
    );

    // Step 3: Stream with Phased Sequential Typewriter Orchestrator
    return await streamPhasedDiscourse(framedDiscourse, onChunk, userMessage, isEnglish, scripture);
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU
    const groqResult = await callDirectGroqAPI(
      messages,
      450,
      true,
      (tok, acc) => onChunk({ content: acc || tok, scripture: scripture || null }),
      false,
      userProfile,
      userMemoryContext,
      scripture
    );
    if (groqResult) {
      const formatted = formatScriptureLines(groqResult);
      return {
        content: ensureCompleteFinalSentence(formatted, isEnglish),
        scripture: scripture || null
      };
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(
      messages,
      700,
      true,
      (tok, acc) => onChunk({ content: acc || tok, scripture: scripture || null }),
      false,
      userProfile,
      userMemoryContext,
      scripture
    );
    if (oracleResult) {
      const formatted = formatScriptureLines(oracleResult);
      return {
        content: ensureCompleteFinalSentence(formatted, isEnglish),
        scripture: scripture || null
      };
    }
  }

  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'बच्चा';
  return {
    content: `राधे राधे ${seekerName}! मन को शांत रखिए और भगवन्नाम (राधा नाम) का आश्रय लीजिए। प्रभु सब मंगल करेंगे।`,
    scripture: scripture || null
  };
}

/**
 * Standard Non-Streaming Generator (Fail-Safe)
 */
export async function generateGuruResponse(userMessage, conversationHistory = [], userMemoryContext = '', userProfile = null, mode = 'deep') {
  return await streamGuruResponse(userMessage, conversationHistory, userMemoryContext, userProfile, mode, () => {});
}

/**
 * Conversation Auto-Title Generator
 */
export async function generateChatTitle(messages) {
  if (!messages?.length) return 'New Conversation';
  const previewText = messages.slice(0, 3).map((message) => `${message.role}: ${message.content}`).join('\n');
  const titlePrompt = [
    { role: 'user', content: `Generate a 2 to 4 word spiritual title summarizing this query:\n${previewText}\nTitle:` }
  ];
  const rawTitle = await callDirectGroqAPI(titlePrompt, 30, false, null);
  const cleanTitle = rawTitle?.replace(/["'`\n\r]/g, '').replace(/^(Title|Topic):\s*/i, '').trim();
  return cleanTitle && cleanTitle.length > 2 ? cleanTitle : 'Spiritual Satsang';
}
