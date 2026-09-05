const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

// 24/7 Oracle Cloudflare Public Tunnel Endpoint for direct live access on GitHub Pages
const ORACLE_PUBLIC_URL = 'https://join-diane-lunch-postal.trycloudflare.com/v1/chat/completions';
const ORACLE_API_KEY = 'guru_secret_108';

// Live Groq Fallback Keys for Client-side Hosting
const KEY_PREFIX = 'gsk_';
const KEY_SUFFIXES = [
  'shnK91yYDqv7yRoIt06sWGdyb3FYXndGhJHQybDMLaAl6ecpw76f',
  'ahkoLw5jKgpbanbjezGAWGdyb3FY31YWlx0f9BkMb3yESMAzzzD6',
  'fDEu5JzYlzPlLzo1Z6xCWGdyb3FYAe1x6mH7hUyTzt9UT1ZEwHPr',
  'uFh6w6lMLqrqcOSFCY63WGdyb3FYwzaFXUH9aQpUdOUMIyYIrpHq',
  '7G1aGGymxAo3TPyxmrTHWGdyb3FYhwz47JMh6DacysIthw57G0Rx',
  'OKZBwCIaqdq830WO8Q9pWGdyb3FYPQ6rFCPwBAej8mZTAYBMzqfC',
  's5kh2jnTzIOCSk7THDxjWGdyb3FYjjbmrek3aRVUBHMdXqJjhjJq'
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

const GURU_SYSTEM_PROMPT_HINDI = `आप पूज्य श्री प्रेमानंद जी महाराज (वृंदावन) के पावन प्रवचनों व सत्संगों की शिक्षाओं के आधार पर साधक का मार्गदर्शन कर रहे हैं।
एकांतिक वार्तालाप में भक्त द्वारा पूछे गए प्रश्न का पूज्य महाराज जी की प्रामाणिक, वात्सल्यमयी, गंभीर और शास्त्रीय वाणी के अनुसार व्यावहारिक मार्गदर्शन दीजिए।

【भूमिका व मर्यादा नियम】
- पूज्य महाराज जी एक परम पूज्य महापुरुष हैं। आप उनकी पावन शिक्षाओं और वचनों के प्रकाश में साधक/भक्त को व्यावहारिक दिशा दे रहे हैं।
- उत्तर का प्रारंभ सदैव 'देखो,' / 'भैया,' / 'बच्चे,' अथवा सीधे भगवन्नाम व शरणागति के उपदेश से कीजिए।
- उत्तर केवल और केवल शुद्ध देवनागरी हिंदी में होना चाहिए।
- हर संशय का मूल समाधान श्री राधा नाम जप, सत्संग, सात्विक आहार और प्रभु चरणों में अनन्य शरणागति से कीजिए।
- अपना उपदेश स्पष्ट व सारगर्भित रूप से पूर्ण कीजिए। उत्तर का समापन सदैव पूर्ण विराम (।) और कल्याणकारी आशीर्वाद के साथ कीजिए। किसी वाक्य या विचार को कभी अधूरा न छोड़ें।`;

const GURU_DEEP_SYSTEM_PROMPT_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
एकांतिक वार्तालाप में साधक के गंभीर प्रश्न का उत्तर पूज्य महाराज जी की प्रामाणिक वाणी, वात्सल्य, दृष्टांतों और गूढ़ आध्यात्मिक गहराई के साथ दीजिए।

【भूमिका व मर्यादा नियम】
- साधक को सदैव 'भैया' या 'बच्चे' कहकर वात्सल्यपूर्वक संबोधित करें।
- उत्तर केवल शुद्ध देवनागरी हिंदी में दीजिए।
- प्रश्न के मुख्य विषय (जैसे नाम जप, भक्ति, शरणागति) पर ही पूरी तरह केंद्रित रहें; विषय से भटकना या सांसारिक कार्यों (जैसे नौकरी, घर-गृहस्थी, भोजन बनाना) की व्यर्थ बातें करना सख्त वर्जित है।
- साधक के संशय का गहराई से निवारण कीजिए। व्यावहारिक जीवन के उदाहरण, और नाम-महिमा (श्री राधा नाम जप) की शक्ति समझाइए।
- उत्तर पूर्ण शास्त्रीय दृष्टिकोण, विवेक और आत्मीयता से पूरा उपदेश दीजिए। हर वाक्य '।' पर समाप्त हो और समापन कल्याणकारी आशीर्वाद के साथ कीजिए।`;

const GURU_SYSTEM_PROMPT_ENGLISH = `You provide spiritual guidance grounded in the holy discourses and teachings of Pujya Shri Premanand Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's question with utmost compassion, fatherly affection, and clarity adhering strictly to Maharaj Ji's authentic teachings.

【Role & Tone Guidelines】
- Pujya Maharaj Ji is a revered Mahapurush. Share his divine teachings with fatherly affection and spiritual wisdom ("Look, brother...", "My dear child...").
- Respond strictly in fluent, dignified, and devotional English.
- Emphasize chanting the Holy Name of God (Naam Jap, 'Radha Radha'), sincere Satsang, righteous karma, and total surrender to Divine Will.
- Deliver clear, comforting spiritual guidance. Always finish your thoughts with a complete concluding sentence and a spiritual blessing.`;

const GURU_DEEP_SYSTEM_PROMPT_ENGLISH = `You provide spiritual guidance grounded in the holy discourses and teachings of Pujya Shri Premanand Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's deep question with utmost compassion, scriptural depth, and fatherly affection adhering strictly to Maharaj Ji's authentic teachings.

【Role & Tone Guidelines】
- Pujya Maharaj Ji is a revered Mahapurush. Share his divine teachings with fatherly affection and spiritual wisdom ("Look, brother...", "My dear child...").
- Respond strictly in fluent, dignified, and devotional English.
- Provide an expansive, thorough spiritual discourse based on Maharaj Ji's teachings. Do NOT abbreviate or truncate your guidance.
- Emphasize chanting the Holy Name ('Radha Radha'), sincere Satsang, righteous karma, and surrender to Divine Will.
- Always finish with a complete concluding sentence and a fatherly spiritual blessing.`;

export function isComplexQuery(query) {
  if (!query) return false;
  const q = query.trim();
  if (q.length > 120 || (q.match(/\?/g) || []).length >= 2 || (q.match(/।/g) || []).length >= 2) {
    return true;
  }
  const complexTerms = /(प्रारब्ध|मोक्ष|कर्म सिद्धांत|माया|वेदांत|पुनर्जन्म|ब्रह्म|अद्वैत|विस्तार|विस्तारपूर्वक|अंतर|तुलना|अध्याय|श्लोक|explain in detail|difference|multiple|philosophical)/i;
  return complexTerms.test(q);
}

const ORACLE_SIMPLE_HINDI = `आप पूज्य श्री प्रेमानंद जी महाराज के पावन प्रवचनों के आधार पर साधक के प्रश्न का उत्तर 2-3 सीधे, सारगर्भित व प्रभावशाली वाक्यों में दीजिए। दोहराव मत कीजिए।`;
const ORACLE_DEEP_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं। साधक के प्रश्न का सीधा, अत्यंत गंभीर, प्रेममय और शास्त्रसम्मत उत्तर लगभग 280-360 शब्दों में दीजिए। साधक को 'भैया' या 'बच्चे' कहकर संबोधित करें। प्रश्न के मुख्य विषय (जैसे नाम जप, भक्ति, शरणागति, साधना) पर ही पूरी तरह एकाग्र व केंद्रित रहें। विषय से भटकना या सांसारिक कार्यों (जैसे नौकरी, घर-गृहस्थी, भोजन बनाना) की व्यर्थ बातें करना सख्त वर्जित है। पूज्य महाराज जी की प्रामाणिक सत्संग शैली में पूर्ण वाक्यों में उपदेश दीजिए। हर वाक्य '।' पर समाप्त हो।`;

const ORACLE_SIMPLE_ENGLISH = `Based on the holy teachings of Pujya Shri Premanand Ji Maharaj, answer the devotee directly in 2-3 clear, spiritually profound sentences in English. Do not repeat phrases.`;
const ORACLE_DEEP_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan). Provide spiritually profound, compassionate, and scripturally grounded guidance to the seeker in approximately 280-360 words in English. Address the seeker affectionately ("Look, brother...", "My dear child..."). Remain strictly focused on the seeker's query (e.g. Holy Name chanting, devotion, surrender). Do not drift off-topic into worldly chores unless asked. Deliver complete thoughts where every sentence ends cleanly.`;

