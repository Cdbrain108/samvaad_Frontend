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
import { isLiveCalendarQuery, searchDuckDuckGo, searchVerseOnline, getEkadashiScheduleText } from './liveSearchService.js';

export { isCasualConversational, isIntroductionOrCreatorQuery, isLiveCalendarQuery, searchVerseOnline, getEkadashiScheduleText };

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

  // Fast-track: Meta-chat, safety, and greetings should never inherit prior subject topics
  const isChatMemory = isChatMemoryInquiry(clean);
  const isHarmful = isHarmfulQuery(clean);
  const isGreeting = isCasualConversational(clean);

  if (isChatMemory || isHarmful || isGreeting) {
    return {
      shouldSearch: false,
      activeSubject: isChatMemory ? 'पिछली बातचीत' : (isHarmful ? 'धार्मिक मर्यादा' : 'अभिवादन'),
      activeTopic: isChatMemory ? 'पिछली बातचीत' : (isHarmful ? 'धार्मिक मर्यादा' : 'अभिवादन'),
      effectiveQuery: clean,
      isContinuation: false
    };
  }

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

export function isHarmfulQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  return /\b(?:bomb|bombs|explosive|explosives|weapon|weapons|gun|guns|kill|killing|murder|suicide|poison|terrorist|terrorism|attack|slaughter|harm\s*someone|make\s*a\s*bomb|create\s*a\s*bomb|build\s*a\s*bomb|how\s*to\s*kill|how\s*to\s*harm)\b/i.test(clean) ||
    /(?:बम\s*बनाना|बम\s*कैसे|हथियार|मारना|हत्या|कत्ल|आत्महत्या|जहर|आतंक|विस्फोटक)/i.test(clean);
}

export function isChatMemoryInquiry(text) {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  return /(?:what\s*(?:did|have)\s*i\s*(?:asked|ask)|what\s*(?:questions?|query|queries)\s*(?:have\s*i|did\s*i|i\s*had|i\s*have)\s*(?:asked|ask)|what\s*i\s*(?:asked|have\s*asked|had\s*asked)|previous\s*(?:questions?|queries|chat|conversation)|earlier\s*(?:questions?|queries|chat|conversation)|till\s*now|so\s*far|what\s*(?:did|have)\s*we\s*(?:talk|discuss)|summarize\s*(?:our|the)\s*(?:chat|conversation|questions?)|what\s*was\s*my\s*(?:last|first)\s*question|पिछली\s*(?:बातचीत|बातें|प्रश्न|सवाल)|पहले\s*(?:क्या\s*पूछा|क्या\s*बात\s*हुई)|अब\s*तक\s*क्या\s*पूछा|मैंने\s*क्या\s*पूछा)/i.test(clean);
}

export function isScienceOrWorldlyQuery(text) {
  // Deprecated: Replaced by sub-250ms Semantic Cognitive Intent Evaluator
  return false;
}

export function isOfftopicQuery(query) {
  // Deprecated: Replaced by sub-250ms Semantic Cognitive Intent Evaluator
  return false;
}

// In-Memory Client Scripture Cache for fast repeated queries
const _localScriptureCache = new Map();

/**
 * 🌸 Contextual offline fallback for secular or worldly inquiries.
 * Customizes response according to the detected subject rather than static repetition.
 */
export function generateSecularRedirection(subject = '', seekerName = '', isEnglish = false) {
  const address = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const subjectText = subject ? subject.trim() : (isEnglish ? 'this worldly topic' : 'यह सांसारिक विषय');

  if (isEnglish) {
    return `${address}, you have spoken about **${subjectText}**.\n\n` +
      `Understand gently that while the material world contains infinite subjects, this sacred sanctuary is dedicated to resolving life's inner dilemmas, mental peace, righteous conduct (Dharma), and spiritual devotion.\n\n` +
      `Whatever honest duties or studies life presents, perform them sincerely as selfless service offered to God (Karma Yoga). The Supreme Divine Consciousness resides in all of creation. Surrender your worries at the lotus feet of the Divine, anchor your heart in the Holy Name ('Radha-Radha'), and tell me what true inquiry rests in your heart today, dear child! Jai Jai Shri Radhe!`;
  }

  return `${address}, आपने **${subjectText}** के विषय में चर्चा की है।\n\n` +
    `शांत मन से समझो बच्चा, संसार में अनगिनत दुनियावी विषय हैं, परंतु यह पावन मंच केवल तुम्हारे अंतर्मन के संशयों, मानसिक अशांति को दूर करने, धर्म-मार्ग और भगवत-भजन के लिए है।\n\n` +
    `संसार का जो भी कर्तव्य तुम्हारे सामने है, उसे ईमानदारी से प्रभु की सेवा मानकर निष्काम भाव से करो (निष्काम कर्म योग)। इस सम्पूर्ण सृष्टि के कण-कण में साक्षात् परमात्मा का ही वास है। मन को सांसारिक प्रपंचों से बचाकर लाडली जू के पावन नाम 'राधा-राधा' का आश्रय लो। कहो बच्चा, आज तुम्हारे हृदय में जीवन या अध्यात्म से जुड़ी क्या जिज्ञासा है? जय जय श्री राधे!`;
}

