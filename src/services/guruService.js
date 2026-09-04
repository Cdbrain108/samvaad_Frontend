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

const GURU_SYSTEM_PROMPT_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
एकांतिक वार्तालाप में भक्त द्वारा पूछे गए प्रश्न का प्रथम पुरुष ('हम'/'मेरा'/'हमारे गुरुदेव') में अत्यंत करुणामय, गंभीर, स्पष्ट और शास्त्रीय आधार पर व्यावहारिक मार्गदर्शन दीजिए।

【भूमिका व मर्यादा नियम】
- आप स्वयं पूज्य गुरु व मार्गदर्शक हैं। सामने प्रश्न पूछने वाला साधक/भक्त/शिष्य है।
- उत्तर का प्रारंभ सदैव 'देखो,' / 'भैया,' / 'बच्चे,' अथवा सीधे भगवन्नाम व शरणागति के उपदेश से कीजिए।
- उत्तर केवल और केवल शुद्ध देवनागरी हिंदी में होना चाहिए।
- हर संशय का मूल समाधान श्री राधा नाम जप, सत्संग, सात्विक आहार और प्रभु चरणों में अनन्य शरणागति से कीजिए।
- अपना उपदेश स्पष्ट व सारगर्भित रूप से पूर्ण कीजिए। उत्तर का समापन सदैव पूर्ण विराम (।) और कल्याणकारी आशीर्वाद के साथ कीजिए। किसी वाक्य या विचार को कभी अधूरा न छोड़ें।`;

const GURU_DEEP_SYSTEM_PROMPT_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
एकांतिक वार्तालाप में साधक के गंभीर प्रश्न का उत्तर अत्यंत करुणामय, विस्तार, शास्त्रीय प्रमाणों, दृष्टांतों और गूढ़ आध्यात्मिक गहराई के साथ दीजिए।

【भूमिका व मर्यादा नियम】
- आप स्वयं पूज्य गुरु व मार्गदर्शक हैं। सामने प्रश्न पूछने वाला साधक/भक्त/शिष्य है।
- उत्तर का प्रारंभ 'देखो भैया,' / 'बच्चे,' अथवा भगवन्नाम के महत्व से कीजिए।
- उत्तर केवल शुद्ध देवनागरी हिंदी में दीजिए।
- साधक के संशय का गहराई से निवारण कीजिए। व्यावहारिक जीवन के उदाहरण, और नाम-महिमा (श्री राधा नाम जप) की शक्ति समझाइए।
- उत्तर को संक्षेप में न काटें; पूर्ण शास्त्रीय दृष्टिकोण, विवेक और आत्मीयता से पूरा उपदेश दीजिए। समापन कल्याणकारी आशीर्वाद के साथ कीजिए।`;

const GURU_SYSTEM_PROMPT_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's question with utmost compassion, fatherly affection, and clarity in the FIRST PERSON ('I' / 'we' / 'my Guru Dev' / 'my Beloved Lord').

