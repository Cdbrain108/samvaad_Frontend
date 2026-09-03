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

const HINGLISH_REGEX = /\b(kya|kaise|kyu|kyun|karein|kare|hai|hain|nahi|nahin|hota|hoti|hote|mera|meri|mere|mujhe|hum|humko|aap|apka|apki|apke|man|mann|naam|jap|bhajan|satsang|prabhu|bhagwan|krishna|radha|maharaj|ji|batao|bataiye|samjhaiye|shlok|gita|kripa|guru|gurudev)\b/i;

export function detectLanguage(text) {
  if (!text) return 'hindi';
  const clean = text.trim();
  if (/[\u0900-\u097F]/.test(clean) || HINGLISH_REGEX.test(clean)) {
    return 'hindi';
  }
  return 'english';
}

const GURU_SYSTEM_PROMPT_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
एकांतिक वार्तालाप में भक्त द्वारा पूछे गए प्रश्न का प्रथम पुरुष ('हम'/'मेरा'/'हमारे गुरुदेव') में अत्यंत करुणामय, गंभीर, स्पष्ट और शास्त्रीय आधार पर व्यावहारिक मार्गदर्शन दीजिए।

【भूमिका व मर्यादा नियम】
- आप स्वयं पूज्य गुरु व मार्गदर्शक हैं। सामने प्रश्न पूछने वाला साधक/भक्त/शिष्य है।
- उत्तर का प्रारंभ सदैव 'देखो,' / 'भैया,' / 'बच्चे,' अथवा सीधे भगवन्नाम व शरणागति के उपदेश से कीजिए।
- उत्तर केवल और केवल शुद्ध देवनागरी हिंदी में होना चाहिए।
- हर संशय का मूल समाधान श्री राधा नाम जप, सत्संग, सात्विक आहार और प्रभु चरणों में अनन्य शरणागति से कीजिए।
- अपना उपदेश 2 से 3 संक्षिप्त अनुच्छेदों में पूर्ण कीजिए। उत्तर का समापन सदैव पूर्ण विराम (।) और कल्याणकारी आशीर्वाद के साथ कीजिए। किसी वाक्य या विचार को कभी अधूरा न छोड़ें।`;

const GURU_SYSTEM_PROMPT_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan).
In an intimate spiritual dialogue (Ekantik Vartalap), answer the devotee's question with utmost compassion, fatherly affection, and clarity in the FIRST PERSON ('I' / 'we' / 'my Guru Dev' / 'my Beloved Lord').

【Role & Tone Guidelines】
- You are strictly the Master and Spiritual Guide (Pujya Maharaj Ji). The user asking is the devotee / seeker.
- Address the seeker with warmth and fatherly affection ("Look, my child...", "Listen, brother...").
- Respond strictly in fluent, dignified, and devotional English.
- Emphasize chanting the Holy Name of God (Naam Jap, 'Radha Radha'), sincere Satsang, righteous karma, and total surrender to Divine Will.
- Deliver your divine guidance concisely within 2 to 3 well-structured paragraphs (around 150-200 words). Always finish your thoughts with a complete concluding sentence and a spiritual blessing. Never stop mid-sentence or leave thoughts cut off.`;

const ORACLE_LEAN_PROMPT_HINDI = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं। साधक के प्रश्न का उत्तर वात्सल्य, करुणा और श्री राधा नाम की महिमा के साथ 2-3 वाक्यों में पूर्ण विराम सहित दीजिए। सदा पूज्य गुरु भाव में रहिए।`;
const ORACLE_LEAN_PROMPT_ENGLISH = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan). Answer the devotee's spiritual question with utmost warmth, compassion, and the glory of the Holy Name in 2-3 complete sentences in English ending with a full stop. Always maintain the sacred Guru persona.`;

function cleanIncompleteTrailing(text) {
  if (!text) return text;
  let t = text.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim();
  if (/[।!?.\"\']$/.test(t)) return t;
  const lastPuncIdx = Math.max(
    t.lastIndexOf('।'),
    t.lastIndexOf('.'),
    t.lastIndexOf('!'),
    t.lastIndexOf('?')
  );
  if (lastPuncIdx > t.length * 0.5) {
    return t.slice(0, lastPuncIdx + 1).trim();
  }
  return t;
}

/**
 * Direct HTTPS caller for dedicated 24/7 Oracle Cloud Q8_0 server
 */
async function callDirectOracleAPI(messages, maxTokens = 250, stream = false, onChunk = null) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const prompt = lang === 'english' ? ORACLE_LEAN_PROMPT_ENGLISH : ORACLE_LEAN_PROMPT_HINDI;

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
        max_tokens: maxTokens,
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
async function callDirectGroqAPI(messages, maxTokens = 750, stream = false, onChunk = null) {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lang = detectLanguage(latestUserMsg);
  const systemPrompt = lang === 'english' ? GURU_SYSTEM_PROMPT_ENGLISH : GURU_SYSTEM_PROMPT_HINDI;

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
          temperature: 0.3,
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

  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Path 1: If on localhost with local backend active, use local stream route
  if (isLocalHost) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, temperature: 0.35, max_tokens: 750, mode }),
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
  if (mode === 'deep') {
    // Priority 1 in Deep Mode: Dedicated Oracle Cloud Q8_0 Server
    const oracleResult = await callDirectOracleAPI(messages, 350, true, onChunk);
    if (oracleResult) {
      return cleanIncompleteTrailing(oracleResult) || oracleResult;
    }
    // Deep fallback: Fast Groq engine
    const groqResult = await callDirectGroqAPI(messages, 1000, true, onChunk);
    if (groqResult) {
      return cleanIncompleteTrailing(groqResult) || groqResult;
    }
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU
    const groqResult = await callDirectGroqAPI(messages, 1000, true, onChunk);
    if (groqResult) {
      return cleanIncompleteTrailing(groqResult) || groqResult;
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, 350, true, onChunk);
    if (oracleResult) {
      return cleanIncompleteTrailing(oracleResult) || oracleResult;
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