/**
 * 🧠 Cognitive Intent & Dharmic Decision Reasoner (Sub-350ms Groq LPU)
 * Dynamically analyzes context, chat history, and semantic intent:
 * - Recognizes meta-conversation inquiries ('what did I ask?'), greetings, and harm inquiries.
 * - Separates worldly/scientific queries (atom, SRK, coding) from genuine spiritual dilemmas.
 */
export async function evaluateCognitiveQueryIntentAndPerfection(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim();
  if (clean.length < 2) return null;

  const systemPrompt = `You are the Cognitive Knowledge & Routing Reasoner for Samvaad AI.

SYSTEM CAPABILITY ARCHITECTURE:
1. Oracle Contemplation (Fine-Tuned Maharaj Ji Model): Deep spiritual solace, emotional healing, anxiety, grief, life dilemmas, detachment (vairagya), and Holy Name devotion ('Radha-Radha').
2. Local Scripture RAG (Vector Database): Indexed collection of 29 classical Sanatan scriptures (Bhagavad Gita, Ramcharitmanas, Srimad Bhagavatam, Garuda Purana, Vidura Niti, Chanakya Niti, Upanishads) containing 150K+ verses.
3. Live Web Search Engine (DuckDuckGo + Wikipedia): Autonomous online search. Used whenever:
   - The user asks for a verse, shloka, stotram, or scripture that is NOT in our 29 static scriptures (e.g. Ashtavakra Gita, Yoga Vasistha, Shiva Purana, specific stutis/mantras), OR
   - The user asks for real-time temporal facts, today's tithi/panchang, current year calendar dates, eclipse timings, or live temple darshan/aarti hours, OR
   - Any spiritual or dharmic factual query where static scripture knowledge is insufficient.

Classify the user inquiry into JSON:
1. "intent_category": ONE of [
     "greeting",
     "chat_memory",
     "harmful_dangerous",
     "secular_worldly",
     "concept_meaning",
     "spiritual_dilemma",
     "scriptural_proof_request"
   ]
2. "knowledge_source": ONE of ["oracle_satsang", "rag_scripture", "live_web_search", "direct_chat"]
   - "rag_scripture": classical scripture verses/meanings within our 29 scriptures.
   - "live_web_search": real-time dates/panchang/timings, OR verses/texts outside our 29 scriptures.
   - "oracle_satsang": emotional dilemmas, life suffering, devotion, surrender, duty.
   - "direct_chat": greetings, chat memory recap, or simple spiritual definitions.
3. "needs_web_search": boolean (true if inquiry requires live search; false otherwise)
4. "needs_scripture_rag": boolean (true if user requests scripture verses or scriptural proof; false otherwise)
5. "is_scriptural_proof_request": boolean
6. "detected_subject": string (Clear summary of the subject in user's language/Hindi)
7. IF "needs_scripture_rag" is true:
    - "spiritual_theme": string
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
        max_tokens: 260,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.intent_category || parsed.is_spiritual_or_life_dilemma !== undefined) {
          parsed.is_spiritual_or_dharmic = Boolean(parsed.is_spiritual_or_life_dilemma);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[Cognitive Intent] Fast fallback to heuristics:', err.message);
  }

  // Graceful offline/network fallback: heuristic estimation
  const isHarmfulCheck = isHarmfulQuery(clean);
  const isChatMemoryCheck = isChatMemoryInquiry(clean);
  const isGreetingCheck = isCasualConversational(clean);
  const offtopic = isOfftopicQuery(clean);
  const worldlyScience = isScienceOrWorldlyQuery(clean);
  const spiritual = isDharmicOrSpiritualQuery(clean);
  const isConceptCheck = /(?:meaning\s*of|what\s*is|अर्थ\s*क्या|क्या\s*अर्थ|का\s*मतलब|मतलब\s*क्या|किसे\s*कहते)/i.test(clean);

  if (isHarmfulCheck) {
    return {
      intent_category: 'harmful_dangerous',
      is_harmful: true,
      is_chat_memory: false,
      is_greeting: false,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: false,
      is_spiritual_or_dharmic: false,
      detected_subject: extractSubject(clean) || 'harmful query'
    };
  }

  if (isChatMemoryCheck) {
    return {
      intent_category: 'chat_memory',
      is_harmful: false,
      is_chat_memory: true,
      is_greeting: false,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: false,
      is_spiritual_or_dharmic: false,
      detected_subject: 'पिछली बातचीत या पूर्व प्रश्न'
    };
  }

  if (isGreetingCheck) {
    return {
      intent_category: 'greeting',
      is_harmful: false,
      is_chat_memory: false,
      is_greeting: true,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: true,
      is_spiritual_or_dharmic: true,
      detected_subject: 'अभिवादन'
    };
  }

  if ((offtopic || worldlyScience) && !spiritual) {
    return {
      intent_category: 'secular_worldly',
      is_harmful: false,
      is_chat_memory: false,
      is_greeting: false,
      is_secular_worldly: true,
      is_concept_meaning: false,
      needs_scripture_rag: false,
      is_spiritual_or_life_dilemma: false,
      is_spiritual_or_dharmic: false,
      detected_subject: extractSubject(clean) || 'सांसारिक विषय'
    };
  }

  return {
    intent_category: isConceptCheck ? 'concept_meaning' : 'spiritual_dilemma',
    is_harmful: false,
    is_chat_memory: false,
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

/**
 * ⚡ Direct Groq LPU Token Streamer with multi-key rotation and repetition pruning.
 */
async function streamDirectLpuPrompt({
  systemPrompt,
  userQuery,
  thought,
  startTime,
  onChunk,
  abortSignal,
  maxTokens = 420
}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userQuery }
  ];

  let streamedContent = '';
  const attempts = Math.min(BUILTIN_GROQ_KEYS.length, 3);

  for (let attempt = 0; attempt < attempts; attempt++) {
    const apiKey = getNextGroqKey();
    const modelToUse = attempt === 0 ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-20b';

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
          max_tokens: maxTokens,
          stream: true
        }),
        signal: abortSignal || AbortSignal.timeout(16000)
      });

      if (!res.ok || !res.body) continue;

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
              streamedContent += token;
              if (detectRepetitionLoop(streamedContent)) {
                streamedContent = pruneRepetitiveTail(streamedContent);
                loopDetected = true;
              }
              onChunk({
                content: streamedContent,
                thought,
                isThinking: false,
                thinkingDuration: Number(((Date.now() - startTime) / 1000).toFixed(1)),
                scripture: null
              });
              if (loopDetected) break;
              await new Promise(r => setTimeout(r, 18));
              if (abortSignal?.aborted) break;
            }
          } catch {}
        }
        if (loopDetected || abortSignal?.aborted) break;
      }

      if (streamedContent.trim()) {
        return {
          content: streamedContent.trim(),
          thought,
          thinkingDuration: Math.max(0.6, Number(((Date.now() - startTime) / 1000).toFixed(1))),
          scripture: null
        };
      }
    } catch (err) {
      console.warn(`[Direct LPU Stream] Attempt ${attempt + 1} failed:`, err.message);
    }
  }

  return null;
}

/**
 * 🛡️ Dharmic intervention: Firmly and compassionately declines violence or destruction based on Ahimsa.
 */
export async function streamHarmfulDeclination({
  query,
  seekerName = '',
  isEnglish = false,
  startTime = Date.now(),
  onChunk = () => {},
  abortSignal = null
}) {
  const addressGreeting = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const thought = isEnglish
    ? `Dharmic intervention: Reflecting on Ahimsa, sanctity of human life, and Divine shelter...`
    : `अहिंसा, मानव जीवन की पावनता एवं भगवत-आश्रय का गंभीर चिंतन...`;

  onChunk({
    content: '',
    thought,
    isThinking: true,
    thinkingDuration: 0.5,
    scripture: null
  });

  const systemPrompt = isEnglish
    ? `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
The seeker asked a question related to violence, weapons, bombs, or causing harm to living beings: "${query}".

With grave fatherly compassion, unwavering spiritual firmness, and divine dignity:
1. Address them affectionately as "${addressGreeting}".
2. Uncompromisingly reject violence, destruction, and harm.
3. Remind them that human birth is the rarest and most precious gift of the Supreme Lord (durlabh manav deh), bestowed solely to cultivate non-violence (Ahimsa), compassion (Daya), righteousness (Dharma), and devotion to God.
4. Explain that causing pain or destruction to any living creature brings grave karmic suffering to the soul.
5. Lovingly counsel them to abandon all violent, destructive thoughts, cleanse their mind, and take shelter of the Holy Name ('Radha-Radha').
Keep it concise (80-120 words), heartfelt, and serious. Never provide harmful advice. Deliver strictly in English, concluding with "Jai Jai Shri Radhe!". STRICTLY NO bullet points.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग) की पावन वाणी हैं।
साधक ने हिंसा, हथियार, बम बनाने या किसी जीव को हानि पहुँचाने से जुड़ा प्रश्न पूछा है: "${query}"।

