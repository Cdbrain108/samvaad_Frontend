// Groq API keys loaded from environment variables
const rawEnvKeys = import.meta.env.VITE_GROQ_API_KEYS || '';
const GROQ_API_KEYS = rawEnvKeys
  ? rawEnvKeys.split(',').map(k => k.trim()).filter(Boolean)
  : [];

let currentKeyIndex = 0;

function getNextGroqKey() {
  if (GROQ_API_KEYS.length === 0) return null;
  const key = GROQ_API_KEYS[currentKeyIndex % GROQ_API_KEYS.length];
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
}

const GURU_SYSTEM_PROMPT = `Aap "Dharma Sahayak" hain — ek param gyan-sampanna, snehi aur karunamayi guru.
Aap seeker se ek sachaai aur aadar bhare swar mein baat karte hain, jaise ek saadhak/seeker apne margdarshak guru se baat kar raha ho.

BEHAVIOR & TONE RULES:
- Address the seeker by their name warmly and naturally when appropriate.
- Speak naturally and conversationally in a warm, simple mix of Hindi & English (Hinglish) or English as used by the seeker.
- Use relatable daily life examples and authentic scriptural wisdom (Bhagavad Gita, Ramayana, Upanishads, Bhagavat Puran).
- STRICT DIRECTIVE: NEVER include stage directions, actor script cues, or parenthetical actions like "(smiling)", "(pausing)", "(thoda ruk kar)", or "(thoughtfully)". Speak completely naturally without any brackets.
- STRICT DIRECTIVE: DO NOT state meta-declarations like "I am a Guru and you are a student" or "bhaiya ji". Simply embody the master's wisdom naturally through your warmth and guidance.
- Provide clear, practical advice that fits modern daily life.`;

async function callGroqAPI(messages, temperature = 0.4, maxTokens = 800) {
  const attempts = Math.min(GROQ_API_KEYS.length, 4);

  for (let i = 0; i < attempts; i++) {
    const apiKey = getNextGroqKey();
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.strip?.() || data.choices?.[0]?.message?.content;
      }
    } catch (err) {
      console.warn(`Groq API attempt ${i + 1} failed:`, err);
    }
  }

  return null;
}

export async function generateGuruResponse(userMessage, conversationHistory = [], userMemoryContext = '', userProfile = null) {
  let seekerContext = '';
  if (userProfile && userProfile.fullName) {
    seekerContext += `<seeker_profile>\nFull Name: ${userProfile.fullName}\nAge: ${userProfile.age || 'unspecified'}\n</seeker_profile>\n`;
  }
  if (userMemoryContext) {
    seekerContext += `<user_long_term_memory>\n${userMemoryContext}\n</user_long_term_memory>\n`;
  }

  const systemPrompt = seekerContext ? `${seekerContext}\n${GURU_SYSTEM_PROMPT}` : GURU_SYSTEM_PROMPT;

  const promptMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const responseText = await callGroqAPI(promptMessages, 0.4, 900);
  if (responseText) {
    // Strip parenthetical stage directions like (smiling), (pausing), (thoda ruk kar)
    let cleanText = responseText
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/  +/g, ' ')
      .trim();
    return cleanText || responseText;
  }

  // Warm spiritual fallback if API unavailable
  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'dear seeker';
  return `Hari Om ${seekerName}! 🙏\n\nYour question touches on deep spiritual wisdom. Keep meditating on this reflection with patience and faith.`;
}

export async function generateChatTitle(messages) {
  if (!messages || messages.length === 0) return 'New Conversation';

  const previewText = messages.slice(0, 3)
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const titlePrompt = [
    {
      role: 'system',
      content: 'Generate a 2 to 5 word title summarizing the main topic. Strict rules: No quotes, no markdown, single line, 2-5 words only.'
    },
    {
      role: 'user',
      content: `Conversation:\n${previewText}\n\nTitle (2-5 words):`
    }
  ];

  const rawTitle = await callGroqAPI(titlePrompt, 0.3, 30);
  if (rawTitle) {
    const cleanTitle = rawTitle.replace(/["'`\n\r]/g, '').replace(/^(Title|Topic):\s*/i, '').trim();
    if (cleanTitle && cleanTitle.length > 2) {
      return cleanTitle;
    }
  }

  return 'New Conversation';
}
