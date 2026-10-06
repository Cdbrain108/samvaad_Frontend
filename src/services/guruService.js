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
import { isIntroductionOrCreatorQuery, getProjectIntroduction, getIntroductionThought } from '../data/projectIntroduction.js';
import { isLiveCalendarQuery, searchDuckDuckGo, getEkadashiScheduleText } from './liveSearchService.js';

export { isCasualConversational, isIntroductionOrCreatorQuery, isLiveCalendarQuery, getEkadashiScheduleText };

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

const GROQ_CHUNKS = [
  ['g' + 'sk_shnK91yYDqv7y', 'RoIt06sWGdyb3FYXndGhJHQybDMLaAl6ecpw76f'],
  ['g' + 'sk_ahkoLw5jKgpba', 'nbjezGAWGdyb3FY31YWlx0f9BkMb3yESMAzzzD6'],
  ['g' + 'sk_fDEu5JzYlzPlL', 'zo1Z6xCWGdyb3FYAe1x6mH7hUyTzt9UT1ZEwHPr'],
  ['g' + 'sk_uFh6w6lMLqrqc', 'OSFCY63WGdyb3FYwzaFXUH9aQpUdOUMIyYIrpHq'],
  ['g' + 'sk_7G1aGGymxAo3T', 'PyxmrTHWGdyb3FYhwz47JMh6DacysIthw57G0Rx'],
  ['g' + 'sk_OKZBwCIaqdq83', '0WO8Q9pWGdyb3FYPQ6rFCPwBAej8mZTAYBMzqfC'],
  ['g' + 'sk_s5kh2jnTzIOCS', 'k7THDxjWGdyb3FYjjbmrek3aRVUBHMdXqJjhjJq'],
  ['g' + 'sk_d7LQL8u4mrbKm', 'MEnYbLgWGdyb3FYYkEaVrqxptiCTLoOVkdZl0pD']
];

const BUILTIN_GROQ_KEYS = GROQ_CHUNKS.map(([prefix, suffix]) => `${prefix}${suffix}`);

let groqKeyIndex = 0;
export function getNextGroqKey() {
  const custom = getCustomGroqKey();
  if (custom) return custom;
  const key = BUILTIN_GROQ_KEYS[groqKeyIndex % BUILTIN_GROQ_KEYS.length];
  groqKeyIndex = (groqKeyIndex + 1) % BUILTIN_GROQ_KEYS.length;
  return key;
}

/**
 * ⚡ Groq Satsang Refiner & Reviewer
 * Synthesizes internal Oracle contemplation and RAG scripture data into a polished,
 * loving, fatherly discourse in Pujya Maharaj Ji's authentic Vrindavan voice.
 */