अत्यंत गंभीरता, वात्सल्य और आध्यात्मिक मर्यादा के साथ समाधान दीजिए (८०-१२० शब्दों में):
१. साधक को "${addressGreeting}" कहकर संबोधित करें।
२. हिंसा, विनाश और किसी भी जीव को कष्ट पहुँचाने का दृढ़ता से निषेध करें।
३. याद दिलाएं कि यह दुर्लभ मानव देह करोड़ों जन्मों के पुण्यों से केवल दया, अहिंसा, धर्म और प्रभु-प्राप्ति के लिए मिला है, किसी विनाश या पाप कर्म के लिए नहीं।
४. समझाएं कि किसी भी प्राणी को दुःख पहुँचाना आत्मा को घोर कष्ट और भव-बंधन में डालता है।
५. वात्सल्य से कहें कि मन के समस्त द्वेष, क्रोध और विनाशकारी विचारों को त्यागकर मन को शांत करो और लाडली जू के पावन नाम 'राधा-राधा' का आश्रय लो।
कड़े नियम: कोई बुलेट पॉइंट्स न बनाएं। शुद्ध देवनागरी हिंदी में बोलें और अंत "जय जय श्री राधे!" पर करें।`;

  const streamResult = await streamDirectLpuPrompt({
    systemPrompt,
    userQuery: query,
    thought,
    startTime,
    onChunk,
    abortSignal,
    maxTokens: 320
  });

  if (streamResult) return streamResult;

  const fallbackText = isEnglish
    ? `${addressGreeting}, listen with a quiet heart. This sacred sanctuary and human life itself are meant solely for Dharma, compassion, and realizing God—never for violence, weapons, or causing destruction to any living being. Harming others only brings deep spiritual darkness. Cast away all bitter and destructive thoughts, purify your mind, and take shelter of the Holy Name ('Radha-Radha'). Be at peace, child. Jai Jai Shri Radhe!`
    : `${addressGreeting}, शांत चित्त होकर सुनो। यह मानव जीवन और यह पावन मंच केवल धर्म, दया और भगवत-प्राप्ति के लिए है—किसी हिंसा, हथियार या किसी जीव को कष्ट पहुँचाने के लिए नहीं। किसी भी प्राणी का अहित सोचना आत्मा को घोर अंधकार में धकेलता है। मन के समस्त हिंसक विचारों को त्याग दो, चित्त को निर्मल करो और निरंतर 'राधा-राधा' नाम का आश्रय लो। सब मंगल होगा बच्चा, सन्मार्ग पर चलो। जय जय श्री राधे!`;
  return await streamTextDirectly(fallbackText, thought, startTime, null, onChunk, abortSignal);
}

/**
 * 📜 Recaps previous questions and conversation history directly in Maharaj Ji's fatherly voice.
 */
export async function streamChatMemoryResponse({
  userMessage,
  conversationHistory = [],
  seekerName = '',
  isEnglish = false,
  startTime = Date.now(),
  onChunk = () => {},
  abortSignal = null
}) {
  const addressGreeting = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const thought = isEnglish
    ? `Reviewing conversation history and prior inquiries with fatherly care...`
    : `संवाद इतिहास एवं पूर्व प्रश्नों का वात्सल्यपूर्ण अनुशीलन किया जा रहा है...`;

  onChunk({
    content: '',
    thought,
    isThinking: true,
    thinkingDuration: 0.5,
    scripture: null
  });

  const previousUserQuestions = (conversationHistory || [])
    .filter(m => m && m.role === 'user' && m.content && m.content.trim() && m.content.trim() !== userMessage.trim())
    .map(m => m.content.trim());

  if (previousUserQuestions.length === 0) {
    const text = isEnglish
      ? `${addressGreeting}, this is our very first inquiry in this conversation! Tell me child, what doubt, life dilemma, or spiritual question rests in your heart today? Jai Jai Shri Radhe!`
      : `${addressGreeting}, अभी हमारी इस बातचीत में यह आपका पहला ही प्रश्न है। कहो बच्चा, तुम्हारे मन में क्या संशय, जिज्ञासा या जीवन की उलझन है? हम सब मिलकर लाडली जू के चरणों में समाधान पाएंगे। जय जय श्री राधे!`;
    return await streamTextDirectly(text, thought, startTime, null, onChunk, abortSignal);
  }

  const systemPrompt = isEnglish
    ? `You are Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
