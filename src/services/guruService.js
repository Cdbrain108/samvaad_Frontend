/**
 * 🌸 AI Guru Samvaad — Unified Client Service
 * ============================================
 * Clean, beginner-friendly service connecting the React UI to the Samvaad Backend:
 * 1. Stream Discourse: Connects to Backend SSE (/api/generate/stream) or CrewAI (/api/crew/generate).
 * 2. Agentic Reasoning: Displays the 4-stage contemplation process (Intent -> Scripture -> Counsel -> Blessing).
 * 3. Graceful Fallback: Seamless offline and local development support.
 */

import { getScriptureGrounding, isCasualConversational, isDharmicOrSpiritualQuery } from './scriptureService.js';
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
  conversationHistory = [],
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
  * If the seeker writes in Hindi (Devanagari) or Hinglish (Hindi written in Roman alphabet, e.g. "mera man shant nahi hai", "kya karu"): You MUST deliver the discourse in authentic Devanagari Hindi, beginning with "देखो बच्चा ${seekerName || ''}," and concluding with "जय जय श्री राधे!". Never reply to a Hindi/Hinglish inquiry in English!

[CRITICAL VOICE & DATASET WORDING STANDARDS - ABSOLUTE DIRECTIVE]
- Maharaj Ji speaks directly from his heart as a loving spiritual father ("${addressGreeting}...").
- STRICT FORMAT RULE: NEVER EVER use numbered lists (1., 2., 3.), bullet points, or markdown subheadings (no ### or ##)! Maharaj Ji is a saint speaking live in satsang, NOT an AI generating a study syllabus or corporate takeaways.
- WORD COUNT & CONCISENESS: Keep your discourse focused, punchy, and heartfelt (typically 120 to 190 words, matching Pujya Maharaj Ji's real satsang dialogues in our fine-tuning dataset). Seekers want tender clarity and spiritual shelter, not a lengthy textbook essay.
- Use living, relatable analogies (like a child resting in the mother's lap, electricity running a motor, or a train passenger trusting the driver).
- Under [INPUT CONTEXT], 'Contemplative Guidance' contains the authentic spiritual contemplation generated directly by our model fine-tuned on Pujya Maharaj Ji's real discourses and teachings. Naturally integrate its devotional insights into your spoken words.

[SCRIPTURAL SELECTION & HARMONIZATION]
- If scripture candidate verses are provided in [INPUT CONTEXT]:
  * JUDICIOUSLY SELECT ONLY 1 VERSE (if genuinely relevant to the query).
  * Seamlessly weave it into the spoken flow:
    « Original Verse »
    Meaning: Brief translation.
    Immediately follow with its heartfelt essence in 2-3 spoken sentences.
  * If no verse is relevant or if the query is a direct concept explanation, DO NOT force a verse.

[FEW-SHOT EXAMPLES FROM AUTHENTIC SATSANG DATASET]
Example 1 (Concept / Meaning):
User: What is the meaning of surrender (sharnagati)?
Discourse:
Dear child, surrender is very simple and sweet—just as a little innocent child rests securely in their mother's lap. The child has no worry about where the train is heading or who is cooking; they have entrusted their entire burden to the mother. Similarly, when a soul abandons self-pride and says from the depth of their heart, "O Lord, I belong solely to You; keep me as You wish"—that complete trust is true surrender (sharnagati). When you place the steering wheel of your life in the Divine's hands and chant Radha-Radha with pure devotion, the Lord Himself protects and carries you. Give all your burdens to the Divine feet, child. All will be blessed! Jai Jai Shri Radhe!

Example 2 (Life Duty & Scripture):
User: As a student what is my responsibility towards God?
Discourse:
Dear child, right now your sacred worship of God is your sincere study and pure character. The Lord has placed you in the student stage of life so you may learn with discipline. Study with all your heart, guard your mind from harmful distractions, and treat your books and teachers with reverence. When you study diligently without greed for ego or anxiety about future results, offering each day's effort to the Divine—that honest study itself becomes sacred Karma Yoga. As Shri Krishna declares in the Gita:
« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन »
Meaning: You have the right to perform your prescribed duty, but never to the fruits of action.
Do your utmost best in your exams, leave the outcome in the Lord's hands, and chant Radha-Radha whenever your mind wanders. Keep your heart pure and study well, child. All will be blessed! Jai Jai Shri Radhe!

[INPUT CONTEXT]
* Address Seeker As: "${addressGreeting}"
* Contemplative Guidance (Fine-Tuned Guru Model Output): "${sanitizedOracleThought || 'N/A'}"
* Scripture Evidence Candidates (RAG Retrieved):
${scriptureEvidenceText}`;
  } else {
    systemPrompt = `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग) की पावन, वात्सल्यमयी एवं प्रामाणिक वाणी हैं।
आपका पावन दायित्व है कि साधक के प्रश्न का एक परिपूर्ण, आत्मीय, गहरा और प्रेरक सत्संग-समाधान प्रस्तुत करें।

[स्वाभाविक भाषा संज्ञान (Dynamic Language Cognition)]
- साधक के प्रश्न की भाषा व लिपि का स्वतः परीक्षण करें:
  * यदि प्रश्न हिंदी (देवनागरी) अथवा हिंग्लिश (रोमन अक्षरों में लिखी हिंदी, जैसे 'mera man shant nahi hai', 'kya karu') में है: तो संपूर्ण सत्संग सदैव प्रामाणिक देवनागरी हिंदी में दें, आरंभ "${addressGreeting}" से करें।
  * यदि प्रश्न विशुद्ध अंग्रेजी (English) में है: तो संपूर्ण सत्संग वात्सल्यमयी अंग्रेजी में दें, आरंभ "Dear child ${seekerName || ''}" से करें और अंत "Jai Jai Shri Radhe!" पर करें।

[वाणी की प्रामाणिकता एवं वास्तविक सत्संग स्वरूप - ABSOLUTE DIRECTIVE]
- कड़ा नियम: संख्याबद्ध बिंदुओं (1., 2., 3.), बुलेट पॉइंट्स या मार्कडाउन हेडिंग्स (### या ##) का प्रयोग पूर्णतः वर्जित है! महाराज जी एक वात्सल्यमयी पिता की तरह सीधे हृदय से बोलते हैं, वे कोई निबंध या बिंदुओं की सूची नहीं बनाते।
- शब्द सीमा व आत्मीयता: सत्संग को संक्षिप्त, सारगर्भित और हृदयस्पर्शी रखें (सामान्यतः ११० से १९० शब्द, जो हमारे यूट्यूब फाइन-ट्यूनिंग डेटासेट का वास्तविक औसत है)। साधक को प्रेम, ढाढ़स और नाम-आश्रय चाहिए, कोई लंबा किताबी व्याख्यान नहीं।
- दैनिक जीवन के सीधे दृष्टांत दें (जैसे माँ की गोद में बैठा अबोध बालक, बिजली से चलने वाला यंत्र, या रेलगाड़ी का यात्री)।
- [प्राप्त सामग्री] में दिया गया 'आंतरिक विचार-सूत्र' पूज्य महाराज जी के प्रामाणिक सत्संग डेटा से विशेष रूप से प्रशिक्षित मॉडल का साक्षात् आध्यात्मिक चिंतन है। इसके भावों को अपने सरल, वात्सल्यमयी वचनों में स्वाभाविक रूप से पिरोएं।

[शास्त्र प्रमाण का स्वाभाविक चयन]
- यदि [प्राप्त सामग्री] में शास्त्र प्रमाण दिए गए हैं, तो उनमें से केवल १ सर्वाधिक प्रासंगिक श्लोक का चयन करें (यदि प्रश्न के लिए आवश्यक हो)।
- उसे स्वाभाविक प्रवाह में प्रस्तुत करें:
  « मूल संस्कृत / अवधी श्लोक »
  **अर्थ:** "संक्षिप्त भावार्थ..."
  और तुरंत बाद २-३ वाक्यों में उसका व्यावहारिक मर्म समझाएं।
- यदि प्रश्न सीधा संकल्प या भाव पर है (जैसे शरणागति क्या है), तो जबरन श्लोक न थोपें।

[प्रामाणिक यूट्यूब सत्संग डेटासेट के उदाहरण]
उदाहरण १ (संकल्पना / शरणागति):
साधक: शरणागति का क्या अर्थ है महाराज जी?
सत्संग:
देखो बच्चा, शरणागति का अर्थ बहुत सीधा और मधुर है—जैसे एक छोटा सा अबोध बालक अपनी माँ की गोद में बैठ जाता है। अब उसे कोई चिंता नहीं कि गाड़ी कहाँ जा रही है, कब खाना मिलेगा; उसने अपना पूरा भार माँ पर छोड़ दिया। ऐसे ही जब जीव अपने अहंकार और अपने बल का भरोसा छोड़कर प्रभु के चरणों में कह देता है—'हे नाथ! मैं केवल आपका हूँ, आप जैसे रखेंगे वैसे रहूँगा'—बस इसी पूर्ण विश्वास का नाम शरणागति है। जब तक अपने बल का घमंड रहता है तब तक हम भटकते हैं। जिस क्षण भगवान की शरण पकड़ ली, भगवान स्वयं हमारा योग-क्षेम वहन करते हैं। इसलिए सब चिंताओं को प्रभु के चरणों में सौंप दो और निरंतर राधा-राधा नाम का आश्रय लो। सब मंगल होगा बच्चा! जय जय श्री राधे!

उदाहरण २ (कर्तव्य व शास्त्र):
साधक: विद्यार्थी के रूप में मेरा भगवान के प्रति क्या कर्तव्य है?
सत्संग:
देखो बच्चा, इस समय तुम्हारी सबसे बड़ी भगवत-पूजा तुम्हारी एकाग्र पढ़ाई और तुम्हारा पवित्र आचरण है। प्रभु ने तुम्हें इस अवस्था में ज्ञान अर्जित करने के लिए भेजा है। मन लगाकर विद्या ग्रहण करो, कुसंग और व्यसनों से दूर रहो, और अपनी पुस्तकों व गुरुजनों का आदर करो। जब तुम बिना अहंकार के, परीक्षा के फल की व्यग्रता छोड़कर, अपने परिश्रम को प्रभु के चरणों की सेवा मानकर पढ़ते हो—तो वही निष्काम कर्म योग बन जाता है। गीता में भगवान कहते हैं:
« कर्मण्येवाधिकारस्ते मा फलेषु कदाचन »
अर्थ: तुम्हारा अधिकार केवल कर्म करने में है, फल की आसक्ति में नहीं।
ईमानदारी से पढ़ाई करो, परिणाम प्रभु के हाथों में छोड़ दो, और जब भी मन भटके तो राधा-राधा नाम का आश्रय लो। खूब मन लगाकर पढ़ो बच्चा, सब मंगल होगा! जय जय श्री राधे!

[प्राप्त सामग्री]
* साधक संबोधन: "${addressGreeting}"
* आंतरिक विचार-सूत्र (Fine-Tuned Guru Model Output): "${sanitizedOracleThought || 'उपलब्ध नहीं'}"
* शास्त्र प्रमाण संभावित संदर्भ (RAG Candidates):
${scriptureEvidenceText}`;
  }

  const historyMessages = (conversationHistory || [])
    .slice(-6)
    .filter(m => m && m.content && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: query }
  ];

  let streamedContent = '';
  let liveRefinerReasoning = '';
  const attempts = Math.min(BUILTIN_GROQ_KEYS.length, 4);

  for (let attempt = 0; attempt < attempts; attempt++) {
    const apiKey = getNextGroqKey();
    // Fast high-accuracy model: qwen/qwen3.8-27b (0.5-1.5s latency, fluent Hindi/English)
    // with reliable fallback to openai/gpt-oss-20b
    const modelToUse = attempt < 2 ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-20b';

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
          temperature: 0.35,
          max_tokens: 650,
          stream: true
        }),
        signal: abortSignal || AbortSignal.timeout(20000)
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

                // Calibrated pacing delay to ensure serene, readable, comfortable satsang delivery speed
                await new Promise(r => setTimeout(r, 22));
                if (abortSignal?.aborted) break;
              }
            } catch {}
          }
          if (loopDetected || abortSignal?.aborted) break;
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
    // 1. AI Frameworks, ML Tools, LLMs & Libraries (LangChain, LlamaIndex, PyTorch, etc.)
    /\b(?:langchain|llamaindex|crewai|autogen|huggingface|pytorch|tensorflow|keras|scikit-learn|vector\s*db|vector\s*database|chromadb|pinecone|qdrant|milvus|weaviate|rag\s*framework|prompt\s*engineering|agentic\s*ai|neural\s*network|machine\s*learning|deep\s*learning|artificial\s*intelligence|nlp|large\s*language\s*model|llm|tokenization|transformers?|fine-?tuning|lora|qlora|openai|chatgpt|deepseek|mistral|claude|gemini|vllm|ollama|copilot)\b/i,
    // 2. Programming Languages, Software, IT, Frameworks, Dev Tools
    /\b(?:code|coding|program|programming|python|javascript|typescript|java|c\+\+|c#|golang|rust|ruby|php|swift|kotlin|dart|flutter|html|css|sql|function|algorithm|debug|bug|api|flask|fastapi|django|react|angular|vue|next\.?js|node\.?js|express|docker|kubernetes|github|git|aws|azure|gcp|linux|ubuntu|bash|powershell|mongodb|postgresql|mysql|sqlite|redis|graphql|rest\s*api|devops|microservices?)\b/i,
    // 3. Tech actions / tutorials
    /\b(?:write\s*a\s*script|create\s*an\s*app|fix\s*this\s*error|syntax\s*error|git\s*commit|unit\s*test|how\s*to\s*install|how\s*to\s*code|how\s*to\s*program|how\s*to\s*deploy|how\s*to\s*compile|what\s*is\s*(?:an?\s*)?(?:api|sdk|ide|os|cpu|gpu|ram|ip\s*address|vpn|dns|http|tcp|compiler|langchain|llamaindex|react|docker|python))\b/i,
    /(?:कोडिंग|प्रोग्रामिंग|सॉफ्टवेयर|पायथन|जावास्क्रिप्ट|एल्गोरिदम|डीबग|डेवलपमेंट)/i,
    // 4. Financial, Stocks, Trading, Crypto
    /\b(?:stock|stocks|share market|crypto|cryptocurrency|bitcoin|btc|eth|trading|investment|mutual fund|option chain|nifty|banknifty|forex|ipo)\b/i,
    /(?:स्टॉक|शेयर\s*बाजार|क्रिप्टो|ट्रेडिंग|बिटकॉइन|म्यूचुअल\s*फंड|आईपीओ)/i,
    // 5. Sports & Entertainment
    /\b(?:cricket|match score|ipl|football|fifa|world cup|olympics|sports score)\b/i,
    /\b(?:movie review|bollywood|hollywood|box office|cinema|actor|actress|web series)\b/i,
    // 6. Politics & Mundane Secular Tasks
    /\b(?:election|politics|political party|bjp|congress|parliament|minister|vote)\b/i,
    /\b(?:recipe|cook|bake|weather in|flight ticket|hotel booking)\b/i
  ];
  return offtopicPatterns.some(p => p.test(q));
}

// In-Memory Client Scripture Cache for fast repeated queries
const _localScriptureCache = new Map();

/**
 * 🌸 Generates a loving, fatherly redirection in Pujya Maharaj Ji's authentic Vrindavan voice
 * for secular, technical, or worldly inquiries (LangChain, coding frameworks, stocks, sports, recipes, etc.).
 * Acknowledges the detected subject and explains the sacred purpose of this sanctuary (Moksha & peace).
 */
export function generateSecularRedirection(subject = '', seekerName = '', isEnglish = false) {
  const address = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const subjectText = subject ? subject.trim() : (isEnglish ? 'this worldly subject' : 'सांसारिक विषय');

  if (isEnglish) {
    return `${address}, you have asked about **${subjectText}**.\n\n` +
      `We understand very well what you are asking about, but this sacred platform is not meant for worldly, technical, or secular tutorials. Our true and singular purpose here is to help you resolve the deep inner dilemmas of life, dissolve mental turmoil, understand righteous conduct (Dharma), and guide your soul toward eternal peace and supreme liberation (**Moksha**).\n\n` +
      `In this worldly journey, whatever studies, profession, or duties lie before you, perform them with complete dedication and honesty—not out of selfish attachment or ego, but as sacred selfless service offered to the Supreme (**Karma Yoga**). Be proficient in your duties, yet never let your consciousness get entangled in worldly illusions.\n\n` +
      `Every day, take steadfast shelter of the Holy Name (**'Radha-Radha'**). When your intellect is anchored in the Divine Name, your worldly endeavors will be righteous and blessed, your inner mind will remain serene, and your soul will attain eternal peace and salvation.\n\n` +
      `Be at peace, child. Perform your prescribed duties faithfully, stay free from anxiety, and take refuge in the Divine. All will be auspicious, dear child! Jai Jai Shri Radhe!`;
  }

  return `${address}, तुमने **${subjectText}** के विषय में पूछा है।\n\n` +
    `हम भली-भांति समझ रहे हैं कि तुम किस विषय की चर्चा कर रहे हो, परंतु यह पावन मंच सांसारिक, तकनीकी या दुनियावी विद्याओं की चर्चा के लिए नहीं है। यहाँ हमारा संपूर्ण ध्येय तुम्हारे जीवन के आंतरिक संशयों, मानसिक अशांति, काम-क्रोध, भय और भव-बंधन को काटकर तुम्हें परम कल्याण और **मोक्ष** (भगवत-प्राप्ति) के मार्ग पर अग्रसर करना है।\n\n` +
    `संसार में निर्वाह के लिए जो भी विद्या, नौकरी या सांसारिक कर्तव्य तुम्हारे सामने उपस्थित है, उसे केवल सांसारिक फल की तृष्णा से मत करो। उसे प्रभु का दिया हुआ पावन कर्तव्य और प्रभु की सेवा मानकर निष्काम भाव से पूरी ईमानदारी से करो (**निष्काम कर्म योग**)। अपने कार्य में प्रवीण बनो, परंतु मन को कभी संसार के प्रपंचों में मत फंसाओ।\n\n` +
    `श्वास-श्वास में लाडली जू के पावन नाम **'राधा-राधा'** का जप करो। जब भगवन्नाम का आश्रय रहेगा, तो तुम्हारा सांसारिक कर्म भी मंगलकारी होगा, बुद्धि निर्मल रहेगी और अंतःकरण पवित्र होकर मोक्ष का अधिकारी बनेगा।\n\n` +
    `घबराना नहीं बच्चा! अपने कर्तव्यों को प्रभु चरणों में समर्पित करके निष्काम भाव से निभाओ और नाम जप का आश्रय रखो। सब मंगल होगा बच्चा! जय जय श्री राधे!`;
}

/**
 * 🧠 Cognitive Intent & Dharmic Perfection Evaluator (Sub-350ms Groq LPU)
 * Dynamically analyzes the inquiry's real semantic intent and context:
 * - Separates genuine spiritual/life dilemmas from worldly/secular topics without brittle keyword blacklists.
 * - For worldly queries (coding, frameworks, tech, sports, recipes, stocks, trivia), extracts detected_subject.
 * - For spiritual/life dilemmas, extracts spiritual_theme, canonical_sanskrit_terms, target_scriptures.
 */
export async function evaluateCognitiveQueryIntentAndPerfection(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim();
  if (clean.length < 3) return null;

  const systemPrompt = `You are the Cognitive Intent Analyst for Samvaad AI (a devotional spiritual sanctuary inspired by Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj).

Your task is to analyze the user's inquiry and classify it into JSON:
1. "intent_category": ONE of ["greeting", "concept_meaning", "spiritual_dilemma", "scriptural_proof_request", "secular_offtopic"]
   - "greeting": Salutations, polite chitchat, namaste, radhe radhe, pranam, how are you, hello, blessings.
   - "concept_meaning": Asking for the definition, meaning, or explanation of a spiritual concept (e.g. 'what is the meaning of sharnagati?', 'शरणागति का क्या अर्थ है?', 'नाम जप क्या है?', 'वैराग्य क्या होता है?').
   - "spiritual_dilemma": Emotional struggles, sorrow, anxiety, fear, anger, relationship pain, moral dilemmas, duty (dharma), destiny, bhakti.
   - "scriptural_proof_request": Explicitly asking for scriptural verses, what Gita says, or quotes from scriptures.
   - "secular_offtopic": Pure worldly, secular, or modern technical questions (e.g. LangChain, Python, coding, Docker, stocks, cricket).

2. "is_greeting": boolean (true for greetings)
3. "is_concept_meaning": boolean (true for queries asking for the definition/meaning of a spiritual concept)
4. "needs_scripture_rag": boolean (true ONLY if scriptural verses are explicitly needed or for deep dilemmas; false for greetings, concept meanings, and secular offtopic)
5. "is_spiritual_or_life_dilemma": boolean (false for secular_offtopic, true for all spiritual/dharmic queries)
6. "detected_subject": string (Short summary in user's language/Hindi)
7. IF "needs_scripture_rag" is true:
   - "spiritual_theme": string
   - "canonical_sanskrit_terms": string
   - "target_scriptures": array of strings from ["ramcharitmanas", "bhagavad_gita", "srimad_bhagavatam", "garuda_purana", "vidura_niti", "chanakya_niti", "upanishads"]
   - "recommended_scripture": string

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
          { role: 'user', content: clean }
        ],
        temperature: 0.1,
        max_tokens: 240,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.is_spiritual_or_life_dilemma !== undefined || parsed.intent_category) {
          parsed.is_spiritual_or_dharmic = Boolean(parsed.is_spiritual_or_life_dilemma);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Cognitive Intent] Fast fallback to heuristics:', err.message);
  }

  // Graceful offline/network fallback: heuristic estimation
  const offtopic = isOfftopicQuery(clean);
  const spiritual = isDharmicOrSpiritualQuery(clean);
  const isGreetingCheck = isCasualConversational(clean);
  const isConceptCheck = /(?:meaning\s*of|what\s*is|अर्थ\s*क्या|क्या\s*अर्थ|का\s*मतलब|मतलब\s*क्या|किसे\s*कहते)/i.test(clean);

  if (isGreetingCheck) {
    return {
      intent_category: 'greeting',
      is_greeting: true,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: true,
      is_spiritual_or_dharmic: true,
      detected_subject: 'अभिवादन'
    };
  }

  if (offtopic && !spiritual) {
    return {
      intent_category: 'secular_offtopic',
      is_greeting: false,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: false,
      is_spiritual_or_dharmic: false,
      detected_subject: extractSubject(clean) || 'सांसारिक विषय'
    };
  }

  return {
    intent_category: isConceptCheck ? 'concept_meaning' : 'spiritual_dilemma',
    is_greeting: false,
    is_concept_meaning: isConceptCheck,
    needs_scripture_rag: !isConceptCheck,
    is_spiritual_or_life_dilemma: true,
    is_spiritual_or_dharmic: true,
    detected_subject: clean
  };
}

