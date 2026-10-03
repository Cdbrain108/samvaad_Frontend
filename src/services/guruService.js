/**
 * 🌸 AI Guru Samvaad — Unified Client Service
 * ============================================
 * Clean, beginner-friendly service connecting the React UI to the Samvaad Backend:
 * 1. Stream Discourse: Connects to Backend SSE (/api/generate/stream) or CrewAI (/api/crew/generate).
 * 2. Agentic Reasoning: Displays the 4-stage contemplation process (Intent -> Scripture -> Counsel -> Blessing).
 * 3. Graceful Fallback: Seamless offline and local development support.
 */

import { getScriptureGrounding, isCasualConversational } from './scriptureService.js';
import { analyzeQuery } from './queryIntent.js';

export { isCasualConversational };

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : 'http://localhost:8000';

// Configuration helpers for remote endpoints & custom keys
export function getOracleUrl() {
  try {
    return localStorage.getItem('samvaad_oracle_url') || '';
  } catch {
    return '';
  }
}

export function setOracleUrl(url) {
  try {
    localStorage.setItem('samvaad_oracle_url', (url || '').trim());
  } catch {}
}

export async function testOracleModelUrl(url) {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function getCustomGroqKey() {
  try {
    return localStorage.getItem('samvaad_custom_groq_key') || '';
  } catch {
    return '';
  }
}

export function setCustomGroqKey(key) {
  try {
    localStorage.setItem('samvaad_custom_groq_key', (key || '').trim());
  } catch {}
}

/**
 * 🤖 Call Backend CrewAI Agent (/api/crew/generate)
 * Executes the 4-agent LiveSatsangCrew in the Python backend:
 * SeekerIntentAnalyst -> ScriptureScholar -> GuruGuidanceAgent -> SatsangAuditor
 */
export async function generateCrewSatsang(query) {
  const endpoint = `${API_BASE_URL}/api/crew/generate`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() }),
      signal: AbortSignal.timeout(25000)
    });
    if (!res.ok) throw new Error(`Crew server HTTP ${res.status}`);
    const data = await res.json();
    return {
      success: true,
      discourse: data.discourse || '',
      metadata: data.metadata || {}
    };
  } catch (err) {
    console.warn('[CrewAI Client] Backend endpoint unavailable:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 🌊 Primary Streaming Function for Samvaad UI
 * Coordinates agent thinking state and streams tokens word-by-word into App.jsx.
 */
export async function streamGuruResponse(
  userMessage,
  conversationHistory = [],
  memoryContext = '',
  userProfile = null,
  inferenceMode = 'deep',
  onChunk = () => {}
) {
  const startTime = Date.now();
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(/\s+/)[0] : '';

  // 1. Analyze Intent & Grounding
  const queryAnalysis = analyzeQuery ? analyzeQuery(userMessage) : { isGreeting: false };
  const isGreeting = isCasualConversational(userMessage);

  // 2. Initial Contemplation Stepper
  let currentThought = isGreeting
    ? 'साधक के पावन अभिवादन का सहर्ष वात्सल्य भाव से स्वागत किया जा रहा है...'
    : 'साधक के आंतरिक भाव, संशय और आध्यात्मिक स्थिति का अनुशीलन किया जा रहा है...';

  onChunk({
    content: '',
    thought: currentThought,
    isThinking: true,
    thinkingDuration: 0.5,
    scripture: null
  });

  // 3. Scripture Grounding Lookup (if not greeting)
  let scripture = null;
  if (!isGreeting) {
    try {
      scripture = await getScriptureGrounding(userMessage);
    } catch (e) {
      console.warn('[RAG Client] Grounding lookup skipped:', e.message);
    }
  }

  // Update thinking with scripture context
  if (scripture) {
    currentThought += `\nशास्त्र प्रमाण प्राप्त: ${scripture.reference || 'श्रीमद्भगवद्गीता'}`;
    onChunk({
      content: '',
      thought: currentThought,
      isThinking: true,
      thinkingDuration: 1.2,
      scripture
    });
  }

  // 4. Try Backend Streaming API (/api/generate/stream)
  const streamEndpoint = `${API_BASE_URL}/api/generate/stream`;
  let streamedContent = '';
  let backendSuccess = false;

  try {
    const formattedMessages = [
      ...conversationHistory.slice(-4).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || ''
      })),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(streamEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        temperature: 0.32,
        max_tokens: 1100,
        mode: inferenceMode === 'fast' ? 'fast' : 'deep'
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.replace(/^data:\s*/, '');
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.token) {
              streamedContent += parsed.token;
              backendSuccess = true;
              onChunk({
                content: streamedContent,
                thought: currentThought,
                isThinking: false,
                thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                scripture: scripture || parsed.scripture || null
              });
            } else if (parsed.scripture && !scripture) {
              scripture = parsed.scripture;
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('[Backend Stream] Server unreachable, using local agentic generator:', err.message);
  }

  // 5. Fallback: If backend is offline, synthesize high-quality guidance directly
  if (!backendSuccess || !streamedContent.trim()) {
    streamedContent = generateLocalDiscourseFallback(userMessage, seekerName, scripture, isGreeting);
    
    // Animate smoothly so UI receives tokens
    const words = streamedContent.split(/(\s+)/);
    let animatedText = '';
    for (let i = 0; i < words.length; i++) {
      animatedText += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        onChunk({
          content: animatedText,
          thought: currentThought,
          isThinking: false,
          thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
          scripture
        });
        await new Promise(r => setTimeout(r, 20));
      }
    }
  }

  const finalDuration = Math.max(1, Number(((Date.now() - startTime) / 1000).toFixed(1)));
  return {
    content: streamedContent,
    thought: currentThought,
    thinkingDuration: finalDuration,
    scripture
  };
}