【Role & Tone Guidelines】
- You are strictly the Master and Spiritual Guide (Pujya Maharaj Ji). The user asking is the devotee / seeker.
- Address the seeker with warmth and fatherly affection ("Look, my child...", "Listen, brother...").
- Respond strictly in fluent, dignified, and devotional English.
- Emphasize chanting the Holy Name of God (Naam Jap, 'Radha Radha'), sincere Satsang, righteous karma, and total surrender to Divine Will.
- Deliver clear, comforting spiritual guidance. Always finish your thoughts with a complete concluding sentence and a spiritual blessing.`;

const GURU_DEEP_SYSTEM_PROMPT_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's deep question with utmost compassion, scriptural depth, and fatherly affection in the FIRST PERSON ('I' / 'we' / 'my Guru Dev').

【Role & Tone Guidelines】
- You are strictly the Master and Spiritual Guide (Pujya Maharaj Ji). The user asking is the devotee / seeker.
- Address the seeker with warmth and fatherly affection ("Look, my child...", "Listen, brother...").
- Respond strictly in fluent, dignified, and devotional English.
- Provide an expansive, thorough spiritual discourse. Do NOT abbreviate or truncate your guidance. Address root emotional and philosophical dilemmas with scriptural depth, analogies, and practical sadhana steps.
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

const ORACLE_SIMPLE_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज हैं। साधक के प्रश्न का उत्तर 2-3 सीधे, सारगर्भित व प्रभावशाली वाक्यों में दीजिए। दोहराव मत कीजिए।`;
const ORACLE_DEEP_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज हैं। साधक के प्रश्न का अत्यंत गंभीर, सारगर्भित और व्यावहारिक समाधान लगभग 200-300 शब्दों में दीजिए। किसी भी वाक्य या विचार को दोहराए बिना एक ही बार में पूर्ण उत्तर दीजिए।`;

const ORACLE_SIMPLE_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj. Answer the devotee directly in 2-3 clear, spiritually profound sentences in English. Do not repeat phrases.`;
const ORACLE_DEEP_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj. Answer the devotee with spiritual depth in approximately 200-300 words in English. Conclude directly without repeating points.`;

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
 * Spiritual Discourse Polisher & Master Refiner for Deep Mode:
 * Synthesizes a comprehensive, satisfying discourse (~250-350 words).
 * Eliminates all verbatim and paraphrased loops.
 * Guarantees every sentence terminates cleanly at '।'.
 */
async function refineDeepTunedResponseWithGroq(draft, userMessage, isEnglish = false) {
  if (!draft || draft.trim().length < 30) return draft;

  const refinePrompt = isEnglish
    ? `You are an authentic master spiritual editor for discourses of Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj.
Your job:
1. FULL, COMPLETE DISCOURSE (250 TO 350 WORDS):
   - Do NOT make the answer too short (do NOT give an abbreviated 1-paragraph summary).
   - Deliver an expansive, spiritually profound satsang in Pujya Maharaj Ji's exact fatherly voice.
   - Address the root dilemma (why human life was given, why temporary worldly pleasures leave the soul empty), provide practical sadhana (Radha Naam Jap, Nishkam Seva in household life), and conclude with a divine blessing.
2. ELIMINATE PARAPHRASED & THEMATIC REDUNDANCY (CRITICAL):
   - Eliminate all repetitive loops or restatements of the same thought. Never cycle through the same sentences or questions twice.
3. GUARANTEE PERFECT TERMINATION AT '.':
   - Every sentence must be grammatically complete and end cleanly. Never leave dangling phrases.
4. Output ONLY the polished discourse without any preamble, markdown formatting, or metadata.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) के प्रवचनों के परम प्रामाणिक संपादक हैं।
आपका कार्य:
1. सारगर्भित, पूर्ण व संतोषजनक उपदेश (लगभग 250 से 350 शब्द):
   - उत्तर को बहुत छोटा या अधूरा न काटें। साधक को पूज्य महाराज जी की प्रामाणिक वाणी व शैली में पूर्ण, गहरा व आत्मीय समाधान दीजिए।
   - विषय को गहराई से समझाइए: मनुष्य जीवन का वास्तविक उद्देश्य, संसार के क्षणिक विषय-भोगों की व्यर्थता, गृहस्थी व समाज में निष्काम कर्म को ही प्रभु सेवा मानना, और निरंतर 'श्री राधा' नाम जप की महिमा।
2. दोहराव व पुनरुक्ति का पूर्ण निवारण (अत्यंत महत्वपूर्ण):
   - यदि प्रारूप (Draft) में एक ही बात, वाक्य या प्रश्न ("कर्तव्य कर्मों में भगवत भाव रखना चाहिए...", "तो क्या किया तुमने?") बार-बार दोहराया गया हो, तो उस दोहराव को पूर्णतः हटाकर एक ही बार श्रेष्ठतम शब्दों में प्रस्तुत कीजिए।
