const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const GURU_SYSTEM_PROMPT = `Aap "Dharma Sahayak" hain — ek param gyan-sampanna, snehi aur karunamayi guru.
Aap seeker se ek sachaai aur aadar bhare swar mein baat karte hain, jaise ek saadhak/seeker apne margdarshak guru se baat kar raha ho.

BEHAVIOR & TONE RULES:
- Address the seeker by their name warmly and naturally when appropriate.
- Speak naturally and conversationally in a warm, simple mix of Hindi & English (Hinglish) or English as used by the seeker.
- Use relatable daily life examples and authentic scriptural wisdom (Bhagavad Gita, Ramayana, Upanishads, Bhagavat Puran).
- NEVER include stage directions, actor script cues, or parenthetical actions.
- Do not imply a real person is responding live; present wisdom respectfully and naturally.
- Provide clear, practical advice that fits modern daily life.`;

async function callSamvaadAPI(messages, temperature = 0.4, maxTokens = 800) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature, max_tokens: maxTokens }),
    });
    if (!response.ok) throw new Error(`Generation request failed: ${response.status}`);
    const data = await response.json();
    return data.content?.trim() || null;
  } catch (error) {
    console.warn('Samvaad generation request failed:', error);
    return null;
  }
}

export async function generateGuruResponse(userMessage, conversationHistory = [], userMemoryContext = '', userProfile = null) {
  let seekerContext = '';
  if (userProfile?.fullName) {
    seekerContext += `<seeker_profile>\nFull Name: ${userProfile.fullName}\nAge: ${userProfile.age || 'unspecified'}\n</seeker_profile>\n`;
  }
  if (userMemoryContext) seekerContext += `<user_long_term_memory>\n${userMemoryContext}\n</user_long_term_memory>\n`;

  const responseText = await callSamvaadAPI([
    { role: 'system', content: seekerContext ? `${seekerContext}\n${GURU_SYSTEM_PROMPT}` : GURU_SYSTEM_PROMPT },
    ...conversationHistory.slice(-8).map((message) => ({ role: message.role === 'user' ? 'user' : 'assistant', content: message.content })),
    { role: 'user', content: userMessage },
  ], 0.4, 900);

  if (responseText) {
    return responseText.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/  +/g, ' ').trim() || responseText;
  }

  const seekerName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'dear seeker';
  return `Hari Om ${seekerName}! 🙏\n\nYour question touches on deep spiritual wisdom. Keep meditating on this reflection with patience and faith.`;
}

export async function generateChatTitle(messages) {
  if (!messages?.length) return 'New Conversation';
  const previewText = messages.slice(0, 3).map((message) => `${message.role}: ${message.content}`).join('\n');
  const title = await callSamvaadAPI([
    { role: 'system', content: 'Generate a 2 to 5 word title summarizing the main topic. No quotes, markdown, or explanation.' },
    { role: 'user', content: `Conversation:\n${previewText}\n\nTitle:` },
  ], 0.3, 30);
  const cleanTitle = title?.replace(/["'`\n\r]/g, '').replace(/^(Title|Topic):\s*/i, '').trim();
  return cleanTitle && cleanTitle.length > 2 ? cleanTitle : 'New Conversation';
}
