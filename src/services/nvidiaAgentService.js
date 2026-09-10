/**
 * NVIDIA Developer Reasoning & Agentic RAG Service for Samvaad
 * ==============================================================
 * Integrates high-reasoning developer models from build.nvidia.com:
 * - deepseek-ai/deepseek-r1 & deepseek-ai/deepseek-v3
 * - moonshotai/kimi-k3
 * - qwen/qwen2.5-72b-instruct
 * - meta/llama-3.3-70b-instruct
 *
 * Provides:
 * 1. Deep Dharmic Reasoning & Intent Understanding (Chain-of-Thought)
 * 2. Self-Verifying Shloka Critic: Evaluates candidate verses to discard
 *    ritual/funeral noise and select authentic moral guidance.
 */

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export function getNvidiaApiKey() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('samvaad_nvidia_key');
      if (saved && saved.trim()) return saved.trim();
    }
  } catch {}
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NVIDIA_API_KEY) || '';
}

export function setNvidiaApiKey(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('samvaad_nvidia_key', (key || '').trim());
    }
  } catch {}
}

export function isNvidiaAvailable() {
  return Boolean(getNvidiaApiKey());
}

/**
 * Call NVIDIA Developer API (OpenAI Compatible)
 */
async function callNvidiaChat(messages, options = {}) {
  const apiKey = getNvidiaApiKey();
  if (!apiKey) return null;

  const model = options.model || 'deepseek-ai/deepseek-v3';
  const temperature = options.temperature ?? 0.2;
  const max_tokens = options.max_tokens ?? 650;
  const jsonMode = options.jsonMode ?? false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 9000);

  try {
    const res = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
      })
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[!] NVIDIA API returned status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[!] NVIDIA Developer API call error:', err.message);
    return null;
  }
}

/**
 * Phase 1: Deep Dharmic Reasoning & Concept Expansion
 */