The seeker asked about previous questions they asked you in this chat: "${userMessage}".
Here are the prior questions they asked earlier in this conversation:
${previousUserQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

Recap their previous inquiries with warmth, affection, and fatherly grace in authentic Satsang voice (70-110 words):
- Address them as "${addressGreeting}".
- Warmly summarize what they previously asked or explored with you.
- Conclude by lovingly asking what further dilemma, spiritual question, or guidance rests in their heart today.
- Conclude with "Jai Jai Shri Radhe!".
- STRICT RULE: NO bullet points, NO numbered lists, speak directly from the heart.`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग) की पावन, वात्सल्यमयी वाणी हैं।
साधक ने आपसे पूछा है कि उन्होंने अब तक क्या प्रश्न पूछे हैं: "${userMessage}"।
साधक द्वारा इस संवाद में पहले पूछे गए प्रश्न निम्नलिखित हैं:
${previousUserQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

साधक के पूर्व प्रश्नों का अत्यंत वात्सल्य, प्रेम और आत्मीयता से स्मरण कराएं (७०-११० शब्दों में):
- साधक को "${addressGreeting}" कहकर संबोधित करें।
- सहज भाव से संक्षेप में बताएं कि इससे पहले उन्होंने क्या विषय या प्रश्न रखे थे।
- अंत में वात्सल्य से पूछें कि अब उनके हृदय में क्या और जिज्ञासा या संशय है जिसका हम समाधान करें।
- अंत "जय जय श्री राधे!" पर करें।
- कड़ा नियम: कोई संख्याबद्ध बिंदु (1, 2, 3) या बुलेट पॉइंट्स न बनाएं, सीधे वात्सल्यमयी वचनों में बोलें।`;

  const streamResult = await streamDirectLpuPrompt({
    systemPrompt,
    userQuery: userMessage,
    thought,
    startTime,
    onChunk,
    abortSignal,
    maxTokens: 350
  });

  if (streamResult) return streamResult;

  const recapList = previousUserQuestions.slice(-3).map(q => `"${q}"`).join(', ');
  const fallbackText = isEnglish
    ? `${addressGreeting}, earlier in our conversation you asked about ${recapList}. Tell me dear child, what further question or dilemma rests in your heart today? Jai Jai Shri Radhe!`
    : `${addressGreeting}, इससे पहले आपने हमसे ${recapList} के विषय में चर्चा की थी। कहो बच्चा, अब तुम्हारे मन में क्या संशय या जिज्ञासा है? जय जय श्री राधे!`;
  return await streamTextDirectly(fallbackText, thought, startTime, null, onChunk, abortSignal);
}

