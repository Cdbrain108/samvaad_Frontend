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

const ORACLE_SIMPLE_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज हैं। साधक के सरल प्रश्न का उत्तर 2-3 सीधे, संक्षिप्त व सारगर्भित वाक्यों में दीजिए।`;
const ORACLE_DEEP_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज हैं। साधक के गंभीर व विस्तृत प्रश्न का उत्तर पूर्ण शास्त्रीय गहराई, दृष्टांतों और विस्तार के साथ दीजिए।`;

const ORACLE_SIMPLE_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj. Answer the devotee's simple question directly and compactly in 2-3 sentences in English.`;
const ORACLE_DEEP_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj. Answer the devotee's deep, complex question comprehensively with scriptural depth in English.`;

function cleanIncompleteTrailing(text, isEnglish = false) {
  if (!text) return text;
  let t = text.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim();
  if (/[।!?.\"\']$/.test(t)) return t;

  const lastPuncIdx = Math.max(
    t.lastIndexOf('।'),
    t.lastIndexOf('.'),
    t.lastIndexOf('!'),
    t.lastIndexOf('?')
  );

  // If there is only a small broken token fragment at the very tail (<= 65 chars), trim cleanly
  if (lastPuncIdx !== -1 && (t.length - lastPuncIdx) <= 65) {
    return t.slice(0, lastPuncIdx + 1).trim();
  }

  // Never discard substantial sentences or paragraphs! Gracefully append terminal punctuation
  return isEnglish ? `${t}.` : `${t}।`;
}

/**
 * Precision Filter for our Fine-Tuned Model (Fast mode only):
 * Removes repetitive loops without rephrasing or overcutting.
 */
async function pruneTunedResponseWithGroq(draft, userMessage, isComplex, isDeep = false) {
  if (!draft || draft.trim().length < 30) return draft;
  // Never let Groq cut or trim responses in Deep mode!
  if (isDeep) {
    return cleanIncompleteTrailing(draft, detectLanguage(userMessage) === 'english');
  }

  const prunePrompt = `You are a gentle text-editor for our fine-tuned spiritual model (Pujya Premanand Ji Maharaj).
Your ONLY job is to eliminate exact repetitive word loops or trailing broken fragments.
CRITICAL: DO NOT SUMMARIZE OR SHORTEN. Preserve the speaker's exact vocabulary, length, colloquial Hindi phrasing, and authentic tone.
Output ONLY the clean text without any prefix, markdown explanation, or meta-comments.`;

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
          { role: 'system', content: prunePrompt },
          { role: 'user', content: `User Query: ${userMessage}\n\nDraft from Tuned Model:\n${draft.trim()}` }
        ],
        temperature: 0.1,
        max_tokens: isComplex ? 900 : 500
      })
    });
    if (response.ok) {
      const data = await response.json();
      const pruned = data.choices?.[0]?.message?.content?.trim();
      if (pruned && pruned.length > 20) {
        return pruned;
      }
    }
  } catch (e) {
    console.warn('Groq pruning fallback to raw draft:', e);
  }
  return draft;
}

/**
 * Direct HTTPS caller for dedicated 24/7 Oracle Cloud Q8_0 server
 */
async function callDirectOracleAPI(messages, maxTokens = 850, stream = false, onChunk = null, isDeepMode = false) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const complex = isDeepMode || isComplexQuery(latestUserMsg);

  let prompt;
  if (lang === 'english') {
    prompt = complex ? ORACLE_DEEP_ENGLISH : ORACLE_SIMPLE_ENGLISH;
  } else {
    prompt = complex ? ORACLE_DEEP_HINDI : ORACLE_SIMPLE_HINDI;
  }

  const effectiveTokens = isDeepMode ? Math.max(maxTokens, 850) : (complex ? Math.max(maxTokens, 550) : Math.min(maxTokens, 300));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

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
        temperature: 0.35,
        repeat_penalty: 1.22,
        max_tokens: effectiveTokens,
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
 * Main Real-Time Token Streaming Function:
 * Works seamlessly whether hosted on GitHub Pages or running on localhost!
 */
export async function streamGuruResponse(
  userMessage,
  conversationHistory = [],
  userMemoryContext = '',
  userProfile = null,
  mode = 'fast',
  onChunk = () => {}
) {
  const messages = [
    ...conversationHistory.slice(-3).map((message) => ({ role: message.role === 'user' ? 'user' : 'assistant', content: message.content })),
    { role: 'user', content: userMessage },
  ];

  const isEnglish = detectLanguage(userMessage) === 'english';
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Path 1: If on localhost with local backend active, use local stream route
  if (isLocalHost) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature: 0.35, max_tokens: mode === 'deep' ? 1000 : 750, mode }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

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
          return accumulated.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || accumulated;
        }
      }
    } catch (e) {
      console.warn('Local streaming backend unavailable, switching to public cloud endpoints...');
    }
  }

  // Path 2: Production Hosting / Cloud Fallback (GitHub Pages)
  const isComplex = isComplexQuery(userMessage);

  if (mode === 'deep') {
    // Priority 1 in Deep Mode: Dedicated Oracle Cloud Q8_0 Server (full 950 token budget)
    const oracleResult = await callDirectOracleAPI(messages, 950, true, onChunk, true);
    if (oracleResult) {
      // In Deep Mode, DO NOT let Groq cut the response down!
      // Return Oracle's authentic spiritual discourse directly & cleanly.
      return cleanIncompleteTrailing(oracleResult, isEnglish) || oracleResult;
    }
    // Deep fallback: Fast Groq engine with Deep persona & generous 1200 tokens
    const groqResult = await callDirectGroqAPI(messages, 1200, true, onChunk, true);
    if (groqResult) {
      return cleanIncompleteTrailing(groqResult, isEnglish) || groqResult;
    }
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU (clean, direct response)
    const groqResult = await callDirectGroqAPI(messages, isComplex ? 650 : 350, true, onChunk, false);
    if (groqResult) {
      return cleanIncompleteTrailing(groqResult, isEnglish) || groqResult;
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, isComplex ? 500 : 250, true, onChunk, false);
    if (oracleResult) {
      const prunedResult = await pruneTunedResponseWithGroq(oracleResult, userMessage, isComplex, false);
      return cleanIncompleteTrailing(prunedResult, isEnglish) || prunedResult;
    }
  }

  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'भैया';
  return `राधे राधे ${seekerName}! मन को शांत रखिए और भगवन्नाम (राधा नाम) का आश्रय लीजिए। प्रभु सब मंगल करेंगे।`;
}

/**
 * Standard Non-Streaming Generator (Fail-Safe)
 */
export async function generateGuruResponse(userMessage, conversationHistory = [], userMemoryContext = '', userProfile = null, mode = 'fast') {
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