export async function runNvidiaDharmicReasoning(userMessage, conversationHistory = [], isEnglish = false) {
  if (!isNvidiaAvailable()) return null;

  const systemPrompt = isEnglish
    ? `You are an enlightened Spiritual Reasoning Agent for Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj Satsang (Samvaad).
Reflect deeply with compassionate Chain-of-Thought deliberation on the seeker's emotional suffering and spiritual conflict.
Translate colloquial emotion words into canonical Sanskrit Dharmic concepts (e.g., extramarital attraction -> परदाराभिमर्श, काम-वासना, मर्यादा, मातृवत् परदारेषु; grief -> आत्मा अमर, शोक निवारण; restless mind -> अभ्यास, वैराग्य).
Distinguish divine selfless love (प्रेम) from fleeting sensory attachment/lust (काम/आसक्ति).
You must output a strictly valid JSON object with keys:
1. "thought_process": 2-3 heartfelt sentences reflecting on the seeker's inner state and solace.
2. "spiritual_theme": The core spiritual theme.
3. "canonical_sanskrit_terms": Space-separated authentic Sanskrit concepts for Shastric retrieval.
4. "target_scriptures": Recommended scriptures for this specific dilemma.
5. "specific_shloka_words": Key Sanskrit verse words relevant to this dilemma.
6. "seeker_state": Brief 1-sentence summary of seeker state.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन) के आध्यात्मिक चिंतन व शास्त्र अनुसंधान एजेंट हैं।
साधक के अंतर्मन की व्यथा, द्वंद्व व परिस्थिति का अत्यंत आत्मीय, वात्सल्यपूर्ण व गंभीर चिंतन करें।
बोलचाल के शब्दों को शास्त्रीय संस्कृत संकल्पनाओं में बदलें (जैसे विवाहेतर आकर्षण -> परदाराभिमर्श, काम-वासना, मर्यादा, मातृवत् परदारेषु; शोक -> आत्मा-अमरता; चंचल मन -> अभ्यास-वैराग्य)।
सच्चे दिव्य प्रेम और काम-वासना के भ्रम का आध्यात्मिक विवेक करें।
अनिवार्य रूप से केवल वैध JSON ऑब्जेक्ट दें जिसमें यह कुंजियाँ हों:
1. "thought_process": साधक की स्थिति पर २-३ आत्मीय व गहरे वाक्य।
2. "spiritual_theme": मूल आध्यात्मिक विषय।
3. "canonical_sanskrit_terms": शास्त्रीय संस्कृत संकल्पना शब्द (स्पेस से अलग)।
4. "target_scriptures": इस समस्या हेतु सबसे प्रामाणिक ग्रंथ।
5. "specific_shloka_words": प्रासंगिक श्लोक के मूल संस्कृत शब्द।
6. "seeker_state": साधक की मनःस्थिति का सारांश।`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  // Try DeepSeek-V3 or Kimi-k3
  const models = ['deepseek-ai/deepseek-v3', 'moonshotai/kimi-k3', 'qwen/qwen2.5-72b-instruct'];
  for (const model of models) {
    const raw = await callNvidiaChat(messages, { model, jsonMode: true, temperature: 0.15, timeoutMs: 8000 });
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.thought_process || parsed.spiritual_theme) {
          return {
            thought_process: parsed.thought_process || '',
            spiritual_theme: parsed.spiritual_theme || '',
            canonical_sanskrit_terms: Array.isArray(parsed.canonical_sanskrit_terms)
              ? parsed.canonical_sanskrit_terms.join(' ')
              : (parsed.canonical_sanskrit_terms || ''),
            target_scriptures: Array.isArray(parsed.target_scriptures)
              ? parsed.target_scriptures.join(',')
              : (parsed.target_scriptures || ''),
            specific_shloka_words: parsed.specific_shloka_words || '',
            seeker_state: parsed.seeker_state || 'Spiritual seeker seeking guidance',
            agent_source: `nvidia_${model.split('/')[1]}`
          };
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Phase 2: Self-Reflective Shloka Critic & Relevance Verifier
 * Examines candidate scriptures retrieved by vector search and drops
 * ritual/funeral/medical noise, retaining only genuine moral & spiritual guidance.
 */
export async function verifyShlokaRelevanceWithNvidia(userMessage, candidates = [], isEnglish = false) {
  if (!isNvidiaAvailable() || !candidates || candidates.length <= 1) {
    return candidates;
  }

  const promptCandidates = candidates.map((c, i) => `[Index ${i}]
Reference: ${c.reference}
Sanskrit Text: ${c.original_text}
Meaning: ${c.hindi_meaning || c.english_translation}`).join('\n\n');

  const systemPrompt = `You are the Scripture Quality & Relevance Critic for Pujya Maharaj Ji's Satsang.
The devotee asked this real-world question:
"""
${userMessage}
"""

Our search engine retrieved the following candidate verses:
"""
${promptCandidates}
"""

TASK:
1. Examine each verse carefully.
2. DISCARD any verse that is merely an incidental match, ritual formula, death/funeral rite (Shraddha), or irrelevant mythology that does NOT provide direct moral/spiritual guidance for the devotee's specific dilemma.
3. RETAIN and rank only the verses that directly illuminate the devotee's moral/emotional state with authentic spiritual truth.
4. Return a JSON object with:
   "selected_indices": Array of integer indices of the genuinely relevant verses in descending order of spiritual importance (e.g. [0, 2]).
   "critic_verdict": 1-2 sentences explaining why the selected verses were chosen and why discarded ones were dropped.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Evaluate the candidates and output strictly valid JSON.' }
  ];

  const raw = await callNvidiaChat(messages, {
    model: 'deepseek-ai/deepseek-v3',
    jsonMode: true,
    temperature: 0.1,
    timeoutMs: 6500
  });

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.selected_indices) && parsed.selected_indices.length > 0) {
        const verified = [];
        for (const idx of parsed.selected_indices) {
          if (idx >= 0 && idx < candidates.length) {
            verified.push(candidates[idx]);
          }
        }
        if (verified.length > 0) {
          console.log(`[+] NVIDIA Shloka Critic selected ${verified.length}/${candidates.length} verses:`, parsed.critic_verdict);
          return verified;
        }
      }
    } catch {}
  }

  return candidates;
}