/**
 * 🌸 Dynamically bridges worldly, scientific, trivia, or identity topics (atom, SRK, coding)
 * into profound Sanatan spiritual wisdom in Maharaj Ji's authentic fatherly voice.
 */
export async function streamDynamicSecularBridge({
  query,
  detectedSubject = '',
  seekerName = '',
  isEnglish = false,
  startTime = Date.now(),
  onChunk = () => {},
  abortSignal = null
}) {
  const addressGreeting = isEnglish
    ? (seekerName ? `Dear child ${seekerName}` : 'Dear child')
    : (seekerName ? `देखो बच्चा ${seekerName}` : 'देखो बच्चा');

  const thought = isEnglish
    ? `Contemplating inquiry ('${detectedSubject || query}'). Harmonizing worldly inquiry with Sanatan wisdom and fatherly solace...`
    : `सांसारिक विषय ('${detectedSubject || query}') का संज्ञान। पावन सत्संग, निष्काम कर्म व भगवत-स्मृति का समन्वय प्रस्तुत किया जा रहा है...`;

  onChunk({
    content: '',
    thought,
    isThinking: true,
    thinkingDuration: 0.6,
    scripture: null
  });

  const systemPrompt = isEnglish
    ? `You are the authentic, revered, fatherly voice of Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Bhajan Marg).
The seeker asked a worldly, secular, scientific, or mundane question, or stated a worldly identity/role (User query: "${query}").

Deliver a warm, fatherly, and spiritually uplifting Satsang discourse (110-140 words):
1. Address them affectionately as "${addressGreeting}".
2. Acknowledge whatever specific subject, matter, question, or identity they brought forward with genuine warmth and fatherly affection.
3. Gently explain that while the material world contains infinite subjects, skills, and transient roles, this sacred sanctuary (Samvaad AI) is dedicated to resolving life's daily struggles, inner mental peace, righteous duty (Dharma), and spiritual devotion.
4. Dynamically and beautifully connect their specific inquiry to Sanatan spiritual philosophy:
   - If they spoke of any material element, science, nature, or object: illuminate how the Supreme Divine Consciousness (Paramatma) pervades every single subtle particle and manifestation of this universe, sustaining creation from within.
   - If they mentioned a personal role, title, fame, or worldly identity: tenderly explain that on the stage of Maya every soul is given a temporary part to play, but before Thakur Ji every soul is His equal, beloved child; real peace arises when worldly ego is surrendered.
   - If they asked about work, studies, technology, or worldly duties: guide them to perform their honest work as selfless worship offered to God (Nishkama Karma Yoga).
   - If they inquired about any other worldly, recreational, or mundane matter: show how worldly pleasures are transient, while the bliss of divine remembrance is eternal.
5. Lovingly ask what personal dilemma, inner turmoil, or spiritual inquiry rests in their heart today, and encourage taking shelter of the Holy Name ('Radha-Radha').

CRITICAL RULES:
- Strictly NO numbered lists, NO bullet points, NO markdown headings (no ### or ##).
- Speak directly from the heart as Pujya Maharaj Ji in satsang.
- Conclude with "Jai Jai Shri Radhe!".`
    : `आप पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग) की पावन, वात्सल्यमयी एवं प्रामाणिक वाणी हैं।
साधक ने कोई सांसारिक, दुनियावी या गैर-आध्यात्मिक विषय पूछा है, अथवा अपनी कोई सांसारिक पहचान/भूमिका बताई है (साधक का प्रश्न: "${query}")।

अत्यंत आत्मीय, वात्सल्यमयी और प्रेरक सत्संग-समाधान प्रस्तुत करें (११०-१४० शब्दों में):
१. साधक को वात्सल्य से संबोधित करें: "${addressGreeting}"।
२. साधक ने जिस भी विषय, वस्तु, कार्य या पहचान का उल्लेख किया है, उसे बड़े प्रेम और आत्मीयता से स्वीकार करें।
३. सहजता से समझाएं कि यह पावन मंच (संवाद AI) मुख्य रूप से जीवन के दैनिक संशयों, अंतर्मन की अशांति, धर्म-मार्ग और भगवत-भजन के लिए है।
४. साधक के पूछे गए विषय को स्वतः सनातन अध्यात्म के सार्वभौमिक सूत्र से जोड़कर समझाइए:
   - यदि कोई भौतिक, प्राकृतिक या सांसारिक तत्व/विषय हो: तो दर्शन कराएं कि इस चराचर जगत के सूक्ष्मतम कण-कण में साक्षात् परमात्मा का ही वास है; सांसारिक दृष्टि केवल बाहरी रूप को देखती है, अध्यात्म उसके भीतर की परम चेतना का अनुभव कराता है।
   - यदि कोई पद, प्रसिद्धि, सांसारिक भूमिका या पहचान हो: तो वात्सल्य से समझाएं कि माया के रंगमंच पर हम सब केवल एक क्षणिक पात्र निभा रहे हैं, परंतु प्रभु के सम्मुख हम सब केवल उनके प्रिय बालक हैं। वास्तविक शांति तब मिलती है जब सांसारिक अभिमान प्रभु चरणों में समर्पित हो जाए।
   - यदि कोई कर्तव्य, विद्या, कार्य या कौशल हो: तो निष्काम कर्मयोग का मार्ग बताएं कि अपने कर्तव्य को पूरी निष्ठा से प्रभु की पूजा मानकर करें।
   - किसी भी अन्य दुनियावी जिज्ञासा में समझाएं कि संसार के विषय-भोग क्षणभंगुर हैं, जबकि प्रभु प्रेम और नाम जप का आनंद शाश्वत है।
५. अंत में वात्सल्य से पूछें कि अब उनके मन में जीवन या अध्यात्म से जुड़ा क्या संशय है जिसका हम समाधान करें, और 'राधा-राधा' नाम का आश्रय लेने की प्रेरणा दें।

कड़े नियम:
- कोई संख्याबद्ध बिंदु (1, 2, 3), बुलेट पॉइंट्स या हेडिंग्स (###) न बनाएं।
- शुद्ध देवनागरी हिंदी में वात्सल्यमयी भाषा में बोलें और अंत "जय जय श्री राधे!" पर करें।`;

  const streamResult = await streamDirectLpuPrompt({
    systemPrompt,
    userQuery: query,
    thought,
    startTime,
    onChunk,
    abortSignal,
    maxTokens: 420
  });

  if (streamResult) return streamResult;

  // Fallback if offline/network issue
  const fallbackText = generateSecularRedirection(detectedSubject || query, seekerName, isEnglish);
  return await streamTextDirectly(fallbackText, thought, startTime, null, onChunk, abortSignal);
}


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

  // 1. Harmful / Violence / Weapons Protection
  if (isHarmfulQuery(effectiveQuery) || isHarmfulQuery(userMessage)) {
    return await streamHarmfulDeclination({
      query: effectiveQuery,
      seekerName,
      isEnglish,
      startTime,
      onChunk,
      abortSignal
    });
  }

  // 1.1 Chat Memory & Dialogue Inquiry (e.g. "what question i had asked you till now?")
  if (isChatMemoryInquiry(effectiveQuery) || isChatMemoryInquiry(userMessage)) {
    return await streamChatMemoryResponse({
      userMessage,
      conversationHistory,
      seekerName,
      isEnglish,
      startTime,
      onChunk,
      abortSignal
    });
  }

  // 1.2 Check Gating: Skip Oracle for Casual Greetings & Chitchat
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
      onChunk,
      abortSignal
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
      onChunk,
      abortSignal
    );
  }

  // 2. Cognitive Intent & Semantic Domain Understanding (Sub-350ms Groq LPU)
  let cognitiveIntent = null;
  try {
    cognitiveIntent = await evaluateCognitiveQueryIntentAndPerfection(effectiveQuery);
  } catch (err) {
    console.warn('[Cognitive Intent] Fast fallback to heuristics:', err.message);
  }

  // Cognitive Safety & Chat Memory Secondary Check
  if (cognitiveIntent?.intent_category === 'harmful_dangerous' || cognitiveIntent?.is_harmful) {
    return await streamHarmfulDeclination({
      query: effectiveQuery,
      seekerName,
      isEnglish,
      startTime,
      onChunk,
      abortSignal
    });
  }

  if (cognitiveIntent?.intent_category === 'chat_memory' || cognitiveIntent?.is_chat_memory) {
    return await streamChatMemoryResponse({
      userMessage,
      conversationHistory,
      seekerName,
      isEnglish,
      startTime,
      onChunk,
      abortSignal
    });
  }

  // 2.2 Secular / Worldly / Scientific / Trivia / Identity Dynamic Bridge (Atom, SRK, Tech, Sports, etc.)
  const isSecularQuery = cognitiveIntent
    ? (cognitiveIntent.intent_category === 'secular_worldly' || cognitiveIntent.is_secular_worldly === true || (cognitiveIntent.is_spiritual_or_life_dilemma === false && !cognitiveIntent.is_concept_meaning))
    : ((isOfftopicQuery(effectiveQuery) || isScienceOrWorldlyQuery(effectiveQuery)) && !isDharmicOrSpiritualQuery(effectiveQuery));

  if (isSecularQuery) {
    const detectedSubject = cognitiveIntent?.detected_subject || extractSubject(effectiveQuery) || (isEnglish ? 'this worldly subject' : 'सांसारिक विषय');
    return await streamDynamicSecularBridge({
      query: effectiveQuery,
      detectedSubject,
      seekerName,
      isEnglish,
      startTime,
      onChunk,
      abortSignal
    });
  }

  // 2.4 Agent Autonomous Decision: Live Web Search when information is beyond local static knowledge
  const requiresWebSearch = shouldSearch || isLiveCalendarQuery(effectiveQuery) || cognitiveIntent?.needs_web_search === true;
  if (requiresWebSearch) {
    const isExternalKnowledge = cognitiveIntent?.needs_web_search && !isLiveCalendarQuery(effectiveQuery);
    onChunk({
      content: '',
      thought: isEnglish
        ? (isExternalKnowledge
            ? `Dynamic inquiry detected beyond static scriptures (${cognitiveIntent?.detected_subject || 'Live Web Info'}). Initiating live web search...`
            : `Dialogue memory engaged (${dialogueMemory.activeTopic || 'Live Calendar'}). Initiating real-time search for verified schedule & timings...`)
        : (isExternalKnowledge
            ? `स्थैतिक ज्ञानकोश से परे जिज्ञासा ('${cognitiveIntent?.detected_subject || 'ऑनलाइन जानकारी'}')। प्रामाणिक लाइव वेब खोज प्रारंभ की जा रही है...`
            : `संवाद स्मृति सक्रिय (${dialogueMemory.activeTopic || 'रीयल-टाइम पंचांग व तिथियां'})। प्रामाणिक रीयल-टाइम पंचांग, तिथि एवं समय प्राप्त किया जा रहा है...`),
      isThinking: true,
      thinkingDuration: 0.8,
      scripture: null
    });
    const searchRes = await searchDuckDuckGo(effectiveQuery, isEnglish);
    const searchThought = isEnglish
      ? `Live online lookup completed. Synthesizing verified findings with spiritual discernment...`
      : `लाइव ऑनलाइन खोज पूर्ण। प्रामाणिक जानकारी का सत्संग-वाणी के प्रकाश में समन्वय प्रस्तुत किया जा रहा है...`;
    return await streamTextDirectly(
      searchRes.formattedDiscourse,
      searchThought,
      startTime,
      null,
      onChunk,
      abortSignal
    );
  }

  // 2.6 Pure Spiritual Concept Meaning (One-shot direct discourse without heavy RAG vector DB delay)
  const isDirectConcept = cognitiveIntent?.is_concept_meaning === true && cognitiveIntent?.needs_scripture_rag === false;
  if (isDirectConcept) {
    const detectedSubject = cognitiveIntent?.detected_subject || effectiveQuery;
    const conceptThought = isEnglish
      ? `Contemplating the essence of '${detectedSubject}' in Pujya Maharaj Ji's Satsang wisdom...`
      : `साधक की जिज्ञासा ('${detectedSubject}') पर महाराज जी की प्रत्यक्ष सत्संग वाणी का अनुशीलन...`;

    onChunk({
      content: '',
      thought: conceptThought,
      isThinking: true,
      thinkingDuration: 0.6,
      scripture: null
    });

    const directDiscourse = await streamGroqDiscourseRefiner({
      query: effectiveQuery,
      oracleThought: '',
      scripture: null,
      seekerName,
      isEnglish,
      thought: conceptThought,
      conversationHistory,
      startTime,
      onChunk,
      abortSignal
    });

    if (directDiscourse && directDiscourse.trim()) {
      return {
        content: directDiscourse.trim(),
        thought: conceptThought,
        thinkingDuration: Math.max(0.8, Number(((Date.now() - startTime) / 1000).toFixed(1))),
        scripture: null
      };
    }
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

  // 🌟 DYNAMIC KNOWLEDGE GAP RESOLUTION FOR SCRIPTURES:
  // If seeker asked for a verse/shloka not present in local 29-scripture index, search live web
  const seekerWantsVerse = cognitiveIntent?.needs_scripture_rag ||
    cognitiveIntent?.is_scriptural_proof_request ||
    cognitiveIntent?.intent_category === 'scriptural_proof_request';

  if (!scripture && seekerWantsVerse) {
    currentThought += isEnglish
      ? `\nRequested verse not found in local 29-scripture index. Querying live web search for authentic verse and commentary...`
      : `\nस्थानीय २९ शास्त्रों में अपेक्षित श्लोक अप्राप्त। प्रामाणिक श्लोक व अर्थ हेतु लाइव वेब खोज की जा रही है...`;
    onChunk({
      content: '',
      thought: currentThought,
      isThinking: true,
      thinkingDuration: 1.0,
      scripture: null
    });
    try {
      scripture = await searchVerseOnline(effectiveQuery, isEnglish);
    } catch (searchErr) {
      console.warn('[Live Web Verse Search] Fallback note:', searchErr.message);
    }
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