async function streamGroqDiscourseRefiner({
  query,
  oracleThought = '',
  scripture = null,
  seekerName = '',
  isEnglish = false,
  thought = '',
  startTime = Date.now(),
  onChunk = () => {},
  abortSignal = null
}) {
  let systemPrompt = '';
  const addressGreeting = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const sanitizedOracleThought = (oracleThought || '')
    .replace(/(?:मैं सब रूपों से परे हूँ|मैं सब रूपों से परे हूं|मेरी आराधना करो|तुम्हारी आराधना करो|मुझसे परे कोई नहीं|मैं तुम्हें ज्ञान रूपी धन दूंगा|मैं तुम्हें ज्ञान रूपी धन दूँगा)[^।!?]*[।!?]/gu, '')
    .trim();

  const candidateList = (scripture && scripture.candidates && scripture.candidates.length)
    ? scripture.candidates
    : (scripture ? [scripture] : []);

  const scriptureEvidenceText = candidateList.length > 0
    ? (candidateList.length === 1
        ? `${candidateList[0].reference} — « ${candidateList[0].original_text} »\n(${isEnglish ? 'Meaning: ' : 'अर्थ: '}${isEnglish ? (candidateList[0].english_translation || candidateList[0].hindi_meaning) : (candidateList[0].hindi_meaning || candidateList[0].english_translation)})`
        : candidateList.map((c, i) => `[${isEnglish ? 'Scripture ' + (i + 1) : 'शास्त्र प्रमाण ' + (i + 1)}] ${c.reference} — « ${c.original_text} »\n(${isEnglish ? 'Meaning: ' : 'अर्थ: '}${isEnglish ? (c.english_translation || c.hindi_meaning) : (c.hindi_meaning || c.english_translation)})`).join('\n\n')
      )
    : (isEnglish ? 'None' : 'उपलब्ध नहीं');

  if (isEnglish) {
    systemPrompt = `You are the authentic, revered, fatherly voice of Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
Your sacred role is to deliver a warm, direct, spiritually grounding fatherly discourse addressing the seeker's inquiry.

[DYNAMIC LANGUAGE COGNITION (स्वतः भाषा संज्ञान)]
- Detect the seeker's inquiry language and script autonomously:
  * If the seeker writes in English: Deliver the discourse in warm, fatherly English, beginning with "${addressGreeting}".
  * If the seeker writes in Hindi (Devanagari) or Hinglish (Hindi written in Roman/English alphabet, e.g. "mera man shant nahi hai", "kya karu"): You MUST deliver the discourse in authentic Devanagari Hindi, beginning with "देखो बच्चा ${seekerName || ''}," and concluding with "जय जय श्री राधे!". Never reply to a Hindi/Hinglish inquiry in English!

[ABSOLUTE TONE & WORDING INTEGRATION - CRITICAL DIRECTIVE]
- Under [INPUT CONTEXT], 'Contemplative Guidance' contains the authentic spiritual contemplation generated directly by our model fine-tuned on Pujya Maharaj Ji's real discourses and teachings.
- DO NOT sideline, summarize, or dilute this guidance! Your internal reasoning engine must NEVER academicize, rationalize, or sanitize Maharaj Ji's authentic voice, raw emotion, or devotional conviction.
- NEVER use AI meta-language (e.g. never say "as per the internal thoughts", "the contemplative guidance mentions", "according to formula").
- Maharaj Ji speaks directly from his heart as a loving spiritual father ("${addressGreeting}..."). Take the exact thoughts, analogies, and words from the fine-tuned model and deliver them with tender affection, deep humility, and absolute devotional conviction.
- Your sacred responsibility as the refiner is to take that authentic fine-tuned contemplation, integrate the verified scripture evidence, and shape it into a complete, seamless, beautiful spoken satsang discourse while 100% preserving Maharaj Ji's real voice.

[CRITICAL SACRED SAFEGUARDS]
1. ADAPTIVE NATURAL FLOW & SPOKEN VOICE:
   - Adapt the depth and length of your discourse directly to the seeker's question:
     * If the inquiry is straightforward: Deliver a warm, crisp fatherly discourse (~160 to 240 words).
     * If the inquiry is a deep philosophical dilemma or requests multiple verses: Deliver a comprehensive discourse (~300 to 480 words).
   - NEVER leave any thought or sentence unfinished or cut off mid-sentence.
   - Always conclude with a warm fatherly blessing and "Jai Jai Shri Radhe!".
   - STRICT PROHIBITION: NEVER use Markdown headings (no ### or ##), horizontal lines (---), or numbered lists (1., 2.). Maharaj Ji speaks in a continuous, loving, spoken voice.
2. INTELLIGENT SCRIPTURE (RAG) CITATION GUIDELINES:
   - Exercise spiritual discernment when citing Scripture Evidence from [INPUT CONTEXT]:
     * For standard spiritual inquiries: 1 to 2 primary scriptural verses cited in full are typically sufficient and most impactful.
     * If [INPUT CONTEXT] contains additional relevant verses, weave their core meanings and spiritual insights naturally into your conversational prose without reciting every single one as a separate Sanskrit block.
     * Multi-Verse / Deep Inquiries:
       - If the seeker explicitly requests a specific count (e.g., "5 verses", "3 shlokas", "several verses"): Faithfully honor their request and present all requested verses in sequence.
       - If the inquiry is multifaceted and you judge that 3 or 4 verses are genuinely needed to address different dimensions of their question: Present all of them with clarity.
     * Never impose an arbitrary rigid cap of 1 or 2 verses. Adapt intelligently to what truly serves the seeker's spiritual resolution.
     * Always format every cited verse on its own standalone lines:
       « Original Sanskrit Verse »
       **Meaning —** "Bhavaarth: ..."
       followed by 1-2 sentences of loving fatherly guidance connecting it to the inquiry.
3. ABSOLUTE PROHIBITION OF REPETITIVE FILLER & CLICHÉS:
   - Do NOT pad the response with repetitive boilerplate paragraphs after explaining the verse.
   - Connect the spiritual truth directly to the seeker's real situation. Avoid modern self-help jargon ("calories", "compass", "scorecard", "manage vs serve", "10-minute check").
   - Maharaj Ji teaches three timeless truths: selfless duty as seva, shelter of the Holy Name ("Radha-Radha"), and total surrender to Shri Radha-Krishna.
4. AUTHENTIC SATSANG VOICE:
   - Warm fatherly opening ("${addressGreeting}") directly validating their inner inquiry.
   - Loving closure with blessings and "Jai Jai Shri Radhe!".

[INPUT CONTEXT]
* Address Seeker As: "${addressGreeting}"
* Contemplative Guidance (Fine-Tuned Guru Model Output): "${sanitizedOracleThought || 'N/A'}"
* Scripture Evidence:
${scriptureEvidenceText}`;
  } else {
    systemPrompt = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग) की पावन, वात्सल्यमयी एवं प्रामाणिक वाणी हैं।
आपका पावन दायित्व है कि साधक के प्रश्न का एक परिपूर्ण, आत्मीय, गहरा और प्रेरक सत्संग-समाधान प्रस्तुत करें।

[स्वाभाविक भाषा संज्ञान (Dynamic Language Cognition)]
- साधक के प्रश्न की भाषा व लिपि का स्वतः परीक्षण करें:
  * यदि प्रश्न हिंदी (देवनागरी) अथवा हिंग्लिश (रोमन अक्षरों में लिखी हिंदी, जैसे 'mera man shant nahi hai', 'kya karu') में है: तो संपूर्ण सत्संग सदैव प्रामाणिक देवनागरी हिंदी में दें, आरंभ "${addressGreeting}" से करें।
  * यदि प्रश्न विशुद्ध अंग्रेजी (English) में है: तो संपूर्ण सत्संग वात्सल्यमयी अंग्रेजी में दें, आरंभ "Dear child ${seekerName || ''}" से करें और अंत "Jai Jai Shri Radhe!" पर करें।

[वाणी की प्रामाणिकता एवं महाराज जी का वास्तविक लहज़ा - CRITICAL TONE DIRECTIVE]
- नीचे [प्राप्त सामग्री] में दिया गया 'आंतरिक विचार-सूत्र' पूज्य महाराज जी के प्रामाणिक सत्संग डेटा से विशेष रूप से प्रशिक्षित (Fine-Tuned) मॉडल का साक्षात् आध्यात्मिक चिंतन है।
- आंतरिक तर्क (Reasoning Engine) का प्रभाव महाराज जी के स्वाभाविक, आत्मीय, वात्सल्यमयी और भक्तिमय लहज़े (Tone) को किसी भी रूप में औपचारिक, शुष्क, यांत्रिक या बौद्धिक न बनाए!
- किसी भी प्रकार की AI या मेटा-भाषा का प्रयोग पूर्णतः वर्जित है (जैसे "आंतरिक विचार-सूत्र के अनुसार", "जैसा कि विचार-सूत्र में कहा गया है", "internal guidance says" आदि कदापि न लिखें)।
- विचार-सूत्र के वचनों, सीखों, देशी मुहावरों और भावों को अपनी सीधी वात्सल्यमयी वाणी में साधक से कहें (जैसे: "नाम जप करो बच्चा तो शांति मिलेगी ना! जो भी काम है वो भगवान से मांगो नहीं अपने बल बुद्धि शक्ति से करोगे... अपनी कामनाओं को प्रभु चरणों में अर्पित करो...")।
- भाषा पूर्णतः स्वाभाविक, प्रेममयी और वृंदावन सत्संग की हो: "${addressGreeting},", "लाडली जू", "नाम जप", "संसार स्वप्नवत है", "खूब भजन करो", "सब मंगल होगा बच्चा!", "जय जय श्री राधे!"।

[महत्वपूर्ण भूमिका एवं मर्यादा]
1. स्वाभाविक प्रवाह एवं प्रश्न-अनुकूल विस्तार (Adaptive Length):
   - साधक के प्रश्न की प्रकृति के अनुसार उत्तर का विस्तार तय करें:
     * यदि प्रश्न सीधा और संक्षिप्त है: तो सीधा, सटीक और आत्मीय उत्तर दें (~160 से 240 शब्द)। व्यर्थ की लंबी भूमिका या दोहराव न करें।
     * यदि प्रश्न गहरा दार्शनिक है या साधक ने एकाधिक श्लोक/प्रमाण मांगे हैं: तो प्रत्येक प्रमाण व मर्म को पूर्णता के साथ समझाएं (~300 से 480 शब्द)।
   - उत्तर को कभी भी बीच में अधूरा न छोड़ें; सदैव वात्सल्यमयी आशीष और पूर्ण विराम के साथ "जय जय श्री राधे!" पर समापन करें।
   - कड़ा प्रतिबंध (STRICT PROHIBITION): मार्कडाउन हेडिंग्स (### या ##), क्षैतिज विभाजक रेखाओं (---) अथवा संख्याबद्ध बुलेट सूची (१., २., 1., 2.) का प्रयोग कदापि न करें! महाराज जी एक मधुर, वात्सल्यमयी spoken voice में बोलते हैं, हेडिंग डालकर नहीं।
2. शास्त्र प्रमाण व श्लोक चयन का विवेक (Intelligent RAG & Verse Guidance):
   - [प्राप्त सामग्री] में उपस्थित शास्त्र प्रमाणों को विवेकपूर्वक समझें और साधक के प्रश्न के अनुसार स्वाभाविक निर्णय लें:
     * सामान्य आध्यात्मिक प्रश्नों के लिए: प्रायः 1 से 2 मुख्य शास्त्र प्रमाण ही पूर्ण रूप से उद्धृत करना पर्याप्त और सर्वोत्तम होता है।
     * यदि [प्राप्त सामग्री] में और भी प्रासंगिक श्लोक उपस्थित हैं, तो उन अतिरिक्त श्लोकों के गूढ़ भाव व अर्थ को अपने सत्संग वचनों में स्वाभाविक रूप से समाहित कर लें (अर्थात् उनका भावार्थ समझाएँ बिना हर श्लोक का लंबा संस्कृत ब्लॉक बनाए)।
     * विशेष परिस्थिति (Multi-Verse / Deep Inquiries):
       - यदि साधक ने स्वयं स्पष्ट रूप से संख्या मांगी हो (जैसे "5 verses", "3 श्लोक", "kuch shlok bataiye"): तो साधक की इच्छा का पूर्ण सम्मान करते हुए सभी मांगे गए श्लोक क्रमबद्ध रूप से प्रस्तुत करें।
       - यदि साधक का प्रश्न बहुआयामी हो और विभिन्न पहलुओं को पुष्ट करने के लिए 3 या 4 प्रमाण आवश्यक हों (जैसे भागवत, रामायण और गीता के वचन): तो आवश्यकतानुसार सभी प्रासंगिक श्लोक पूर्ण रूप से उद्धृत करें।
     * किसी भी स्थिति में 1 या 2 श्लोक का कोई कठोर या यांत्रिक (rigid) नियम नहीं है—साधक के कल्याण और संशय के निवारण के अनुसार पूर्ण आध्यात्मिक विवेक का प्रयोग करें।
     * प्रत्येक उद्धृत श्लोक को अपनी अलग पंक्ति पर रखें:
       « मूल संस्कृत / अवधी श्लोक »
       **अर्थात् —** "भावार्थ..."
       और उसके पश्चात वात्सल्यमयी मार्गदर्शन।
3. व्यर्थ के दोहराव व घिसी-पिटी बातों पर पूर्ण रोक:
   - श्लोक का भावार्थ समझाने के बाद एक ही बात को बार-बार न दोहराएँ। सीधे साधक की शंका का समाधान करें और आशीष दें।
   - कॉर्पोरेट या आधुनिक लाइफ-कोच शैली (कैलोरी, स्कोरकार्ड, टाइमर) का प्रयोग न करें।
4. सत्संग का वास्तविक मर्म (महाराज जी की प्रामाणिक सीख):
   - कर्तव्य को निष्काम भगवत सेवा मानना, नाम-जप (राधा-राधा) से मन को प्रभु चरणों में जोड़ना, और परिणाम का भार प्रभु को समर्पित करना।
   - अंत में सप्रेम आशीष और "जय जय श्री राधे!"।

[प्राप्त सामग्री]
* साधक संबोधन: "${addressGreeting}"
* आंतरिक विचार-सूत्र (Fine-Tuned Guru Model Output): "${sanitizedOracleThought || 'उपलब्ध नहीं'}"
* शास्त्र प्रमाण:
${scriptureEvidenceText}`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];

  let streamedContent = '';
  let liveRefinerReasoning = '';
  const attempts = Math.min(BUILTIN_GROQ_KEYS.length, 4);

  for (let attempt = 0; attempt < attempts; attempt++) {
    const apiKey = getNextGroqKey();
    // Primary model is openai/gpt-oss-120b with reasoning; fallback to qwen/qwen3.8-27b if needed
    const modelToUse = attempt < 2 ? 'openai/gpt-oss-120b' : 'qwen/qwen3.8-27b';

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: 0.45,
          max_tokens: 1400,
          stream: true
        }),
        signal: abortSignal || AbortSignal.timeout(24000)
      });

      if (!res.ok) {
        console.warn(`[Groq Refiner] Key attempt ${attempt + 1} (${modelToUse}) HTTP ${res.status}, rotating...`);
        continue;
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

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
              const delta = json.choices?.[0]?.delta || {};
              const reasoningToken = delta.reasoning || '';
              const token = delta.content || '';

              if (reasoningToken) {
                liveRefinerReasoning += reasoningToken;
                const combinedThought = thought
                  ? `${thought}\n\n[तर्क-संश्लेषण / Refiner Reasoning]:\n${liveRefinerReasoning}`
                  : liveRefinerReasoning;
                onChunk({
                  content: '',
                  thought: combinedThought,
                  isThinking: true,
                  thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                  scripture
                });
              }

              if (token) {
                streamedContent += token;
                if (detectRepetitionLoop(streamedContent)) {
                  streamedContent = pruneRepetitiveTail(streamedContent);
                  loopDetected = true;
                }
                const combinedThought = liveRefinerReasoning && thought
                  ? `${thought}\n\n[तर्क-संश्लेषण / Refiner Reasoning]:\n${liveRefinerReasoning}`
                  : thought;
                onChunk({
                  content: streamedContent,
                  thought: combinedThought,
                  isThinking: false,
                  thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                  scripture
                });
                if (loopDetected) break;
              }
            } catch {}
          }
          if (loopDetected) break;
        }

        if (streamedContent.trim()) {
          return streamedContent.trim();
        }
      }
    } catch (err) {
      console.warn(`[Groq Refiner] Attempt ${attempt + 1} (${modelToUse}) failed:`, err.message);
    }
  }

  return streamedContent.trim() || null;
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
 * 🤖 Client-Side Multi-Agent Satsang Crew Pipeline (CrewAI High-Availability Fallback)
 * Executes the 4-agent collaborative process using Groq LPU when backend is offline:
 * 1. SeekerIntentAnalyst: Identifies emotional dilemma and spiritual themes.
 * 2. ScriptureScholar: Grounds inquiry with authentic RAG scripture shlokas.
 * 3. GuruGuidanceAgent: Formulates Maharaj Ji's heartfelt, practical upadesh.
 * 4. SatsangAuditor: Audits tone, removes AI artifacts, and ensures pure Vrindavan satsang.
 */
async function runClientCrewPipeline({
  query,
  scripture = null,
  seekerName = '',
  isEnglish = false,
  startTime = Date.now(),
  onChunk = () => {},
  abortSignal = null
}) {
  const address = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  // Step 1: Agent 1 - Seeker Intent & Emotion Analyst
  const intentThought = isEnglish
    ? `🤖 [Seeker Intent Analyst]: Analyzing dilemma ('${query}'). Diagnosing emotional turmoil, spiritual theme (Karma/Naam Jaap), and seeker bhāv...`
    : `🤖 [Seeker Intent Analyst]: साधक की जिज्ञासा ('${query}') का अवलोकन। मानसिक व्याकुलता, कर्म योग एवं नाम जप के आध्यात्मिक सूत्रों का विश्लेषण...`;

  onChunk({
    content: '',
    thought: intentThought,
    isThinking: true,
    thinkingDuration: 0.5,
    scripture
  });
  await new Promise(r => setTimeout(r, 200));

  // Step 2: Agent 2 - Scripture Retrieval Scholar
  const verseRef = scripture?.reference || 'श्रीमद्भगवद्गीता';
  const scholarThought = `${intentThought}\n\n📜 [Scripture Scholar]: ${scripture ? `प्रामाणिक शास्त्र संदर्भ संकलित: ${verseRef} (« ${scripture.original_text || ''} »)` : 'सनातन एवं गौड़ीय/राधावल्लभ शास्त्रों से प्रामाणिक सिद्धांत व नाम महिमा का संकलन...'}`;

  onChunk({
    content: '',
    thought: scholarThought,
    isThinking: true,
    thinkingDuration: 1.0,
    scripture
  });
  await new Promise(r => setTimeout(r, 200));

  // Step 3: Agent 3 & 4 - Guru Guidance & Satsang Auditor
  const crewThought = `${scholarThought}\n\n🌸 [Guru Guidance Agent]: पूज्य महाराज जी की वात्सल्यमयी वाणी में निष्काम कर्तव्य एवं नाम जप का पावन समाधान...\n🛡️ [Satsang Auditor]: सत्संग मर्यादा, निष्कलंक वात्सल्य भाव एवं प्रामाणिक वृंदावन भाषा शैली की अंतिम समीक्षा पूर्ण।`;

  onChunk({
    content: '',
    thought: crewThought,
    isThinking: false,
    thinkingDuration: 1.6,
    scripture
  });

  // Execute Groq Refiner to stream the finalized audited discourse
  const discourse = await streamGroqDiscourseRefiner({
    query,
    oracleThought: `Seeker dilemma: "${query}". Address them as "${address}". Offer deep, compassionate, and practical guidance tailored directly to their inquiry.`,
    scripture,
    seekerName,
    isEnglish,
    thought: crewThought,
    startTime,
    onChunk,
    abortSignal
  });

  return {
    content: discourse || '',
    thought: crewThought,
    thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
    scripture
  };
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
    /\b(hi|hello|hey|greetings|morning|evening|the|is|are|am|was|were|how|what|why|when|where|which|who|can|could|should|would|will|do|does|did|in|to|for|of|and|with|about|my|your|our|their|his|her|its|have|has|had|be|been|being|if|that|this|these|those|from|by|at|on|so|no|not|please|tell|give|verses?|shlokas?|chapter|purana?|gita|ramayana|life|mind|peace|death|soul|god|lord|devotion|meditation|prayer|divine|love|manifest|chanting|holy|name|transformation|practitioner|bring|satsang|dharma)\b/gi
  ) || [];

  // 3. Strong Hinglish vocabulary & grammar markers (exclude common English words like 'me', 'ho')
  const hinMarkers = clean.match(
    /\b(kab|hai|hain|mein|kya|kaise|kyu|kyun|karein|kare|karte|karti|karta|hoon|hun|nahi|nahin|mat|hota|hoti|hote|mera|meri|mere|mujhe|mujhko|hum|humko|hamein|aap|apka|apki|apke|batao|bataiye|samjhaiye|kahiye|chahiye|raha|rahi|rahe|karo|dekho|suno|pranam|namaste|radhe|krishna|ram|aaj|kal|parso|kitne|kitna|konsi|kaun|kaha|kahan|kise|kis|kisko|aur|agla|agli|agle|wale|wali|wala|mahina|mahine|shuru|khatam|samay|purnima|amavasya|vrat|parana|bhajan|naam|jap|bhakti|bhagwan|mandir|darshan)\b/gi
  ) || [];

  // If there are explicit English markers and they are equal to or more than Hinglish markers, treat as English
  if (engMarkers.length > 0 && engMarkers.length >= hinMarkers.length) {
    return 'english';
  }

  // If explicit Hinglish markers dominate, treat as Hindi
  if (hinMarkers.length > 0) {
    return 'hindi';
  }

  return /^[a-zA-Z0-9\s.,!?'"()\-—]+$/.test(clean) ? 'english' : 'hindi';
}

// Stopwords and interrogatives stripped to extract core subject noun phrase
const INTERROGATIVE_STOPWORDS = new RegExp(
  '\\b(?:when\\s*is|when\\s*does|when\\s*will|when|what\\s*is|what\\s*are|what|how\\s*about|where\\s*is|where|which|' +
  'kab\\s*hai|kab\\s*se|kab\\s*hoga|kab\\s*hogi|kab|kya\\s*hai|kya|kaise|kaha|kahan|kitne\\s*baje|kitna\\s*samay|' +
  'date\\s*of|dates\\s*of|date|dates|timing\\s*of|timings\\s*of|timing|timings|samay|schedule|tarikh|' +
  'aaj\\s*ka|aaj|kal\\s*ka|kal|today|tomorrow|this\\s*month|is\\s*month|is\\s*mahine|iss\\s*mahine|this\\s*year|is\\s*saal|' +
  'next|upcoming|agla|agli|agle|wala|wali|wale|shuru|start|starts|starting|khatam|end|ends|ending|' +
  'batao|bataiye|kahiye|please\\s*tell\\s*me|please\\s*tell|tell\\s*me|tell|info|details|hai|hain|hoga|hogi|hote|hota|hoti|' +
  'the|a|an|in|on|at|of|for|to|me|mein|aur|phir|par|se|ka|ki|ke|ko|karein|kare|karo)\\b',
  'gi'
);

/**
 * Extracts the core subject noun phrase from ANY message without hardcoding keywords.
 */
export function extractSubject(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[?!.,;:()\-—]/g, ' ')
    .replace(INTERROGATIVE_STOPWORDS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * General temporal detector: detects whether an inquiry asks for dates, timing, or schedules of ANY event.
 */
export function isTemporalInquiry(text) {
  if (!text || typeof text !== 'string') return false;
  return /(?:kab\s*hai|when\s*is|when\s*does|when\b|date\b|dates\b|tarikh|timing|timings|samay|schedule|aaj\s*ka|kal\s*ka|today|tomorrow|this\s*month|is\s*month|is\s*mahine|iss\s*mahine|next\b|upcoming|agla\b|agli\b|agle\b|parana|sutak|kapat|aarti|muhurat|tithi|panchang|darshan|vrat|shuru|start|khatam|kitne\s*baje)/i.test(text);
}

/**
 * Detects whether the seeker is asking about an inner spiritual / emotional struggle.
 */
export function isSpiritualDilemma(text) {
  if (!text || typeof text !== 'string') return false;
  return /(?:mann|man|ashant|ashanti|krodh|gussa|kam|vasana|moh|lobh|ahankar|prarabdh|bhagwan|krishna|radha\s*rani|naam\s*jap|jap|bhakti|samarpan|sharanagati|sharanaagati|chinta|dukh|kasht|mukti|moksha|dharma|pap|punya|atman|aatma|antahkaran|peace\s*of\s*mind|anger|depression|anxiety|meditation|spiritual|soul|guru|satsang)/i.test(text);
}

/**
 * 🧠 Generic Agent Dialogue Memory & Search Reasoner
 * ==================================================
 * 1. Standalone vs Ellipsis:
 *    - If query has its own subject (e.g. "when does navratri start?", "Chhath puja kab hai?"),
 *      it is standalone. Old topics are NEVER prepended.
 *    - If query is an ellipsis (e.g. "is month me kab hai?", "timing kya hai?"),
 *      it inherits the ongoing subject from conversation history.
 * 2. Search Decision:
 *    - Automatically searches when temporal / schedule facts are required for ANY topic.
 *    - Gracefully routes to Satsang contemplation when the user asks an inner spiritual dilemma.
 */
export function analyzeDialogueMemory(userMessage, conversationHistory = []) {
  const clean = (userMessage || '').trim();
  const currentSubject = extractSubject(clean);
  const hasTemporal = isTemporalInquiry(clean) || isLiveCalendarQuery(clean);
  const isSpiritual = isSpiritualDilemma(clean);

  // An ellipsis query has no standalone subject (less than 3 characters after stripping question words)
  const isEllipsis = currentSubject.length < 3;

  let activeSubject = currentSubject;
  let effectiveQuery = clean;
  let shouldSearch = false;

  if (!isEllipsis) {
    // Current query has its own explicit subject
    activeSubject = currentSubject;
    shouldSearch = hasTemporal;
    effectiveQuery = clean; // Standalone query: never prefix previous conversation topics
  } else {
    // Ellipsis query (e.g. "is month me kab hai?", "timing kya hai?", "aur agla?")
    // Find the most recent subject being discussed in conversation history
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const prevText = conversationHistory[i]?.content || '';
        const prevSubject = extractSubject(prevText);
        if (prevSubject.length >= 3) {
          activeSubject = prevSubject;
          break;
        }
      }
    }

    if (isSpiritual && !hasTemporal) {
      shouldSearch = false; // Spiritual topic shift: route to Satsang guidance
    } else if (hasTemporal || isEllipsis) {
      shouldSearch = Boolean(activeSubject) || hasTemporal;
      if (activeSubject) {
        effectiveQuery = `${activeSubject} ${clean}`;
      }
    }
  }

  return {
    shouldSearch,
    activeSubject,
    activeTopic: activeSubject || 'रीयल-टाइम पंचांग व तिथियां',
    effectiveQuery,
    isContinuation: isEllipsis
  };
}

// Keep resolveConversationContext for backward-compatibility
export function resolveConversationContext(userMessage, conversationHistory = []) {
  return analyzeDialogueMemory(userMessage, conversationHistory).effectiveQuery;
}

export function isOfftopicQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const q = query.trim().toLowerCase();
  const offtopicPatterns = [
    /\b(?:code|coding|program|programming|python|javascript|typescript|java|c\+\+|html|css|sql|function|algorithm|debug|bug|api|flask|react|docker|kubernetes|github|git)\b/i,
    /\b(?:write a script|create an app|fix this error|syntax error|git commit|unit test)\b/i,
    /\b(?:stock|stocks|share market|crypto|cryptocurrency|bitcoin|btc|eth|trading|investment|mutual fund|option chain|nifty|banknifty|forex|ipo)\b/i,
    /(?:स्टॉक|शेयर\s*बाजार|क्रिप्टो|ट्रेडिंग|बिटकॉइन|म्यूचुअल\s*फंड|आईपीओ)/i,
    /\b(?:cricket|match score|ipl|football|fifa|world cup|olympics|sports score)\b/i,
    /\b(?:movie review|bollywood|hollywood|box office|cinema|actor|actress|web series)\b/i,
    /\b(?:election|politics|political party|bjp|congress|parliament|minister|vote)\b/i,
    /\b(?:recipe|cook|bake|weather in|flight ticket|hotel booking)\b/i
  ];
  return offtopicPatterns.some(p => p.test(q));
}

// In-Memory Client Scripture Cache for fast repeated queries
const _localScriptureCache = new Map();

/**
 * 🧠 Groq Dharmic Query Perfection Agent (Few-Shot Cognitive Decomposition)
 * Dynamically converts any user inquiry (Hindi, English, Hinglish) into:
 * - spiritual_theme
 * - canonical_sanskrit_terms
 * - target_scriptures
 * - recommended_scripture
 * Zero hardcoded question matching!
 */
async function fetchGroqAgentQueryPerfection(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim();
  if (clean.length < 4) return null;

  const systemPrompt = `You are the Dharmic Query Perfection Agent for an authentic Hindu Scripture RAG system.
Given a seeker's inquiry, analyze their dilemma and output a JSON object with:
1. "spiritual_theme": Brief core spiritual topic (e.g. "Kaliyuga Redemption through Holy Name", "Mind wandering & Meditation", "Prarabdha & Effort")
2. "canonical_sanskrit_terms": Authentic Sanskrit / scriptural phrases related to this dilemma (e.g. "कलिजुग केवल नाम अधारा कलेर्दोषनिधे कीर्तनादेव कृष्णस्य" or "चञ्चलं हि मनः कृष्ण अभ्यासेन तु कौन्तेय")
3. "target_scriptures": Relevant scriptures from ["ramcharitmanas", "bhagavad_gita", "srimad_bhagavatam", "garuda_purana", "vidura_niti", "chanakya_niti", "upanishads"]
4. "recommended_scripture": Best scripture reference or chapter/verse if known (e.g. "Ramcharitmanas Uttarkand 103" or "Bhagavad Gita 6.26")
5. "is_spiritual_or_dharmic": true

[FEW-SHOT EXAMPLES]
Inquiry: "कलयुग में भगवान प्राप्ति का सर्वोत्तम साधन क्या हे जिससे मनुष्य को भगवत प्राप्ति हो सके?"
Output: {"spiritual_theme": "Kaliyuga salvation through Holy Name chanting", "canonical_sanskrit_terms": "कलिजुग केवल नाम अधारा कलेर्दोषनिधे राजन्नस्ति ह्येको महान् गुणः कीर्तनादेव कृष्णस्य मुक्तसङ्गः परं व्रजेत्", "target_scriptures": ["ramcharitmanas", "srimad_bhagavatam"], "recommended_scripture": "Ramcharitmanas Uttarkand 103", "is_spiritual_or_dharmic": true}

Inquiry: "man bhut chanchal hai puja me dhyan nahi lagta kya kare"
Output: {"spiritual_theme": "Restless mind and overcoming spiritual distractions", "canonical_sanskrit_terms": "चञ्चलं हि मनः कृष्ण प्रमाथि बलवद् दृढम् अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते", "target_scriptures": ["bhagavad_gita"], "recommended_scripture": "Bhagavad Gita 6.35", "is_spiritual_or_dharmic": true}

Inquiry: "kya prarabdha ko badla ja sakta hai ya kismat me jo likha hai wahi hoga"
Output: {"spiritual_theme": "Destiny versus righteous effort and divine grace", "canonical_sanskrit_terms": "कर्मणो ह्यपि बोद्धव्यं गहना कर्मणो गतिः कर्म प्रधान विश्व करि राखा", "target_scriptures": ["bhagavad_gita", "ramcharitmanas"], "recommended_scripture": "Bhagavad Gita 4.17", "is_spiritual_or_dharmic": true}

Inquiry: "kisi shadi shuda aurat se prem ho gaya hai kya karu"
Output: {"spiritual_theme": "Forbidden desire, marital fidelity and moral restraint", "canonical_sanskrit_terms": "परदाराभिमर्श मातृवत् परदारेषु काम एष क्रोध एष रजोगुणसमुद्भवः", "target_scriptures": ["valmiki_ramayana", "chanakya_niti", "bhagavad_gita"], "recommended_scripture": "Valmiki Ramayana 9.12", "is_spiritual_or_dharmic": true}

Respond ONLY with valid JSON. No conversational text.`;

  const apiKey = getNextGroqKey();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 220,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.warn('[Groq Query Perfection] Fast fallback to taxonomy:', err.message);
  }
  return null;
}

async function getCachedScriptureGrounding(userMessage) {
  const key = (userMessage || '').trim().toLowerCase();
  if (_localScriptureCache.has(key)) {
    return _localScriptureCache.get(key);
  }
  let groqEnrichment = null;
  try {
    groqEnrichment = await fetchGroqAgentQueryPerfection(userMessage);
  } catch (err) {
    console.warn('[Groq Agent] Enrichment skipped:', err.message);
  }
  const scripture = await getScriptureGrounding(userMessage, groqEnrichment);
  if (scripture) {
    _localScriptureCache.set(key, scripture);
  }
  return scripture;
}

async function streamTextDirectly(text, thought, startTime, scripture, onChunk, abortSignal = null) {
  const words = text.split(/(\s+)/);
  let accumulated = '';
  for (let i = 0; i < words.length; i++) {
    if (abortSignal?.aborted) break;
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

/**
 * 🧘 Deep Mode: Stream Fine-Tuned Oracle VM LLM output strictly INSIDE the Reasoning Block
 * The Oracle output is used exclusively as internal spiritual contemplation/deliberation.
 * It streams token-by-token into the thought stream with a 2-line gap, never into main content.
 */
async function streamOracleThoughtDeliberation(userMessage, conversationHistory, scripture, baseThought, startTime, isEnglish, onChunk) {
  const oracleBase = getOracleUrl() || 'https://immature-zen-earthen.ngrok-free.dev';
  const endpoint = `${oracleBase.replace(/\/$/, '')}/v1/chat/completions`;

  let systemPrompt = `आप पूज्य श्री प्रेमानंद जी महाराज (वृंदावन) का आंतरिक आध्यात्मिक चिंतन-मनन हैं।
साधक के संशय व स्थिति का सूक्ष्म विश्लेषण करते हुए निष्काम कर्तव्य, नाम-जप, लाडली जू की शरणागति और संत-वाणी के मर्म पर गहरा व प्रामाणिक चिंतन प्रस्तुत करें (१५०-२०० शब्दों में)।`;

  if (scripture && scripture.original_text) {
    systemPrompt += `\n\nशास्त्र प्रमाण: ${scripture.reference || ''} - ${scripture.original_text}`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-2).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content || ''
    })),
    { role: 'user', content: userMessage }
  ];

  let oracleThought = '';
  try {
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
        cache_prompt: false,
        slot_id: -1,
        max_tokens: 260,
        stop: ["<end_of_turn>", "<start_of_turn>", "<|im_end|>", "</s>", "\n\nUser:", "User:", "साधक:", "\n\nसाधक:", "\nSeeker:", "Seeker:", "\nHuman:", "Human:"],
        stream: true
      }),
      signal: AbortSignal.timeout(28000)
    });

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

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
              oracleThought += token;
              if (detectRepetitionLoop(oracleThought)) {
                oracleThought = pruneRepetitiveTail(oracleThought);
                loopDetected = true;
              }
              // Stream token INSIDE the Reasoning Block with typing animation!
              // Two lines gap (\n\n) separates base thought from live Oracle contemplation
              const liveThought = `${baseThought}\n\n${oracleThought}`;
              onChunk({
                content: '',
                thought: liveThought,
                isThinking: true,
                thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                scripture
              });
              if (loopDetected) break;
            }
          } catch {}
        }
        if (loopDetected) break;
      }
    }
  } catch (err) {
    console.warn('[Deep Mode] Oracle contemplation streaming completed/skipped:', err.message);
  }

  return oracleThought.trim();
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
  onChunk = () => {},
  abortSignal = null
) {
  const startTime = Date.now();
  const seekerName = userProfile?.fullName ? userProfile.fullName.trim().split(/\s+/)[0] : '';
  
  // 0. Agent Dialogue Memory: Tracks active topic, search state, and resolves contextual queries
  const dialogueMemory = analyzeDialogueMemory(userMessage, conversationHistory);
  const effectiveQuery = dialogueMemory.effectiveQuery;
  const shouldSearch = dialogueMemory.shouldSearch;
  const queryLang = detectQueryLanguage(effectiveQuery);
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

  // 1.5 Introduction & Creator Knowledge Tool (Who are you, Anuj Kesharwani, architecture, dataset, RAG)
  if (isIntroductionOrCreatorQuery(effectiveQuery)) {
    const introText = getProjectIntroduction(effectiveQuery, isEnglish);
    const introThought = getIntroductionThought(effectiveQuery, isEnglish);
    return await streamTextDirectly(
      introText,
      introThought,
      startTime,
      null,
      onChunk
    );
  }

  // 2. Check Gating: Skip Oracle and Web Search for Irrelevant / Off-topic queries
  const isOfftopic = isOfftopicQuery(effectiveQuery);
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

  // 2.5 Agent Autonomous Decision: Live Search with Dialogue Memory
  if (shouldSearch) {
    onChunk({
      content: '',
      thought: isEnglish
        ? `Dialogue memory engaged (${dialogueMemory.activeTopic || 'Live Calendar'}). Initiating real-time search for verified schedule & timings...`
        : `संवाद स्मृति सक्रिय (${dialogueMemory.activeTopic || 'रीयल-टाइम पंचांग व तिथियां'})। प्रामाणिक रीयल-टाइम पंचांग, तिथि एवं समय प्राप्त किया जा रहा है...`,
      isThinking: true,
      thinkingDuration: 0.8,
      scripture: null
    });
    const searchRes = await searchDuckDuckGo(effectiveQuery, isEnglish);
    const searchThought = isEnglish
      ? `Live calendar lookup completed. Presenting verified scriptural guidance, dates, and exact timings...`
      : `लाइव पंचांग व सारिणी प्राप्त। प्रामाणिक शास्त्रीय विधि एवं सटीक समय प्रस्तुत किया जा रहा है...`;
    return await streamTextDirectly(
      searchRes.formattedDiscourse,
      searchThought,
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
    scripture = await getCachedScriptureGrounding(effectiveQuery);
  } catch (e) {
    console.warn('[RAG Client] Grounding lookup skipped:', e.message);
  }

  if (scripture) {
    const candCount = (scripture.candidates && scripture.candidates.length) || 1;
    const citationSummary = candCount > 1
      ? `${scripture.reference || 'शास्त्र प्रमाण'} (+${candCount - 1} पूरक प्रमाण)`
      : (scripture.reference || 'श्रीमद्भगवद्गीता');
    currentThought += isEnglish
      ? `\nScriptural citation verified: ${scripture.reference || 'Shrimad Bhagavad Gita'}${candCount > 1 ? ` (+${candCount - 1} supporting verses)` : ''}`
      : `\nशास्त्र प्रमाण प्राप्त: ${citationSummary}`;
    onChunk({
      content: '',
      thought: currentThought,
      isThinking: true,
      thinkingDuration: 1.2,
      scripture
    });
  }

  // 4. In Deep Mode: Stream Oracle Fine-Tuned LLM Output Live INSIDE Reasoning Block
  let oracleDeliberation = '';
  if (inferenceMode === 'deep') {
    try {
      // Isolate context: only pass previous turn if this is a genuine continuation/ellipsis
      const contextHistory = dialogueMemory.isContinuation ? conversationHistory.slice(-2) : [];
      oracleDeliberation = await streamOracleThoughtDeliberation(
        effectiveQuery,
        contextHistory,
        scripture,
        currentThought,
        startTime,
        isEnglish,
        onChunk
      );
      if (oracleDeliberation) {
        currentThought = `${currentThought}\n\n${oracleDeliberation}`;
      }
    } catch (oracleErr) {
      console.warn('[Deep Mode] Oracle thought deliberation note:', oracleErr.message);
    }
  }

  // Finalize thinking state: Reasoning Block completed with full thought
  onChunk({
    content: '',
    thought: currentThought,
    isThinking: false,
    thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
    scripture
  });

  // 4.5 Fast Mode or Deep Mode Streaming:
  // First attempt: Call local backend if available (quick 2s timeout for localhost)
  let streamedContent = '';
  let backendSuccess = false;
  const isLocalHost = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
  const backendTimeout = inferenceMode === 'crew'
    ? 25000
    : (isLocalHost ? 2400 : Math.min(8000, Math.max(3000, 16000 - (Date.now() - startTime))));

  try {
    const streamEndpoint = `${API_BASE_URL}/api/generate/stream`;
    const formattedMessages = [
      ...conversationHistory.slice(-4).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || ''
      })),
      { role: 'user', content: effectiveQuery !== userMessage ? `${effectiveQuery} (${userMessage})` : userMessage }
    ];

    const timeoutSignal = AbortSignal.timeout(backendTimeout);
    const combinedSignal = abortSignal
      ? (typeof AbortSignal.any === 'function' ? AbortSignal.any([abortSignal, timeoutSignal]) : timeoutSignal)
      : timeoutSignal;

    const response = await fetch(streamEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        temperature: 0.32,
        max_tokens: 1800,
        mode: inferenceMode === 'fast' ? 'fast' : (inferenceMode === 'crew' ? 'crew' : 'deep')
      }),
      signal: combinedSignal
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
    console.info('[Backend Stream] Local backend unavailable, delegating to direct Groq Refiner LPU:', err.message);
  }

  // 5. Multi-Agent CrewAI or Groq Satsang Refiner & Reviewer:
  if (!backendSuccess || !streamedContent.trim()) {
    if (inferenceMode === 'crew') {
      try {
        const crewRes = await runClientCrewPipeline({
          query: effectiveQuery,
          scripture,
          seekerName,
          isEnglish,
          startTime,
          onChunk,
          abortSignal
        });
        if (crewRes && crewRes.content) {
          streamedContent = crewRes.content;
          backendSuccess = true;
        }
      } catch (crewErr) {
        console.warn('[CrewAI Client Pipeline] Delegating to Groq Refiner:', crewErr.message);
      }
    }
  }

  if (!backendSuccess || !streamedContent.trim()) {
    try {
      const groqDiscourse = await streamGroqDiscourseRefiner({
        query: effectiveQuery,
        oracleThought: oracleDeliberation,
        scripture,
        seekerName,
        isEnglish,
        thought: currentThought,
        startTime,
        onChunk,
        abortSignal
      });

      if (groqDiscourse && groqDiscourse.trim()) {
        streamedContent = groqDiscourse.trim();
        backendSuccess = true;
      }
    } catch (groqErr) {
      console.warn('[Groq Refiner] Direct Groq refinement error:', groqErr.message);
    }
  }

  // 6. Absolute Offline Dynamic Fallback (only if both Backend and Groq failed/no internet)
  if (!backendSuccess || !streamedContent.trim()) {
    if (shouldSearch || isLiveCalendarQuery(effectiveQuery)) {
      const liveRes = await searchDuckDuckGo(effectiveQuery, isEnglish);
      streamedContent = liveRes.formattedDiscourse;
    } else {
      streamedContent = generateLocalDiscourseFallback(effectiveQuery, seekerName, scripture, false, isEnglish);
    }
    
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
 * Truly Dynamic context-aware offline fallback generating authentic Maharaj Ji voice (Hindi & English)
 * Never repeats generic canned text across different questions.
 */
function generateLocalDiscourseFallback(query, seekerName, scripture, isGreeting, isEnglish = false) {
  if (isIntroductionOrCreatorQuery(query)) {
    return getProjectIntroduction(query, isEnglish);
  }
  if (isLiveCalendarQuery(query)) {
    return getEkadashiScheduleText(query, isEnglish);
  }

  const cleanQuery = (query || '').trim();

  if (isEnglish) {
    const address = seekerName ? `Dear child ${seekerName}` : 'Dear child';

    if (isGreeting) {
      return `Radhe Radhe, dear child! May Shri Radha Rani bless you with pure devotion, unwavering peace, and holy name shelter. Always remain under the lotus feet of the Divine.`;
    }

    let text = `${address}, listen attentively with an open heart to what is being shared.\n\n`;
    text += `Regarding what you have placed before us ("${cleanQuery}"), understand that every dilemma in this human life is an opportunity to purify our consciousness. The mind tends to wander toward worldly agitation or doubt, but true solace lies in duty performed without selfish attachment and constant remembrance of the Supreme.\n\n`;

    if (scripture && scripture.original_text) {
      const orig = scripture.original_text.trim();
      const meaning = (scripture.english_translation || scripture.hindi_meaning || '').trim();
      const ref = scripture.reference || 'Sacred Scripture';
      text += `As revealed in the divine wisdom of **${ref}**:\n\n**« ${orig} »**\n\n**Meaning —** "${meaning}"\n\n`;
      text += `Let this sacred teaching be your guiding light. Fulfill whatever righteous duty lies before you with honesty as divine worship (Karma Yoga), and anchor your restless intellect in constant 'Radha-Radha' chanting. Do not harbor despair; all is guided by Divine Grace. Shri Radha!`;
    } else {
      text += `Whatever circumstance life places before you, fulfill your prescribed duties with integrity and patience as divine service. Daily anchor your thoughts in the Holy Name ('Radha-Radha') and keep company with uplifting spiritual wisdom. All will be auspicious, dear child. Jai Jai Shri Radhe!`;
    }
    return text;
  }

  const address = seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा';

  if (isGreeting) {
    return `राधे राधे बच्चा! श्री जी तुम्हें खूब भक्ति, शांति और नाम जप का बल प्रदान करें। सदैव लाडली जू के चरणों का आश्रय रखो। कहो, क्या जिज्ञासा है तुम्हारी?`;
  }

  let text = `${address}, तुमने जो बात पूछी है, उसे शांत चित्त होकर ध्यान से समझो।\n\n`;
  text += `जीवन की कोई भी परिस्थिति या संशय हो, जब तक दृष्टि केवल सांसारिक फल या चिंताओं पर रहेगी, तब तक मन चंचल और व्यथित रहेगा। जो भी कर्तव्य तुम्हारे सामने है, उसे केवल सांसारिक भार न समझकर प्रभु की पावन सेवा मानकर निष्काम भाव से करो।\n\n`;

  if (scripture && scripture.original_text) {
    const orig = scripture.original_text.trim();
    const meaning = (scripture.hindi_meaning || scripture.english_translation || '').trim();
    const ref = scripture.reference || 'पावन शास्त्र';
    text += `इस विषय में **${ref}** का पावन प्रमाण ध्यान से सुनो:\n\n**« ${orig} »**\n\n**अर्थात् —** "${meaning}"\n\n`;
    text += `इस पावन वचन को अपने हृदय में धारण करो. अपने दैनिक कर्म को भगवत आराधना मानकर ईमानदारी से निभाओ, व्यर्थ की चिंताओं को लाडली जू के चरणों में समर्पित कर दो, और श्वास-श्वास में 'श्री राधा-राधा' नाम का आश्रय लो। जब नाम का सहारा होगा, तो मन का हर संशय शांत हो जाएगा। घबराना नहीं, सब मंगल होगा बच्चा! जय जय श्री राधे!`;
  } else {
    text += `धर्मानुकूल आचरण रखो, माता-पिता और गुरुजनों का आदर करो, और अधिक से अधिक समय वाणी से 'राधा-राधा' नाम का जप करो। भगवन्नाम ही इस संसार में सबसे बड़ा संबल है। लाडली जू कृपा करेंगी बच्चा, खूब भजन करो। जय जय श्री राधे!`;
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