/**
 * Clean offline fallback generating authentic Maharaj Ji voice
 */
function generateLocalDiscourseFallback(query, seekerName, scripture, isGreeting) {
  const address = seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा';

  if (isGreeting) {
    return `राधे राधे बच्चा! श्री जी तुम्हें खूब भक्ति, शांति और नाम जप का बल प्रदान करें। सदैव लाडली जू के चरणों का आश्रय रखो।`;
  }

  let text = `${address}, तुमने जो जिज्ञासा रखी है, उस पर ध्यान से सुनो। जीवन में चाहे कैसी भी परिस्थिति आए, भगवन्नाम (राधा-राधा) का आश्रय कभी मत छोड़ना। संसार की सब अनुकूलताएं और प्रतिकूलताएं पूर्व संचित कर्मों का फल हैं। यदि तुम धैर्यपूर्वक धर्म का आचरण करोगे और निरंतर नाम जप में लगे रहोगे, तो सब संशय शांत हो जाएंगे।`;

  if (scripture) {
    const orig = scripture.original_text || '';
    const meaning = scripture.hindi_meaning || scripture.english_translation || '';
    if (orig && meaning) {
      text += `\n\nजैसे पावन शास्त्र में भगवान का पावन निर्देश है:\n**« ${orig} »**\n**अर्थात् —** ${meaning}\n\nइसलिए किसी भी बात से निराश न हो, भगवत्कृपा पर पूर्ण विश्वास रखो। श्री राधा!`;
    }
  } else {
    text += `\n\nसदा सत्य आचरण रखो, माता-पिता और संतों का आदर करो और दिन में अधिक से अधिक समय भगवन्नाम का स्मरण करो। सब मंगल होगा बच्चा। जय जय श्री राधे!`;
  }

  return text;
}

/**
 * Non-Streaming Generator for simple requests
 */
export async function generateGuruResponse(userMessage, conversationHistory = [], userMemoryContext = '', userProfile = null, mode = 'deep') {
  return await streamGuruResponse(userMessage, conversationHistory, userMemoryContext, userProfile, mode, () => {});
}

/**
 * 🏷️ Conversation Auto-Title Generator
 */
export async function generateChatTitle(messages) {
  if (!messages || messages.length === 0) return 'Spiritual Satsang';
  const firstUserMsg = messages.find(m => m.role === 'user')?.content || '';
  if (!firstUserMsg) return 'Spiritual Satsang';
  
  const clean = firstUserMsg.replace(/[^\w\s\u0900-\u0D7F]/g, ' ').trim().split(/\s+/);
  const title = clean.slice(0, 4).join(' ');
  return title && title.length > 2 ? title : 'Spiritual Satsang';
}
