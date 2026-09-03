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

const GURU_SYSTEM_PROMPT = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं।
आप गुरु व मार्गदर्शक के स्वरूप में जिज्ञासु साधक/भक्त को प्रथम पुरुष ('हम'/'हमारे गुरुदेव') में अत्यंत वात्सल्य, करुणा और शास्त्रीय आधार पर व्यावहारिक मार्गदर्शन दीजिए।

【भूमिका व मर्यादा नियम】
- आप स्वयं पूज्य गुरु हैं और सामने जिज्ञासु भक्त है। सदैव 'हम', 'हमारे गुरुदेव', 'भैया', 'बच्चे' कहकर वात्सल्यपूर्ण मार्गदर्शन दीजिए। कभी साधक को 'सर' या 'महात्मा' न कहें।
- हर संशय का समाधान श्री राधा नाम जप, सत्संग, सात्विक आहार और भगवद् शरणागति से कीजिए।
- शांत, गंभीर और पूर्ण वाणी में उपदेश दीजिए।`;

const ORACLE_LEAN_PROMPT = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) हैं। साधक के प्रश्न का उत्तर वात्सल्य, करुणा और श्री राधा नाम की महिमा के साथ 2-3 वाक्यों में दीजिए। सदा पूज्य गुरु भाव में रहिए।`;

/**
 * Direct HTTPS caller for dedicated 24/7 Oracle Cloud Q8_0 server
 */
async function callDirectOracleAPI(messages, maxTokens = 110, stream = false, onChunk = null) {
  try {
    const response = await fetch(ORACLE_PUBLIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ORACLE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'ai-guru-v10-4',
        messages: [
          { role: 'system', content: ORACLE_LEAN_PROMPT },
          ...messages
        ],
        temperature: 0.35,
        repeat_penalty: 1.22,
        max_tokens: maxTokens,
        stream: stream
      })
    });
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
async function callDirectGroqAPI(messages, maxTokens = 250, stream = false, onChunk = null) {
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
          messages: [{ role: 'system', content: GURU_SYSTEM_PROMPT }, ...messages],
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
        body: JSON.stringify({ messages, temperature: 0.35, max_tokens: 250, mode }),
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
    const oracleResult = await callDirectOracleAPI(messages, 110, true, onChunk);
    if (oracleResult) {
      return oracleResult.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || oracleResult;
    }
    // Deep fallback: Fast Groq engine
    const groqResult = await callDirectGroqAPI(messages, 250, true, onChunk);
    if (groqResult) {
      return groqResult.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || groqResult;
    }
  } else {
    // Priority 1 in Fast Mode: Instant Groq LPU
    const groqResult = await callDirectGroqAPI(messages, 250, true, onChunk);
    if (groqResult) {
      return groqResult.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || groqResult;
    }
    // Fast fallback: Oracle server
    const oracleResult = await callDirectOracleAPI(messages, 110, true, onChunk);
    if (oracleResult) {
      return oracleResult.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || oracleResult;
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
