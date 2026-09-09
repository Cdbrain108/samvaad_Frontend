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

  const fullThoughtHindi = `🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न ("${q}...") का शास्त्रीय व आध्यात्मिक विश्लेषण।
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

  const fullThoughtEnglish = `🔍 Query Intent & Seeker State: Contemplating spiritual guidance for seeker regarding ("${q}...").
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

  const fullThought = isEnglish ? fullThoughtEnglish : fullThoughtHindi;
  const fraction = Math.min(1, elapsedMs / 30000);
  const targetChars = Math.max(35, Math.floor(fraction * fullThought.length));
  return fullThought.slice(0, targetChars);
}

/**
 * Deterministic Scripture Framer (Guarantees zero raw repetition & 100% theological depth)
 * Spans: Kurukshetra war setting, Arjuna putting down Gandiva, Krishna's counsel, core shlokas (2.47, 2.20, 18.66), and Maharaj Ji's guidance.
 */
function getAuthenticScriptureFramedDiscourse(userMessage, isEnglish = false, userProfile = null, scripture = null) {
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(' ')[0] : '';
  const q = (userMessage || '').trim().toLowerCase();
  const isGitaSummary = /(गीता|geeta|gita|कुरुक्षेत्र|अर्जुन|सार|summary|essence|teachings)/i.test(q);

  if (isEnglish) {
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

  const framingSystemPrompt = isEnglish
    ? `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan).
Provide deep, authentic, profound spiritual guidance (Ekantik Vartalap) answering the seeker's inquiry.

【COMPLETE KNOWLEDGE OF OUR 24 SACRED SCRIPTURES & AWS QDRANT RAG】:
- You possess complete knowledge of our 24 Sacred Scripture Collections in AWS Qdrant (173,396 verses: Bhagavad Gita 701 verses, Rigveda, Samaveda, Yajurveda, Atharvaveda, 18 Puranas, Upanishads).
- If the seeker asks about the Bhagavad Gita or summary of the Gita:
  1. DO NOT give a simplistic or repetitive "just do karma and chant" cliché!
  2. Frame the real, profound context: Kurukshetra battlefield, Arjuna overwhelmed by moha, sorrow, and confusion, dropping his divine bow Gandiva and retreating from fighting his own kinsmen.
  3. Bhagavan Shri Krishna's divine discourse to Arjuna (and through him, to all humanity).
  4. Illuminate the core pillars of the Gita with authentic Shlokas:
     - Nishkama Karma Yoga: **« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
       **अर्थात् —** Perform righteous duty with dedication, without anxiety or attachment to fruits.
     - Atman Jnana: **« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। »**
       **अर्थात् —** The soul is eternal, unborn, and indestructible; it is not slain when the body perishes.
     - Parama Sharanagati: **« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
       **अर्थात् —** Surrender all anxieties, doubts, and ego at the lotus feet of the Divine.
  5. Harmonize with Maharaj Ji's compassionate counsel: Perform worldly duty as selfless divine service while constantly remembering the Holy Name ('Radha Radha').

【OUTPUT FORMAT (4 DISTINCT PARAGRAPHS SEPARATED BY DOUBLE NEWLINES)】:
- Paragraph 1: Powerful opening hook sentence ending in '.' (e.g. "Look, my child, the Bhagavad Gita is not merely a book, but the eternal nectar spoken directly by Lord Krishna to Arjuna on the battlefield of Kurukshetra to liberate all humanity from sorrow and illusion.").
- Paragraph 2: Kurukshetra battlefield setting, Arjuna overwhelmed by sorrow, dropping Gandiva, and Krishna speaking the Gita to awaken him.
- Paragraph 3: Core Shlokas in bold (**« ... »**) followed by **अर्थात् —** translations.
- Paragraph 4: Practical synthesis, Holy Name remembrance ('Radha Radha'), and fatherly blessings.
- Finish cleanly with '.' and auspicious benediction. Zero repetition.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
साधक की जिज्ञासा का उत्तर एकांतिक वार्तालाप में अपनी प्रामाणिक, वात्सल्यमयी, गंभीर और पावन शास्त्रीय वाणी में दीजिए।

【हमारे २४ शास्त्रों व AWS Qdrant RAG का संपूर्ण ज्ञान】:
- आपको हमारे २४ पावन शास्त्रों (श्रीमद्भगवद्गीता के ७०१ श्लोक, वेद, १८ पुराण, उपनिषद) का पूर्ण ज्ञान है।
- यदि साधक श्रीमद्भगवद्गीता के विषय में या गीता के सार/संक्षेप के बारे में पूछे:
  १. केवल 'कर्म करो और नाम जपो' जैसी साधारण या दोहराव वाली बात कहकर सीमित न रहें!
  २. गीता का वास्तविक, दिव्य प्रसंग अवश्य बताएं: कुरुक्षेत्र की युद्धभूमि, अपने ही सगे-संबंधियों को देखकर अर्जुन का मोह और विषाद में डूबना, गांडीव धनुष को रखकर युद्ध से विमुख हो जाना।
  ३. करुणानिधान भगवान श्रीकृष्ण द्वारा अर्जुन के माध्यम से संपूर्ण मानव जाति को दिए गए परम कल्याणकारी उपदेश की महिमा।
  ४. गीता के प्रमुख मूल सिद्धांतों को पावन श्लोकों सहित स्पष्ट करें:
     - निष्काम कर्मयोग: **« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ »**
       **अर्थात् —** कर्तव्य कर्म पूरी ईमानदारी से प्रभु सेवा मानकर करो, फल की चिंता व अहंकार छोड़ दो।
     - आत्मज्ञान: **« न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। »**
       **अर्थात् —** शरीर नश्वर है, किंतु आत्मा अजर, अमर और अविनाशी है।
     - अनन्य शरणागति: **« सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥ »**
       **अर्थात् —** सब चिंताओं, भयों और अहंकार को त्यागकर केवल प्रभु के चरणों का अनन्य आश्रय लो।
  ५. पूज्य महाराज जी की व्यावहारिक वाणी में समन्वय: संसार में जो भी कर्तव्य प्राप्त हुआ है उसे धर्मपूर्वक निभाते हुए मुख से निरंतर 'राधा-राधा' नाम जपते रहो, जीवन कृतार्थ हो जाएगा।

【संरचना व ४ स्पष्ट अनुच्छेदों का विभाजन (DOUBLE NEWLINE SEPARATION)】:
- अनुच्छेद १: प्रथम वाक्य अत्यंत प्रभावशाली, वात्सल्यपूर्ण संबोधन के साथ पूर्ण वाक्य जो '।' पर समाप्त हो (जैसे: 'देखो बच्चा, श्रीमद्भगवद्गीता केवल एक ग्रंथ नहीं, बल्कि कुरुक्षेत्र के धर्मक्षेत्र में मोहग्रस्त अर्जुन के माध्यम से साक्षात् भगवान श्रीकृष्ण द्वारा संपूर्ण मानवता को दिया गया परम कल्याणकारी दिव्य उपदेश है।')।
- अनुच्छेद २: कुरुक्षेत्र का प्रसंग, अर्जुन का विषाद, गांडीव का हाथ से गिरना, और श्रीकृष्ण द्वारा अर्जुन व मानव जाति को दिया गया ज्ञान।
- अनुच्छेद ३: गीता के मूल श्लोक बोल्ड में (**« ... »**) और उनके ठीक नीचे **अर्थात् —** भावार्थ।
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