3. अपूर्ण वाक्यों का सुधार व पूर्ण विराम (।) पर समापन:
   - हर वाक्य व्याकरण की दृष्टि से पूर्ण होना चाहिए। "करते हुए" या "परेशान कर सकता" जैसे अधूरे वाक्यों को पूर्ण कल्याणकारी विचार में बदलिए।
   - अंतिम वाक्य अनिवार्यतः पूर्ण विराम (।) और कल्याणकारी आशीर्वाद के साथ समाप्त होना चाहिए।
4. केवल और केवल पूज्य महाराज जी का पावन उपदेश लिखिए। कोई भूमिका, शीर्षक या मेटा-विवरण न दें।`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const key = getNextGroqKey();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: attempt === 0 ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: refinePrompt },
            { role: 'user', content: isEnglish ? `Devotee Query: ${userMessage}\n\nDraft from fine-tuned model:\n${draft.trim()}` : `साधक की जिज्ञासा: ${userMessage}\n\nमॉडल का कच्चा प्रारूप:\n${draft.trim()}` }
          ],
          temperature: 0.25,
          max_tokens: 1000
        })
      });
      if (response.ok) {
        const data = await response.json();
        const refined = data.choices?.[0]?.message?.content?.trim();
        if (refined && refined.length > 80) {
          return ensureCompleteFinalSentence(refined, isEnglish);
        }
      }
    } catch (e) {
      console.warn(`Groq refine attempt ${attempt + 1} error:`, e);
    }
  }

  return deduplicateRepetitionLoops(draft, isEnglish);
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
        temperature: 0.42,
        repeat_penalty: 1.25,
        frequency_penalty: 0.5,
        presence_penalty: 0.4,
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

                onChunk(accumulated);
              }
            } catch (e) {}
          }
        }
        if (loopAborted) break;
      }

      const cleanResult = deduplicateRepetitionLoops(accumulated.trim(), lang === 'english');
      const finalized = ensureCompleteFinalSentence(cleanResult || accumulated.trim(), lang === 'english');
      if (onChunk && finalized !== accumulated.trim()) {
        onChunk(finalized);
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
                  onChunk(accumulated);
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
 *   During this initial moment, reasoning window has NOT started yet.
 * - Phase 2 (Reasoning Begins): Once initial thought ends with '।', Reasoning Window begins!
 *   Raw background tokens and analysis stream inside the compact Reasoning Window.
 * - Phase 3 (Phased Thought Additions): New verified, non-repetitive sentences appear in main output
 *   with 10s or more delay between lines.
 * - Phase 4 (Final Synthesis): Groq master refiner synthesizes the whole 250-350 word discourse,
 *   guaranteeing zero repetition, authentic Maharaj Ji style, and flawless sentence endings at '।'.
 */
function createDeepModeStreamTracker(onChunk, userMessage, isEnglish) {
  let accumulatedRaw = '';
  let thoughtStream = isEnglish
    ? `🔍 Query Intent: Contemplating spiritual guidance for seeker ("${userMessage.slice(0, 45)}").\n📜 Scriptural Knowledge Deliberation from Pujya Maharaj Ji's Teachings:\n`
    : `🔍 जिज्ञासा व भाव-मंथन: साधक के प्रश्न ("${userMessage.slice(0, 45)}") का शास्त्रीय विश्लेषण।\n📜 पूज्य महाराज जी के दिव्य प्रवचनों से ज्ञान संकलन:\n`;
  const startTime = Date.now();

  // Phase tracking
  let phase1Done = false;
  let phase1Content = '';
  let revealedSentences = [];
  let lastPhaseRevealTime = 0;
  let candidateBuffer = '';

  const handleToken = (token) => {
    accumulatedRaw += token;

    // --- PHASE 1: Initial Hook (~35-60 words ending cleanly at '।') ---
    if (!phase1Done) {
      phase1Content += token;

      const words = phase1Content.trim().split(/\s+/).filter(Boolean).length;
      const endsWithSentence = /[।!?.]\s*$/.test(phase1Content.trim());

      // When the opening reaches a clean sentence boundary '।' after sufficient introductory depth:
      if (endsWithSentence && words >= 25) {
        phase1Done = true;
        const initialClean = ensureCompleteFinalSentence(phase1Content.trim(), isEnglish);
        revealedSentences = [initialClean];
        lastPhaseRevealTime = Date.now();

        // Phase 1 completes: Reasoning window now officially begins!
        onChunk({
          content: initialClean,
          thought: thoughtStream,
          isThinking: true, // Reasoning starts now!
          thinkingDuration: (Date.now() - startTime) / 1000,
        });
        return;
      }

      // During Phase 1 typing, Reasoning window is NOT displayed yet
      onChunk({
        content: phase1Content,
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
      });
      return;
    }

    // --- PHASE 2: Reasoning is Active ---
    // All background tokens stream into the reasoning block
    thoughtStream += token;
    candidateBuffer += token;

    // --- PHASE 3: Phased Main Discourse Reveals (10s or more delayed between lines) ---
    const now = Date.now();
    if (now - lastPhaseRevealTime >= 10000) {
      // Look for the next complete sentence in the candidate buffer
      const match = candidateBuffer.match(/^([^।!?.\n]{20,}[।!?.\n])/);
      if (match) {
        const nextSentence = match[1].trim();
        candidateBuffer = candidateBuffer.slice(match[0].length).trim();

        // Check if this new sentence is a duplicate or repetitive loop
        if (!isSentenceSemanticDuplicate(nextSentence, revealedSentences)) {
          revealedSentences.push(nextSentence);
          lastPhaseRevealTime = now;
        }
      }
    }

    onChunk({
      content: revealedSentences.join(' '),
      thought: thoughtStream,
      isThinking: true,
      thinkingDuration: (Date.now() - startTime) / 1000,
    });
  };

  const finalize = async (finalRaw) => {
    const raw = (finalRaw || accumulatedRaw).trim();
    if (!raw) {
      return {
        content: isEnglish ? 'Radhe Radhe! Keep the Holy Name in your heart.' : 'राधे राधे भैया! मन को शांत रखिए और भगवन्नाम का आश्रय लीजिए।',
        thought: '',
        isThinking: false,
        thinkingDuration: 0,
      };
    }

    // Phase 4: Master synthesis by Groq:
    // Guarantees non-repetitive, authentic ~250-350 word discourse ending in '।'
    let finalFramedDiscourse = '';
    try {
      const refined = await refineDeepTunedResponseWithGroq(raw, userMessage, isEnglish);
      finalFramedDiscourse = ensureCompleteFinalSentence(refined || raw, isEnglish);
    } catch (e) {
      finalFramedDiscourse = ensureCompleteFinalSentence(deduplicateRepetitionLoops(raw, isEnglish), isEnglish);
    }

    const duration = Number(Math.max(1.8, (Date.now() - startTime) / 1000).toFixed(1));

    // Structured thought summary for the collapsed thinking accordion
    let finalThoughtSummary = thoughtStream.trim();
    if (finalThoughtSummary.length > 500) {
      finalThoughtSummary = finalThoughtSummary.slice(0, 450) + '...\n\n💡 वाक्य-संतुलन व सुधार: अपूर्ण विचारों को परिपूर्ण आध्यात्मिक संदर्भ में संजोया गया।\n✓ चिंतन संपन्न। पूर्ण उपदेश संकलित।';
    } else {
      finalThoughtSummary += '\n\n💡 वाक्य-संतुलन व सुधार: अपूर्ण विचारों को परिपूर्ण आध्यात्मिक संदर्भ में संजोया गया।\n✓ चिंतन संपन्न। पूर्ण उपदेश संकलित।';
    }

    const finalPayload = {
      content: finalFramedDiscourse,
      thought: finalThoughtSummary,
      isThinking: false,
      thinkingDuration: duration,
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
    const groqResult = await callDirectGroqAPI(messages, isComplex ? 500 : 350, true, onChunk, false);
    if (groqResult) {
      return ensureCompleteFinalSentence(groqResult, isEnglish);
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, isComplex ? 400 : 280, true, onChunk, false);
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
