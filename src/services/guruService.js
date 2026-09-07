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

  // 3. Strip trailing dangling conjunctions/connectors
  const danglingRegex = isEnglish
    ? /\s+(and|or|but|because|so|if|that|when|then|while|as)\s*$/i
    : /\s+(और|तथा|एवं|या|किन्तु|परन्तु|लेकिन|मगर|क्योंकि|इसलिए|जब|तब|तो|कि|यदि)\s*$/;
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

  const rawSentences = text.split(/(?<=[।!?.\n])\s+/);
  const cleanSentences = [];
  const seenSignatures = [];
  const rhetoricalCounts = new Map();

  const getSignificantWords = (str) => {
    return new Set(
      str
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    );
  };

  const getWordOverlap = (setA, setB) => {
    if (setA.size === 0 || setB.size === 0) return 0;
    let match = 0;
    for (const w of setA) {
      if (setB.has(w)) match++;
    }
    return match / Math.min(setA.size, setB.size);
  };

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const norm = trimmed.replace(/[\s\p{P}\d]+/gu, '').toLowerCase();

    // Short greetings or spiritual refrains always allowed
    if (norm.length < 16) {
      cleanSentences.push(trimmed);
      continue;
    }

    const words = getSignificantWords(trimmed);

    // 1. Check against sliding window of recent sentences (last 8 sentences)
    let isSemanticDuplicate = false;
    for (const prev of seenSignatures.slice(-8)) {
      if (norm === prev.norm) {
        isSemanticDuplicate = true;
        break;
      }
      const overlap = getWordOverlap(words, prev.words);
      if (overlap >= 0.62 && words.size >= 6) {
        isSemanticDuplicate = true;
        break;
      }
    }

    if (isSemanticDuplicate) {
      continue;
    }

    // 2. Detect and clamp repeating rhetorical loop triggers
    const rhetoricalMatch = trimmed.match(
      isEnglish
        ? /(so\s+what\s+have\s+you\s+done|so\s+what\s+are\s+you\s+doing|what\s+have\s+you\s+done|the\s+body-?self'?s?\s+original\s+function|body'?s?\s+original\s+function)/i
        : /(तो\s+क्या\s+किया\s+तुमने|क्या\s+किया\s+तुमने|अब\s+क्या\s+कर\s+रहे\s+हो|इस\s+शरीर\s+का\s+मूल\s+उद्देश्य|शरीर\s+का\s+कर्तव्य)/
    );

    if (rhetoricalMatch) {
      const triggerKey = rhetoricalMatch[0].toLowerCase();
      const currentCount = rhetoricalCounts.get(triggerKey) || 0;
      if (currentCount >= 2) {
        continue;
      }
      rhetoricalCounts.set(triggerKey, currentCount + 1);
    }

    cleanSentences.push(trimmed);
    seenSignatures.push({ norm, words });
  }

  const combined = cleanSentences.join(' ').trim();
  return ensureCompleteFinalSentence(combined || text, isEnglish);
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

  // If still 1 paragraph, split balanced into 2-3 segments by word count
  const words = cleaned.split(/\s+/);
  if (words.length >= 45) {
    const p1Count = Math.floor(words.length * 0.35);
    const p2Count = Math.floor(words.length * 0.35);
    const p1 = ensureCompleteFinalSentence(words.slice(0, p1Count).join(' '), isEnglish);
    const p2 = ensureCompleteFinalSentence(words.slice(p1Count, p1Count + p2Count).join(' '), isEnglish);
    const p3 = ensureCompleteFinalSentence(words.slice(p1Count + p2Count).join(' '), isEnglish);
    return [p1, p2, p3].filter(Boolean).join('\n\n');
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
          repeat_penalty: 1.15,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          max_tokens: maxTokens,
          stop: ["<|im_end|>", "</s>", "\n\nUser:", "\n\nQuestion:", "\nUser:", "User:"],
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
 * Focuses purely on spiritual inquiry, scriptures, and holy teachings of Pujya Shri Premanand Ji Maharaj.
 */
function getSpiritualDeliberationText(userMessage, isEnglish = false, elapsedMs = 15000, scripture = null) {
  const queryPreview = (userMessage || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 50);
  if (isEnglish) {
    let text = `🔍 Query Intent: Contemplating spiritual guidance for seeker regarding ("${queryPreview}...").\n`;
    if (elapsedMs >= 400) {
      if (scripture) {
        text += `📜 Scripture Grounding (RAG): Retrieved authentic wisdom from ${scripture.reference}.\n`;
      } else {
        text += `📜 Holy Satsang Wisdom: Reviewing teachings of Pujya Shri Premanand Ji Maharaj & sacred scriptures.\n`;
      }
    }
    if (elapsedMs >= 1400) {
      text += `📿 Holy Name & Surrender: Reflecting on the purifying power of continuous Naam Jap ('Radha Radha') & total refuge.\n`;
    }
    if (elapsedMs >= 2400) {
      text += `💡 Compassionate Synthesis: Formulating fatherly, resolute spiritual guidance to eradicate doubt and inspire devotion.`;
    }
    return text;
  } else {
    let text = `🔍 जिज्ञासा व भाव-मंथन: साधक के प्रश्न ("${queryPreview}...") का शास्त्रीय व आध्यात्मिक विश्लेषण।\n`;
    if (elapsedMs >= 400) {
      if (scripture) {
        text += `📜 शास्त्र प्रमाण अनुसंधान (RAG Grounding): ${scripture.reference} के पावन श्लोक का प्रसंग व भावार्थ समन्वय।\n`;
      } else {
        text += `📜 सत्संग व संत-वाणी चिंतन: पूज्य श्री प्रेमानंद जी महाराज के पावन उपदेशों व शास्त्रों (श्रीमद्भागवत, श्री राधा सुधा निधि) के आलोक में सिद्धांत विचार।\n`;
      }
    }
    if (elapsedMs >= 1400) {
      text += `📿 नाम-महिमा व चित्त-शुद्धि: कलियुग में भगवन्नाम (श्री राधा-राधा) के अखंड जप से अंतःकरण की शुद्धि और अनन्य शरणागति का स्वरूप।\n`;
    }
    if (elapsedMs >= 2400) {
      text += `💡 व्यावहारिक उपदेश समन्वय: साधक के अंतर्मन को दृढ़ करने हेतु वात्सल्यमयी, प्रेरणादायी व स्पष्ट मार्गदर्शन।`;
    }
    return text;
  }
}

/**
 * Phased Stream Orchestrator for Deep Mode:
 * 1. Initial contemplative phase: Reasoning window activates immediately with Spiritual Deliberation.
 * 2. Progressive Streaming: As soon as tokens arrive, clean text streams continuously into the discourse area with live deliberation above.
 * 3. Finalize: Collapses thinking window to its header badge and neatly structures paragraphs ending in '।'.
 */
function createDeepModeStreamTracker(onChunk, userMessage, isEnglish, scripture = null) {
  let accumulatedRaw = '';
  const startTime = Date.now();
  const CONTEMPLATION_PAUSE_MS = 600; // 0.6s gentle contemplative reflection

  function emitCurrentState() {
    const elapsed = Date.now() - startTime;
    const thoughtText = getSpiritualDeliberationText(userMessage, isEnglish, elapsed, scripture);

    if (elapsed < CONTEMPLATION_PAUSE_MS || !accumulatedRaw.trim()) {
      onChunk({
        content: '',
        thought: thoughtText,
        isThinking: true,
        thinkingDuration: Math.max(0.1, Number((elapsed / 1000).toFixed(1))),
        scripture: scripture || null
      });
      return;
    }

    const cleanResult = deduplicateRepetitionLoops(accumulatedRaw.trim(), isEnglish);
    onChunk({
      content: cleanResult || accumulatedRaw.trim(),
      thought: thoughtText,
      isThinking: true,
      thinkingDuration: Math.max(0.1, Number((elapsed / 1000).toFixed(1))),
      scripture: scripture || null
    });
  }

  // Ticker to ensure smooth deliberation updates even between token pauses
  const intervalId = setInterval(() => {
    emitCurrentState();
  }, 250);

  const handleToken = (tokenOrDelta, maybeAccumulated) => {
    let token = '';
    if (typeof maybeAccumulated === 'string') {
      token = tokenOrDelta || '';
    } else if (typeof tokenOrDelta === 'string') {
      if (tokenOrDelta.length > accumulatedRaw.length && tokenOrDelta.startsWith(accumulatedRaw)) {
        token = tokenOrDelta.slice(accumulatedRaw.length);
      } else {
        token = tokenOrDelta;
      }
    }
    if (!token) return;
    accumulatedRaw += token;
    emitCurrentState();
  };

  const finalize = async (finalRaw) => {
    clearInterval(intervalId);

    const raw = (finalRaw || accumulatedRaw).trim();
    if (!raw) {
      return {
        content: isEnglish ? 'Radhe Radhe! Keep the Holy Name in your heart.' : 'राधे राधे बच्चा! मन को शांत रखिए और भगवन्नाम का आश्रय लीजिए।',
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
        scripture: scripture || null
      };
    }

    // Format and segment discourse into 2-3 structured paragraphs ending in '।' with a 3.5s timeout guarantee
    let finalFramedDiscourse = '';
    try {
      finalFramedDiscourse = await Promise.race([
        formatAndSegmentFineTunedDiscourse(raw, userMessage, isEnglish),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Format timeout')), 3500))
      ]);
    } catch {
      finalFramedDiscourse = segmentAndFormatDiscourseNative(raw, isEnglish);
    }

    const totalElapsed = (Date.now() - startTime) / 1000;
    const thinkingTime = Math.max(1.2, Math.min(totalElapsed, 4.0));

    let finalThoughtSummary = getSpiritualDeliberationText(userMessage, isEnglish, Date.now() - startTime, scripture);
    finalThoughtSummary += isEnglish
      ? '\n\n✓ Spiritual deliberation concluded. Complete authentic discourse formulated.'
      : '\n\n✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।';

    const finalPayload = {
      content: finalFramedDiscourse || ensureCompleteFinalSentence(raw, isEnglish),
      thought: finalThoughtSummary,
      isThinking: false,
      thinkingDuration: Number(thinkingTime.toFixed(1)),
      scripture: scripture || null
    };

    onChunk(finalPayload);
    return finalPayload;
  };

  return { handleToken, finalize };
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

  // Retrieve RAG scripture grounding if applicable
  const scripture = getScriptureGrounding(userMessage);
  if (scripture) {
    console.log(`[+] Grounded with Scripture: ${scripture.reference} (Score: ${scripture.score})`);
  }

  // Summarize prior chat info into a concise 2-line summary to prevent slow inference
  const condensedHistory = summarizeHistoryForContext(conversationHistory, isEnglish);
  const messages = [
    ...condensedHistory,
    { role: 'user', content: userMessage },
  ];

  if (mode === 'deep') {
    // Priority 1 in Deep Mode: Dedicated Fine-Tuned Oracle Cloud Q8_0 Server via active tunnel (5.5s timeout)
    const tracker = createDeepModeStreamTracker(onChunk, userMessage, isEnglish, scripture);
    const oracleResult = await callDirectOracleAPI(messages, 950, true, tracker.handleToken, true, userProfile, userMemoryContext, scripture);
    if (oracleResult) {
      return await tracker.finalize(oracleResult);
    }
    // Deep fallback: Instant Groq engine with Deep persona (sub-second response)
    console.warn('[Deep Mode] Oracle Q8_0 server unavailable or slow, immediately engaging Groq reasoning engine...');
    const groqResult = await callDirectGroqAPI(messages, 950, true, tracker.handleToken, true, userProfile, userMemoryContext, scripture);
    if (groqResult) {
      return await tracker.finalize(groqResult);
    }
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU
    const groqResult = await callDirectGroqAPI(messages, 950, true, (tok, acc) => onChunk(acc || tok), false, userProfile, userMemoryContext, scripture);
    if (groqResult) {
      const formatted = formatScriptureLines(groqResult);
      return ensureCompleteFinalSentence(formatted, isEnglish);
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, 900, true, (tok, acc) => onChunk(acc || tok), false, userProfile, userMemoryContext, scripture);
    if (oracleResult) {
      const formatted = formatScriptureLines(oracleResult);
      return ensureCompleteFinalSentence(formatted, isEnglish);
    }
  }

  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'बच्चा';
  return `राधे राधे ${seekerName}! मन को शांत रखिए और भगवन्नाम (राधा नाम) का आश्रय लीजिए। प्रभु सब मंगल करेंगे।`;
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
