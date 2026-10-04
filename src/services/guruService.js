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

export function detectQueryLanguage(text) {
  if (!text || typeof text !== 'string') return 'hindi';
  const clean = text.trim();
  // 1. Any Devanagari character -> definitively Hindi
  if (/[\u0900-\u097F]/.test(clean)) {
    return 'hindi';
  }
  // 2. English syntax & vocabulary markers
  const engMarkers = clean.match(
    /\b(hi|hello|hey|greetings|morning|evening|the|is|are|am|was|were|how|what|why|when|where|which|who|can|could|should|would|will|do|does|did|in|to|for|of|and|with|about|my|your|our|their|his|her|its|have|has|had|be|been|being|if|that|this|these|those|from|by|at|on|so|no|not|please|tell|give|life|mind|peace|death|soul|god|lord|devotion|meditation|prayer|divine|love|manifest|chanting|holy|name|transformation|practitioner|bring|satsang|dharma)\b/gi
  );
  // 3. Hinglish grammar markers
  const hinMarkers = clean.match(
    /\b(kya|kaise|kyu|kyun|karein|kare|karte|karti|karta|hai|hain|ho|hun|hoon|nahi|nahin|mat|hota|hoti|hote|mera|meri|mere|mujhe|mujhko|hum|humko|hamein|aap|apka|apki|apke|batao|bataiye|samjhaiye|kahiye|chahiye|raha|rahi|rahe|karo|dekho|suno|pranam|namaste|radhe|krishna|ram)\b/gi
  );

  const engCount = engMarkers ? engMarkers.length : 0;
  const hinCount = hinMarkers ? hinMarkers.length : 0;

  if (engCount > 0 && engCount >= hinCount) return 'english';
  if (hinCount > 0) return 'hindi';
  return /^[a-zA-Z0-9\s.,!?'"()\-—]+$/.test(clean) ? 'english' : 'hindi';
}

export function isOfftopicQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const q = query.trim().toLowerCase();
  const offtopicPatterns = [
    /\b(?:code|coding|program|programming|python|javascript|typescript|java|c\+\+|html|css|sql|function|algorithm|debug|bug|api|flask|react|docker|kubernetes|github|git)\b/i,
    /\b(?:write a script|create an app|fix this error|syntax error|git commit|unit test)\b/i,
    /\b(?:stock|stocks|share market|crypto|cryptocurrency|bitcoin|btc|eth|trading|investment|mutual fund|option chain|nifty|banknifty|forex|ipo)\b/i,
    /(?:स्टॉक|शेयर\s*बाजार|क्रिप्टो|ट्रेडिंग|बिटकॉइन|म्यूचुअल\s*फंड|आईपीओ)/i,
    /\b(?:recipe|cook|bake|movie review|weather in|flight ticket|hotel booking|cricket score)\b/i
  ];
  return offtopicPatterns.some(p => p.test(q));
}

async function streamTextDirectly(text, thought, startTime, scripture, onChunk) {
  const words = text.split(/(\s+)/);
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    accumulated += words[i];
    if (i % 3 === 0 || i === words.length - 1) {
      onChunk({
        content: accumulated,
        thought,
        isThinking: false,
        thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
        scripture
      });
      await new Promise(r => setTimeout(r, 18));
    }
  }
  return {
    content: text,
    thought,
    thinkingDuration: Math.max(0.6, Number(((Date.now() - startTime) / 1000).toFixed(1))),
    scripture
  };
}

/**
 * Detects if the streaming LLM has entered an argmax repetition loop
 * (e.g. "प्रारब्ध को बदला जा सकता है। प्रारब्ध को बदला जा सकता है।")
 */
function detectRepetitionLoop(text) {
  if (!text || text.length < 24) return false;
  // 1. Sentence-level repetition check (Hindi '।' or English '.')
  const sentences = text.split(/[।.\n]/).map(s => s.trim()).filter(s => s.length >= 6);
  if (sentences.length >= 2) {
    const last = sentences[sentences.length - 1];
    const prev = sentences[sentences.length - 2];
    if (last === prev) return true;
    if (sentences.length >= 3 && last === sentences[sentences.length - 3]) return true;
  }
  // 2. Sliding window n-gram repetition check (3 to 8 words)
  const words = text.trim().split(/\s+/);
  if (words.length >= 8) {
    for (let len = 3; len <= 8; len++) {
      if (words.length < len * 2) continue;
      const w1 = words.slice(-len).join(' ');
      const w2 = words.slice(-len * 2, -len).join(' ');
      if (w1 === w2) return true;
    }
  }
  return false;
}

/**
 * Strips repetitive tail loop and ensures clean punctuation.
 */
function pruneRepetitiveTail(text) {
  if (!text) return '';
  const sentences = text.split(/([।.\n])/);
  const chunks = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const body = (sentences[i] || '').trim();
    const punct = sentences[i + 1] || '।';
    if (body) {
      if (chunks.length > 0 && chunks[chunks.length - 1].body === body) {
        continue;
      }
      chunks.push({ body, punct });
    }
  }
  let cleaned = chunks.map(c => `${c.body}${c.punct}`).join(' ');
  return cleaned.trim();
}