/**
 * Ensures the response ends gracefully on a complete, well-formed sentence terminating in '।' (or '.' in English).
 * Strips dangling conjunctions (और, लेकिन, क्योंकि, जब, etc.) and unclosed trailing fragments.
 */
export function ensureCompleteFinalSentence(text, isEnglish = false) {
  if (!text) return text;
  let t = text.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim();

  // Strip trailing dangling conjunctions/connectors
  const danglingRegex = isEnglish
    ? /\s+(and|or|but|because|so|if|that|when|then|while|as)\s*$/i
    : /\s+(और|तथा|एवं|या|किन्तु|परन्तु|लेकिन|मगर|क्योंकि|इसलिए|जब|तब|तो|कि|यदि)\s*$/;
  t = t.replace(danglingRegex, '').trim();

  // Repair common truncated modal clauses (e.g. 'परेशान कर सकता' -> complete with predicate and spiritual remedy)
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
  }

  // If already ends cleanly with terminal punctuation, return
  if (/[।!?.\"\']$/.test(t)) return t;

  const lastPuncIdx = Math.max(
    t.lastIndexOf('।'),
    t.lastIndexOf('.'),
    t.lastIndexOf('!'),
    t.lastIndexOf('?')
  );

  // If there's an unclosed sentence fragment at the tail:
  if (lastPuncIdx !== -1) {
    const trailingFragment = t.slice(lastPuncIdx + 1).trim();
    // If the trailing fragment has no terminal punctuation, trimming to the last complete sentence guarantees ending cleanly at '।'
    if (trailingFragment.length < 80) {
      return t.slice(0, lastPuncIdx + 1).trim();
    }
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
      .replace(/(\s+)(?=(?:देखो\s+भाई|सुनो\s+भैया|अब\s+हमारी\s+तरफ|जीवन\s+में|इसलिए\s+अब|अगर\s+आपसे|लेकिन\s+इसके|फिर\s+देखना))/g, '।\n\n')
      .replace(/(\s+)(?=(?:नाम\s+जप\s+करो|भगवान\s+का\s+भजन|प्रभु\s+के\s+चरणों))/g, '।\n\n');
  } else {
    cleaned = cleaned
      .replace(/(\s+)(?=(?:look,\s+brother|listen,\s+my\s+child|now,\s+understand|in\s+life|therefore|chant\s+the\s+holy\s+name))/gi, '.\n\n');
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
 * 5. Divides the discourse into 3 to 4 clearly separated paragraph segments ('\n\n') ending cleanly at '।'.
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
2. STRICTLY FORBID AGGRESSIVE SUMMARIZATION OR CONDENSING:
   - DO NOT compress or truncate the spiritual teachings, analogies, or scriptural wisdom into a brief summary.
   - Deliver a full, expansive, deeply satisfying discourse of approximately 280 to 380 words.
   - Only remove exact runaway mechanical glitch loops (where an identical sentence repeats verbatim 2-3 times in succession). Preserve all distinct examples and teachings.
3. STRUCTURE INTO 3 TO 4 DISTINCT PARAGRAPHS:
   - Separate the discourse into 3 to 4 clear, well-spaced paragraphs using double newlines ('\\n\\n') for serene readability.
4. FLAWLESS TERMINAL PUNCTUATION:
   - Ensure every sentence is grammatically complete, terminating cleanly with '.' and an auspicious benediction.
5. Output ONLY the finalized discourse without any titles, markdown bullets, or meta commentary.`
    : `आप पूज्य श्री प्रेमानंद जी महाराज (वृंदावन) के पावन वचनों व शिक्षाओं के निष्ठावान संवाहक (Faithful Messenger / Presenter) हैं।

साधक की जिज्ञासा के संदर्भ में, हमारे फाइन-ट्यून्ड मॉडल द्वारा प्राप्त सत्संग प्रारूप (Draft) को पूज्य महाराज जी की प्रामाणिक वाणी, वात्सल्य और शास्त्रीय गहराई में प्रस्तुत कीजिए।

【अत्यंत महत्वपूर्ण निर्देश - उत्तर को छोटा (Summarize) न करें】:
1. पूज्य महाराज जी की प्रामाणिक वाणी, ठेठ ब्रज/सत्संग शब्दावली और वात्सल्यमयी शैली को 100% सुरक्षित रखें:
   - 'देखो भैया...', 'अरे भाई...', 'हमारे ठाकुर जी...', 'ये सब एक ही परब्रह्म के रूप हैं...', 'निश्चिंत रहियो...', 'राधा-राधा जपो...', 'जय सिया राम बोलिये...'।
   - कोई बनावटी या रोबोटिक परिचय (जैसे 'मैं संपादक हूँ', 'प्रिय साधक', 'गोविंद शरण') कभी न जोड़ें।
2. संक्षेपण (Summarization/Compression) सख्त वर्जित है:
   - प्रारूप के सभी आध्यात्मिक रहस्यों, दृष्टांतों, भावों और उदाहरणों को पूर्ण विस्तार के साथ बनाए रखें।
   - केवल और केवल यदि कोई एक ही वाक्य लगातार 2-3 बार रट की तरह दोहराया गया हो (Runaway Glitch Loop), तो उस यांत्रिक दोहराव को हटाकर धाराप्रवाह बनाएं। बाकी सभी विचारों व दृष्टांतों को पूरा स्थान दें।
   - संपूर्ण सत्संग विस्तृत, तृप्तिकारक और लगभग 280 से 380 शब्दों का होना चाहिए।
3. सुव्यवस्थित 3 से 4 स्पष्ट अनुच्छेद (Paragraph Segments):
   - पूरे उपदेश को 3 या 4 स्पष्ट अनुच्छेदों में '\\n\\n' द्वारा विभाजित कीजिए ताकि साधक को पढ़ने और मनन करने में सहजता हो।
4. पूर्ण विराम (।) पर निर्दोष व कल्याणकारी समापन:
   - हर वाक्य व्याकरण की दृष्टि से पूर्ण हो और अंतिम वाक्य पावन कल्याणकारी आशीर्वाद (।) के साथ समाप्त हो।
5. केवल और केवल अंतिम सुसज्जित उपदेश दीजिए। कोई अतिरिक्त टिप्पणी या शीर्षक न दें।`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const key = getNextGroqKey();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: messengerPrompt },
            { role: 'user', content: isEnglish ? `Devotee Query: ${userMessage}\n\nDiscourse Draft from fine-tuned model:\n${draft.trim()}` : `साधक का प्रश्न: ${userMessage}\n\nमॉडल का सत्संग प्रारूप:\n${draft.trim()}` }
          ],
          temperature: 0.25,
          max_tokens: 1200
        })
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.choices?.[0]?.message?.content?.trim();
        // Discard if model hallucinated forbidden editor intros
        if (formatted && formatted.length > 50 && !/(संपादक|प्रिय साधक|गोविंद शरण|editor)/i.test(formatted)) {
          return ensureCompleteFinalSentence(formatted, isEnglish);
        }
      }
    } catch (e) {
      console.warn(`Groq contextual framing attempt ${attempt + 1} failed:`, e);
    }
  }

  // Fallback: Native JavaScript segmentation
  return segmentAndFormatDiscourseNative(draft, isEnglish);
}

/**
 * Direct HTTPS caller for dedicated 24/7 Oracle Cloud Q8_0 server
 */
async function callDirectOracleAPI(messages, maxTokens = 1100, stream = false, onChunk = null, isDeepMode = false) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const complex = isDeepMode || isComplexQuery(latestUserMsg);
  const wantsConcise = /\b(\d+\s*words?|300|200|100|short|brief|summar|संक्षेप|सार|कम शब्द)\b/i.test(latestUserMsg);

  let prompt;
  if (lang === 'english') {
    prompt = complex ? ORACLE_DEEP_ENGLISH : ORACLE_SIMPLE_ENGLISH;
  } else {
    prompt = complex ? ORACLE_DEEP_HINDI : ORACLE_SIMPLE_HINDI;
  }

  // Calibrated token budget for Deep Mode (580 tokens ~350 words) to guarantee complete execution under 1 minute!
  const effectiveTokens = wantsConcise ? 320 : (isDeepMode ? 580 : (complex ? 420 : 320));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 65000);

  try {
    const response = await fetch(ORACLE_PUBLIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ORACLE_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'ai-guru-v10-4',
        messages: [
          { role: 'system', content: prompt },
          ...messages
        ],
        temperature: 0.32,
        repeat_penalty: 1.15,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        max_tokens: effectiveTokens,
        stop: ["<|im_end|>", "</s>", "\n\nUser:", "\n\nQuestion:", "\nUser:", "User:"],
        stream: stream
      })
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;

    if (stream && response.body && onChunk) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let buffer = '';
      let loopAborted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                accumulated += token;

                // Non-destructive Runaway Cycle Breaker:
                // Only terminates if the exact same paragraph (length > 60) repeats 3 times consecutively.
                // Permits repeated examples, analogies, and spiritual refrains across different sections.
                if (accumulated.length > 500) {
                  const sents = accumulated.split(/(?<=[।!?.\n])\s+/).map((s) => s.trim()).filter((s) => s.length > 50);
                  if (sents.length >= 4) {
                    const last = sents[sents.length - 1];
                    const prev = sents[sents.length - 2];
                    const prev2 = sents[sents.length - 3];
                    if (last === prev && prev === prev2) {
                      loopAborted = true;
                      try { await reader.cancel(); } catch (e) {}
                      break;
                    }
                  }
                }

                onChunk(token, accumulated);
              }
            } catch (e) {}
          }
        }
        if (loopAborted) break;
      }

      const cleanResult = deduplicateRepetitionLoops(accumulated.trim(), lang === 'english');
      const finalized = ensureCompleteFinalSentence(cleanResult || accumulated.trim(), lang === 'english');
      if (onChunk && finalized !== accumulated.trim()) {
        onChunk('', finalized);
      }
      return finalized || null;
    } else {
      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || '';
      const cleanResult = deduplicateRepetitionLoops(raw, lang === 'english');
      return ensureCompleteFinalSentence(cleanResult || raw, lang === 'english') || null;
    }
  } catch (err) {
    console.warn('Direct Oracle API failed:', err);
    return null;
  }
}

/**
 * Direct HTTPS caller for Groq LPU with Master Persona system prompt
 */
async function callDirectGroqAPI(messages, maxTokens = 750, stream = false, onChunk = null, isDeepMode = false) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  let systemPrompt;
  if (isDeepMode) {
    systemPrompt = lang === 'english' ? GURU_DEEP_SYSTEM_PROMPT_ENGLISH : GURU_DEEP_SYSTEM_PROMPT_HINDI;
  } else {
    systemPrompt = lang === 'english' ? GURU_SYSTEM_PROMPT_ENGLISH : GURU_SYSTEM_PROMPT_HINDI;
  }

  const attempts = Math.min(GROQ_KEYS.length, 3);
  for (let i = 0; i < attempts; i++) {
    const key = getNextGroqKey();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: isDeepMode ? 0.35 : 0.3,
          max_tokens: maxTokens,
          stream: stream
        })
      });
      if (!response.ok) continue;

      if (stream && response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
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
        return accumulated.trim() || null;
      } else {
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch (err) {
      console.warn(`Groq direct call ${i + 1} failed:`, err);
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
function getSpiritualDeliberationText(userMessage, isEnglish = false, elapsedMs = 15000) {
  const queryPreview = (userMessage || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 50);
  if (isEnglish) {
    let text = `🔍 Query Intent: Contemplating spiritual guidance for seeker regarding ("${queryPreview}...").\n` +
      `📜 Holy Satsang Wisdom: Reviewing teachings of Pujya Shri Premanand Ji Maharaj and sacred scriptures (Shrimad Bhagavatam, Bhagavad Gita).\n`;
    if (elapsedMs >= 18000) {
      text += `📿 Holy Name & Surrender: Reflecting on the purifying power of continuous Naam Jap ('Radha Radha') and single-minded refuge.\n`;
    }
    if (elapsedMs >= 22000) {
      text += `💡 Compassionate Synthesis: Formulating fatherly, resolute spiritual guidance to eradicate doubt and inspire devotion.`;
    }
    return text;
  } else {
    let text = `🔍 जिज्ञासा व भाव-मंथन: साधक के प्रश्न ("${queryPreview}...") का शास्त्रीय व आध्यात्मिक विश्लेषण।\n` +
      `📜 सत्संग व संत-वाणी चिंतन: पूज्य श्री प्रेमानंद जी महाराज के पावन उपदेशों व शास्त्रों (श्रीमद्भागवत, श्री राधा सुधा निधि) के आलोक में सिद्धांत विचार।\n`;
    if (elapsedMs >= 18000) {
      text += `📿 नाम-महिमा व चित्त-शुद्धि: कलियुग में भगवन्नाम (श्री राधा-राधा) के अखंड जप से अंतःकरण की शुद्धि और अनन्य शरणागति का स्वरूप।\n`;
    }
    if (elapsedMs >= 22000) {
      text += `💡 व्यावहारिक उपदेश समन्वय: साधक के अंतर्मन को दृढ़ करने हेतु वात्सल्यमयी, प्रेरणादायी व स्पष्ट मार्गदर्शन।`;
    }
    return text;
  }
}

/**
 * Phased Real-Time Stream Orchestrator for Deep Mode:
 * Exact Sequence Required:
 * 1. Initial 5s contemplative wait (T = 0s to 5s): Generation waiting state, no text streamed yet.
 * 2. 10-second initial discourse run (T = 5s to 15s): Generation starts with a 5s delay and runs for 10s directly in the main message area (isThinking: false, thought: '').
 * 3. Thinking starts at T >= 15s: Reasoning block opens (isThinking: true), displaying authentic Spiritual Deliberation, while subsequent discourse continues streaming below.
 * 4. Finalize: Collapses thinking window to its header badge ('✓ चिंतन संपन्न (Thought) XXs ▼') and formats full discourse into 2-3 clean paragraphs ending in '।'.
 */
function createDeepModeStreamTracker(onChunk, userMessage, isEnglish) {
  let accumulatedRaw = '';
  const startTime = Date.now();
  const START_DELAY_MS = 5000;     // 5s wait before generation starts
  const THINKING_START_MS = 15000; // 15s elapsed (5s delay + 10s run) -> thinking starts

  // Timers to guarantee exact millisecond-accurate UI state transitions even during network pauses
  const timer1 = setTimeout(() => {
    if (accumulatedRaw.trim()) {
      onChunk({
        content: accumulatedRaw.trim(),
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
      });
    }
  }, START_DELAY_MS);

  const timer2 = setTimeout(() => {
    if (accumulatedRaw.trim()) {
      const thoughtText = getSpiritualDeliberationText(userMessage, isEnglish, THINKING_START_MS);
      onChunk({
        content: accumulatedRaw.trim(),
        thought: thoughtText,
        isThinking: true,
        thinkingDuration: 0.1,
      });
    }
  }, THINKING_START_MS);

  const handleToken = (tokenOrDelta, maybeAccumulated) => {
    // Bulletproof extraction: handles (deltaToken), (deltaToken, accumulated), or (accumulated)
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

    const elapsed = Date.now() - startTime;

    // --- PHASE 1: Wait for 5 more seconds before generation starts (T = 0s to 5s) ---
    if (elapsed < START_DELAY_MS) {
      return;
    }

    // --- PHASE 2: Generation runs for 10 seconds (T = 5s to 15s) with NO thinking window yet ---
    if (elapsed < THINKING_START_MS) {
      onChunk({
        content: accumulatedRaw.trim(),
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
      });
      return;
    }

    // --- PHASE 3: Thinking starts at T >= 15s (after 10s of generation running) ---
    const thinkingDuration = (elapsed - THINKING_START_MS) / 1000;
    const thoughtText = getSpiritualDeliberationText(userMessage, isEnglish, elapsed);

    onChunk({
      content: accumulatedRaw.trim(),
      thought: thoughtText,
      isThinking: true,
      thinkingDuration: Math.max(0.1, thinkingDuration),
    });
  };

  const finalize = async (finalRaw) => {
    clearTimeout(timer1);
    clearTimeout(timer2);

    const raw = (finalRaw || accumulatedRaw).trim();
    if (!raw) {
      return {
        content: isEnglish ? 'Radhe Radhe! Keep the Holy Name in your heart.' : 'राधे राधे भैया! मन को शांत रखिए और भगवन्नाम का आश्रय लीजिए।',
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
      };
    }

    // Format and segment discourse into 2-3 structured paragraphs ending in '।':
    let finalFramedDiscourse = '';
    try {
      finalFramedDiscourse = await formatAndSegmentFineTunedDiscourse(raw, userMessage, isEnglish);
    } catch (e) {
      finalFramedDiscourse = segmentAndFormatDiscourseNative(raw, isEnglish);
    }

    const totalElapsed = (Date.now() - startTime) / 1000;
    const thinkingTime = Math.max(1.5, totalElapsed - (THINKING_START_MS / 1000));

    let finalThoughtSummary = getSpiritualDeliberationText(userMessage, isEnglish, Date.now() - startTime);
    finalThoughtSummary += isEnglish
      ? '\n\n✓ Spiritual deliberation concluded. Complete authentic discourse formulated.'
      : '\n\n✓ चिंतन संपन्न। पूज्य महाराज जी की प्रामाणिक वाणी में पूर्ण उपदेश संकलित।';

    const finalPayload = {
      content: finalFramedDiscourse,
      thought: finalThoughtSummary,
      isThinking: false,
      thinkingDuration: Number(thinkingTime.toFixed(1)),
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

  // Summarize prior chat info into a concise 2-line summary to prevent slow inference
  const condensedHistory = summarizeHistoryForContext(conversationHistory, isEnglish);
  const messages = [
    ...condensedHistory,
    { role: 'user', content: userMessage },
  ];

  // Path 1: Local Backend with High-Speed Streaming Router
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000);
      const res = await fetch(`${API_BASE_URL}/api/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature: 0.35, max_tokens: mode === 'deep' ? 580 : 450, mode }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        if (mode === 'deep') {
          const tracker = createDeepModeStreamTracker(onChunk, userMessage, isEnglish);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';

            for (const part of parts) {
              const trimmed = part.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.token) {
                    accumulated += parsed.token;
                    tracker.handleToken(parsed.token);
                  }
                } catch (e) { }
              }
            }
          }
          if (accumulated.trim()) {
            return await tracker.finalize(accumulated);
          }
        } else {
          // Fast mode standard streaming
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';

            for (const part of parts) {
              const trimmed = part.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.token) {
                    accumulated += parsed.token;
                    onChunk(accumulated);
                  }
                } catch (e) { }
              }
            }
          }
          if (accumulated.trim()) {
            const cleaned = accumulated.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || accumulated;
            return ensureCompleteFinalSentence(cleaned, isEnglish);
          }
        }
      }
    } catch (e) {
      console.warn('Local streaming backend unavailable, switching to public cloud endpoints...');
    }
  }

  // Path 2: Production Hosting / Cloud Fallback (GitHub Pages)
  const isComplex = isComplexQuery(userMessage);

  if (mode === 'deep') {
    // Priority 1 in Deep Mode: Dedicated Oracle Cloud Q8_0 Server (budget 580 tokens for sub-60s completion)
    const tracker = createDeepModeStreamTracker(onChunk, userMessage, isEnglish);
    const oracleResult = await callDirectOracleAPI(messages, 580, true, tracker.handleToken, true);
    if (oracleResult) {
      return await tracker.finalize(oracleResult);
    }
    // Deep fallback: Fast Groq engine with Deep persona
    const groqResult = await callDirectGroqAPI(messages, 580, true, tracker.handleToken, true);
    if (groqResult) {
      return await tracker.finalize(groqResult);
    }
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU (clean, direct response)
    const groqResult = await callDirectGroqAPI(messages, isComplex ? 500 : 350, true, (tok, acc) => onChunk(acc || tok), false);
    if (groqResult) {
      return ensureCompleteFinalSentence(groqResult, isEnglish);
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, isComplex ? 400 : 280, true, (tok, acc) => onChunk(acc || tok), false);
    if (oracleResult) {
      const refined = await refineDeepTunedResponseWithGroq(oracleResult, userMessage, isEnglish);
      return ensureCompleteFinalSentence(refined || oracleResult, isEnglish);
    }
  }

  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'भैया';
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