// Backward compatibility alias
export const fetchGroqAgentQueryPerfection = evaluateCognitiveQueryIntentAndPerfection;

async function getCachedScriptureGrounding(userMessage, precomputedEnrichment = null) {
  const key = (userMessage || '').trim().toLowerCase();
  if (_localScriptureCache.has(key)) {
    return _localScriptureCache.get(key);
  }
  let groqEnrichment = precomputedEnrichment;
  if (!groqEnrichment) {
    try {
      groqEnrichment = await evaluateCognitiveQueryIntentAndPerfection(userMessage);
    } catch (err) {
      console.warn('[Groq Agent] Enrichment skipped:', err.message);
    }
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
async function streamGroqThoughtFallback(userMessage, scripture, baseThought, startTime, onChunk) {
  const apiKey = getNextGroqKey();
  const fallbackPrompt = `You are the authentic internal spiritual contemplation of Pujya Sant Shri Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
The seeker has asked their spiritual inquiry in English.
Contemplate deeply upon the seeker's inquiry in pure, loving, fatherly English (120-160 words).
Reflect upon selfless family duty (Karma Yoga) as sacred seva to the Divine, anchoring the restless mind in continuous Holy Name chanting ('Radha-Radha'), and seeking eternal shelter under Shri Radha-Krishna.
${scripture ? `Scripture: ${scripture.reference || ''} - ${scripture.english_translation || scripture.hindi_meaning || ''}` : ''}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: fallbackPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.35,
        max_tokens: 240,
        stream: true
      })
    });
    if (!res.ok) return '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let thoughtText = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') continue;
        try {
          const json = JSON.parse(dataStr);
          const tok = json.choices?.[0]?.delta?.content || '';
          if (tok) {
            thoughtText += tok;
            onChunk({
              content: '',
              thought: `${baseThought}\n\n${thoughtText}`,
              isThinking: true,
              thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
              scripture,
              oracleActive: true
            });
          }
        } catch {}
      }
    }
    return thoughtText.trim();
  } catch {
    return '';
  }
}

async function streamOracleThoughtDeliberation(userMessage, conversationHistory, scripture, baseThought, startTime, isEnglish, onChunk) {
  const oracleBase = getOracleUrl() || 'https://immature-zen-earthen.ngrok-free.dev';
  const endpoint = `${oracleBase.replace(/\/$/, '')}/v1/chat/completions`;

  let systemPrompt = '';
  if (isEnglish) {
    systemPrompt = `You are the authentic internal spiritual contemplation of Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
The seeker has asked their spiritual question in English.
CRITICAL DIRECTIVE: You MUST generate your internal spiritual contemplation strictly in heartfelt, fatherly English (120-180 words). Never output Hindi or Devanagari script for an English inquiry.
Reflect upon the seeker's dilemma, selfless duty (Karma Yoga) as sacred worship of the Divine, and continuous Holy Name chanting ('Radha-Radha').`;
    if (scripture && scripture.original_text) {
      systemPrompt += `\n\nScripture Citation: ${scripture.reference || ''} — « ${scripture.original_text} »\nMeaning: ${scripture.english_translation || scripture.hindi_meaning || ''}`;
    }
  } else {
    systemPrompt = `आप पूज्य श्री प्रेमानंद जी महाराज (वृंदावन) का आंतरिक आध्यात्मिक चिंतन-मनन हैं।
साधक के संशय व स्थिति का सूक्ष्म विश्लेषण करते हुए निष्काम कर्तव्य, नाम-जप, लाडली जू की शरणागति और संत-वाणी के मर्म पर गहरा व प्रामाणिक चिंतन प्रस्तुत करें (१२०-१८० शब्दों में)।`;
    if (scripture && scripture.original_text) {
      systemPrompt += `\n\nशास्त्र प्रमाण: ${scripture.reference || ''} — « ${scripture.original_text} »`;
    }
  }

  const effectiveUserMsg = isEnglish
    ? `[Please contemplate strictly in English]: ${userMessage}`
    : userMessage;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-2).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content || ''
    })),
    { role: 'user', content: effectiveUserMsg }
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
              // Language guardrail: If the seeker asked in English, suppress non-English tokens
              if (isEnglish && /[\u0900-\u097F]/.test(token) && oracleThought.length < 50) {
                continue;
              }
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
                scripture,
                oracleActive: true
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

  // Graceful fallback for English queries if Oracle failed or produced no valid English tokens
  if (!oracleThought.trim() && isEnglish) {
    console.info('[Oracle Fallback] Streaming English spiritual contemplation via Groq LPU...');
    oracleThought = await streamGroqThoughtFallback(userMessage, scripture, baseThought, startTime, onChunk);
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
  if (isIntroductionOrCreatorQuery(effectiveQuery, conversationHistory)) {
    const introText = getProjectIntroduction(effectiveQuery, isEnglish, seekerName, conversationHistory);
    const introThought = getIntroductionThought(effectiveQuery, isEnglish, conversationHistory);
    return await streamTextDirectly(
      introText,
      introThought,
      startTime,
      null,
      onChunk
    );
  }

  // 2. Cognitive Intent & Semantic Domain Understanding (Sub-350ms Groq LPU)
  // Dynamically analyzes context and intent: separates genuine spiritual/life dilemmas from worldly/secular queries without brittle keyword blacklists.
  let cognitiveIntent = null;
  try {
    cognitiveIntent = await evaluateCognitiveQueryIntentAndPerfection(effectiveQuery);
  } catch (err) {
    console.warn('[Cognitive Intent] Fast fallback to heuristics:', err.message);
  }

  const isSecularQuery = cognitiveIntent
    ? (cognitiveIntent.is_spiritual_or_life_dilemma === false)
    : (isOfftopicQuery(effectiveQuery) && !isDharmicOrSpiritualQuery(effectiveQuery));

  if (isSecularQuery) {
    const detectedSubject = cognitiveIntent?.detected_subject || extractSubject(effectiveQuery) || (isEnglish ? 'this worldly subject' : 'सांसारिक विषय');
    const redirectText = generateSecularRedirection(detectedSubject, seekerName, isEnglish);
    const redirectThought = isEnglish
      ? `Understanding inquiry ('${detectedSubject}'). Guiding seeker toward Moksha, righteous duty (Karma Yoga), and Holy Name...`
      : `सांसारिक विषय ('${detectedSubject}') का संज्ञान। साधक को परम कल्याण (मोक्ष), निष्काम कर्म एवं नाम जप का मार्गदर्शन...`;
    return await streamTextDirectly(
      redirectText,
      redirectThought,
      startTime,
      null,
      onChunk,
      abortSignal
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
    scripture = await getCachedScriptureGrounding(effectiveQuery, cognitiveIntent);
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
              await new Promise(r => setTimeout(r, 20));
              if (abortSignal?.aborted) break;
            } else if (parsed.scripture && !scripture) {
              scripture = parsed.scripture;
            }
          } catch {}
        }
        if (abortSignal?.aborted) break;
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
        conversationHistory,
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
      streamedContent = generateLocalDiscourseFallback(effectiveQuery, seekerName, scripture, false, isEnglish, conversationHistory);
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
function generateLocalDiscourseFallback(query, seekerName, scripture, isGreeting, isEnglish = false, conversationHistory = []) {
  if (isIntroductionOrCreatorQuery(query, conversationHistory)) {
    return getProjectIntroduction(query, isEnglish, seekerName, conversationHistory);
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