async function streamDirectFromOracle(userMessage, conversationHistory, scripture, currentThought, startTime, isEnglish, onChunk) {
  const oracleBase = getOracleUrl() || 'https://immature-zen-earthen.ngrok-free.dev';
  const endpoint = `${oracleBase.replace(/\/$/, '')}/v1/chat/completions`;

  let systemPrompt = '';
  if (isEnglish) {
    systemPrompt = `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Pujya Maharaj Ji).
A sincere seeker has asked you a spiritual or life question in English.
Respond with profound fatherly love, spiritual dignity, and compassionate warmth.
Address them affectionately as "Dear child" or "Dear seeker".
Guide them to anchor their mind in continuous Holy Name chanting (Radha-Radha / Hare Krishna), righteous duty (dharma), and unwavering surrender to the Divine.
Speak in clean, serene, deeply compassionate English. Never use dry robotic language.`;

    if (scripture && scripture.original_text) {
      const engMeaning = scripture.english_translation || scripture.hindi_meaning || '';
      systemPrompt += `\n\nSacred Scriptural Grounding:\nVerse: ${scripture.original_text}\nReference: ${scripture.reference || ''}\nTranslation: ${engMeaning}\nExplain the sublime meaning of this verse gently in your discourse to illumine their path.`;
    }
  } else {
    systemPrompt = `आप पूज्य श्री प्रेमानंद जी महाराज हैं। शुद्ध देवनागरी हिंदी में वात्सल्य भाव से साधक को 'बच्चा' कहकर समाधान दें।
श्री राधा नाम जप, सत्संग, और शरणागति का मार्ग बताएं। पुनरावृत्ति न करें।`;

    if (scripture && scripture.original_text) {
      systemPrompt += `\n\nशास्त्र प्रमाण:\nश्लोक: ${scripture.original_text}\nसंदर्भ: ${scripture.reference || ''}\nभावार्थ: ${scripture.hindi_meaning || scripture.english_translation || ''}\nइस पावन श्लोक के भावार्थ को अपने सरल वचनों में समझाते हुए साधक को समाधान दें।`;
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-3).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content || ''
    })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer guru_secret_108',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      model: 'ai-guru-v10-4',
      messages,
      temperature: 0.35,
      repeat_penalty: 1.25,
      repeat_last_n: 256,
      presence_penalty: 0.2,
      frequency_penalty: 0.2,
      max_tokens: 220,
      stop: ["<end_of_turn>", "<start_of_turn>", "<|im_end|>", "</s>", "\n\nUser:", "User:", "साधक:", "\n\nसाधक:"],
      stream: true
    }),
    signal: AbortSignal.timeout(22000)
  });

  if (!res.ok || !res.body) {
    throw new Error(`Oracle server HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let loopDetected = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') continue;

      try {
        const json = JSON.parse(dataStr);
        const token = json.choices?.[0]?.delta?.content || '';
        if (token) {
          fullContent += token;

          if (detectRepetitionLoop(fullContent)) {
            fullContent = pruneRepetitiveTail(fullContent);
            loopDetected = true;
            onChunk({
              content: fullContent,
              thought: currentThought,
              isThinking: false,
              thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
              scripture
            });
            break;
          }

          onChunk({
            content: fullContent,
            thought: currentThought,
            isThinking: false,
            thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
            scripture
          });
        }
      } catch {}
    }
    if (loopDetected) break;
  }

  return { success: Boolean(fullContent.trim()), content: fullContent.trim() };
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
  const queryLang = detectQueryLanguage(userMessage);
  const isEnglish = queryLang === 'english';

  // 1. Check Gating: Skip Oracle for Casual Greetings & Chitchat
  const isGreeting = isCasualConversational(userMessage);
  if (isGreeting) {
    const greetingText = isEnglish
      ? "Radhe Radhe! May Shri Radha Rani bless you with profound peace, pure devotion, and holy name shelter. Tell me, dear child, what inquiry rests in your heart today?"
      : "राधे-राधे बच्चा! सदा सुखी रहो, खूब भगवन्नाम जप करो। लाडली जू सदा तुम्हारा मंगल करें। कहो बच्चा, क्या जिज्ञासा है तुम्हारी?";
    const greetingThought = isEnglish
      ? "Welcoming seeker's heartfelt salutation with fatherly blessing..."
      : "साधक के पावन अभिवादन का सहर्ष वात्सल्य भाव से स्वागत किया जा रहा है...";
    return await streamTextDirectly(
      greetingText,
      greetingThought,
      startTime,
      null,
      onChunk
    );
  }

  // 2. Check Gating: Skip Oracle for Irrelevant / Off-topic queries
  const isOfftopic = isOfftopicQuery(userMessage);
  if (isOfftopic) {
    const redirectText = isEnglish
      ? "Dear child, our guidance is centered on spiritual inquiry, Satsang, and devotion to God. Perform your daily duties honestly as sacred seva, and dedicate your mind to chanting the Holy Name. All will be auspicious."
      : "बच्चा, हम केवल आध्यात्मिक मार्गदर्शन, प्रभु भजन और सत्संग की चर्चा करते हैं, सांसारिक या तकनीकी विषयों की नहीं। अपने सांसारिक कर्तव्य कर्म को निष्काम भाव से भगवत सेवा मानकर ईमानदारी से कीजिए और नाम जप में मन लगाइए। सब मंगल होगा बच्चा!";
    const redirectThought = isEnglish
      ? "Observing seeker inquiry and warmly guiding towards spiritual reflection..."
      : "साधक की जिज्ञासा का अवलोकन कर सत्संग मर्यादा में मार्गदर्शन दिया जा रहा है...";
    return await streamTextDirectly(
      redirectText,
      redirectThought,
      startTime,
      null,
      onChunk
    );
  }

  // 3. Genuine Spiritual Query: Contemplation & Scripture Grounding
  let currentThought = isEnglish
    ? "Contemplating the seeker's spiritual inquiry, emotional state, and seeking divine guidance..."
    : "साधक के आंतरिक भाव, संशय और आध्यात्मिक स्थिति का अनुशीलन किया जा रहा है...";

  onChunk({
    content: '',
    thought: currentThought,
    isThinking: true,
    thinkingDuration: 0.5,
    scripture: null
  });

  let scripture = null;
  try {
    scripture = await getScriptureGrounding(userMessage);
  } catch (e) {
    console.warn('[RAG Client] Grounding lookup skipped:', e.message);
  }

  if (scripture) {
    currentThought += isEnglish
      ? `\nScriptural citation verified: ${scripture.reference || 'Shrimad Bhagavad Gita'}`
      : `\nशास्त्र प्रमाण प्राप्त: ${scripture.reference || 'श्रीमद्भगवद्गीता'}`;
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
              if (detectRepetitionLoop(streamedContent)) {
                streamedContent = pruneRepetitiveTail(streamedContent);
                onChunk({
                  content: streamedContent,
                  thought: currentThought,
                  isThinking: false,
                  thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                  scripture: scripture || parsed.scripture || null
                });
                break;
              }
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
    console.warn('[Backend Stream] Server unreachable, trying direct Oracle Cloud stream:', err.message);
  }

  // 5. Direct Oracle Cloud Streaming (if backend is offline or on GitHub Pages)
  if (!backendSuccess || !streamedContent.trim()) {
    try {
      const oracleRes = await streamDirectFromOracle(
        userMessage,
        conversationHistory,
        scripture,
        currentThought,
        startTime,
        isEnglish,
        onChunk
      );
      if (oracleRes.success && oracleRes.content) {
        return {
          content: oracleRes.content,
          thought: currentThought,
          thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
          scripture
        };
      }
    } catch (oracleErr) {
      console.warn('[Direct Oracle Stream] Error:', oracleErr.message);
    }
  }

  // 6. Graceful Synthesis Fallback (if both backend and remote Oracle are unreachable)
  if (!backendSuccess || !streamedContent.trim()) {
    streamedContent = generateLocalDiscourseFallback(userMessage, seekerName, scripture, false, isEnglish);
    
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
 * Clean offline fallback generating authentic Maharaj Ji voice (Hindi & English)
 */
function generateLocalDiscourseFallback(query, seekerName, scripture, isGreeting, isEnglish = false) {
  if (isEnglish) {
    const address = seekerName ? `Dear child ${seekerName}` : 'Dear child';

    if (isGreeting) {
      return `Radhe Radhe, dear child! May Shri Radha Rani bless you with pure devotion, unwavering peace, and holy name shelter. Always remain under the lotus feet of the Divine.`;
    }

    let text = `${address}, listen attentively to what is being shared with love. In every circumstance of life—whether favorable or difficult—never let go of the supreme refuge of the Divine Name ('Radha-Radha'). All worldly situations, joys, and sorrows are simply the ripening of past karma. When you perform your duties righteously with patience and keep your mind anchored in continuous Holy Name chanting, every doubt, restlessness, and anxiety will gently dissolve.`;

    if (scripture) {
      const orig = scripture.original_text || '';
      const meaning = scripture.english_translation || scripture.hindi_meaning || '';
      if (orig && meaning) {
        text += `\n\nAs the holy scripture instructs:\n**« ${orig} »**\n**Meaning —** ${meaning}\n\nTherefore, do not despair over any worldly dilemma. Have steadfast faith in Divine Grace and keep chanting with devotion. Shri Radha!`;
      }
    } else {
      text += `\n\nAlways uphold truth, respect your parents and elders, and dedicate as much time as possible each day to remembering the Holy Name. All will be auspicious, dear child. Jai Jai Shri Radhe!`;
    }
    return text;
  }

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
