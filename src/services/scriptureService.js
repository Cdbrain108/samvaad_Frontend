/**
 * Scripture Grounding & RAG Retrieval Engine for Samvaad
 * Provides authentic, diverse, multi-scripture matching from:
 * - Shrimad Bhagavad Gita
 * - Shri Ramcharitmanas
 * - Srimad Bhagavatam
 * - Shri Radha Sudha Nidhi
 */

import { analyzeQuery } from './queryIntent.js';

// Re-export scripture database from dedicated data module
export { SCRIPTURE_DATABASE } from '../data/scriptureDatabase.js';
import { SCRIPTURE_DATABASE } from '../data/scriptureDatabase.js';

/**
 * Normalizes query string for robust cross-lingual matching
 */
function normalizeQuery(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w\s\u0900-\u0D7F]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes scripture meaning by converting archaic 'age of Kali' translations to 'Kaliyug' / 'Kaliyuga'
 * to avoid seeker confusion with Maa Kali (Goddess Kali).
 */
export function normalizeScriptureMeaning(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\b(?:in\s+the\s+age\s+of\s+kali|in\s+the\s+kali\s+age)\b/gi, 'in Kaliyug')
    .replace(/\b(?:sins\s+of\s+the\s+age\s+of\s+kali|sins\s+of\s+the\s+kali\s+age)\b/gi, 'sins of Kaliyug')
    .replace(/\b(?:the\s+age\s+of\s+kali|the\s+kali\s+age)\b/gi, 'Kaliyug')
    .replace(/\b(?:sins\s+of\s+kali)\b/gi, 'sins of Kaliyug')
    .replace(/\b(?:afflictions\s+of\s+kali)\b/gi, 'afflictions of Kaliyug')
    .replace(/\b(?:terrors\s+of\s+kali)\b/gi, 'terrors of Kaliyug')
    .replace(/\b(?:evils\s+of\s+kali)\b/gi, 'evils of Kaliyug')
    .replace(/\b(?:age\s+of\s+kali)\b/gi, 'Kaliyug')
    .replace(/\b(?:in\s+kali)\b/gi, 'in Kaliyug')
    .replace(/\bkali\s+yuga\b/gi, 'Kaliyuga')
    .replace(/\bkali\s+yug\b/gi, 'Kaliyug')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Casual conversational gating:
 * Returns true if the query is merely a greeting or casual remark
 * that should receive warm natural Satsang discourse WITHOUT forcing an unprompted scripture shlok.
 */
export function isCasualConversational(query) {
  if (!query) return true;
  let clean = query.trim().toLowerCase();
  if (clean.length < 3) return true;

  // Remove trailing/leading honorifics for greeting check
  const stripped = clean
    .replace(/(?:महाराज\s*जी|महाराज|गुरु\s*जी|गुरुजी|गुरुदेव|बाबा\s*जी|प्रभु\s*जी|ji|guruji|maharaj\s*ji|baba\s*ji)/gi, '')
    .replace(/[^\w\s\u0900-\u0D7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Pure greetings (Hindi Devanagari, English, and Latin Hinglish)
  const pureGreetings = /^(?:राधे\s*राधे|जय\s*श्री\s*(?:कृष्णा?|राम|राधे)|प्रणाम|चरण\s*स्पर्श|नमस्ते|नमस्कार|राम\s*राम|हेलो|हाय|hello|hi|hey|good\s*(?:morning|evening|afternoon)|hare\s*krishna|radhe\s*radhe|radhey?\s*radhey?|jai\s*shree?\s*(?:krishna|ram|radhe)|namaste|pranam|charan\s*sparsh|hare\s*(?:krishna|rama?)|ram\s*ram|hey\s*there|hello\s*there|hi\s*there)$/i;
  if (!stripped || pureGreetings.test(stripped) || pureGreetings.test(clean)) return true;

  // Simple routine queries like 'how are you' (exclude 'who are you' which has its own full introduction)
  const casualQuestions = /^(?:आप\s*कैसे\s*हैं|कैसे\s*हो|सब\s*ठीक\s*है|हाल\s*चाल|how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do)$/i;
  if (casualQuestions.test(stripped) || casualQuestions.test(clean)) return true;

  return false;
}

/**
 * Core Domain Eligibility Classifier (Whitelist Architecture)
 * RAG Scripture Grounding is STRICTLY OPT-IN:
 * It ONLY runs for authentic Dharmic, scriptural, philosophical, moral, or spiritual dilemmas.
 * For physical science (atoms, gravity), secular tech, worldly trivia, or mundane queries,
 * it returns false, completely preventing forced scriptural citations.
 */
export const SCRIPTURAL_TERMS = /(?:\b(?:gita|geeta|ramayan|ramayana|ramcharitmanas|bhagavat|bhagavatam|puran|purana|puranas|veda|vedas|upanishad|upanishads|mahabharata|smriti|niti|sukta|stotra|mantra|mantras|shlok|shloka|shlokas|verses?|scriptures?)\b|गीता|रामायण|रामचरितमानस|भागवत|पुराण|वेद|उपनिषद|उपनिषद्|महाभारत|स्मृति|नीति|सूक्त|स्तोत्र|मंत्र|श्लोक|प्रमाण|शास्त्र)/iu;

export const DHARMIC_CONCEPTS = /(?:\b(?:god|lord|krishna|rama|shiva|vishnu|radha|deity|divine|moksha|mukti|dharma|adharma|karma|maya|aatma|atman|soul|souls|brahman|bhakti|satsang|sadhana|naam|japa|vairagya|guru|gurus|sin|sins|virtue|heaven|hell|death|dying|mortality|fear\s*of\s*death|afterlife|reincarnation|deluge|destiny)\b|भगवान|ईश्वर|प्रभु|परमात्मा|श्रीकृष्ण|कृष्ण|राम|शिव|विष्णु|राधा|हनुमान|दुर्गा|गणेश|मोक्ष|मुक्ति|धर्म|अधर्म|कर्म|कर्मफल|माया|आत्मा|ब्रह्म|भक्ति|सत्संग|साधना|नाम\s*जप|नाम\s*महिमा|वैराग्य|त्याग|संन्यास|गुरु|दीक्षा|पाप|पुण्य|स्वर्ग|नरक|मृत्यु|परलोक|यमराज|यमलोक|जन्म|पुनर्जन्म|संसार|प्रलय|सत्य)/iu;

export const SPIRITUAL_EMOTIONS = /(?:\b(?:inner\s*peace|peace\s*of\s*mind|anger|lust|greed|ego|jealousy|anxiety|tensions?|depression|grief|sorrow|suffering|suffer|sufferings|loneliness|betrayal|forgiveness|revenge|purpose\s*of\s*(?:human\s*)?life|meaning\s*of\s*life|divine\s*love|meditation|prayer|prayers|surrender)\b|मन\s*अशांत|मन\s*की\s*शांति|मानसिक\s*शांति|क्रोध|काम|काम-वासना|वासना|लोभ|मोह|अहंकार|घमंड|ईर्ष्या|भय|चिंता|अवसाद|दुःख|दुख|कष्ट|पीड़ा|अकेलापन|धोखा|विश्वासघात|क्षमा|प्रतिशोध|बदला|जीवन\s*का\s*उद्देश्य|जीवन\s*का\s*लक्ष्य|जीवन\s*का\s*सार|जीने\s*की\s*वजह|सच्चा\s*प्रेम|भगवद्-प्रेम|ध्यान|प्रार्थना|शरण|शरणागति)/iu;

export function isDharmicOrSpiritualQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const q = query.trim();
  if (q.length < 3) return false;
  return SCRIPTURAL_TERMS.test(q) || DHARMIC_CONCEPTS.test(q) || SPIRITUAL_EMOTIONS.test(q);
}

// Backward compatibility alias
export function isSecularOrTechnical(query, groqEnrichment = null) {
  if (groqEnrichment?.is_spiritual_or_dharmic === false) return true;
  return !isDharmicOrSpiritualQuery(query);
}

const RAG_ENDPOINT = 'http://54.252.47.101/rag/search';

/**
 * Queries the live SOTA 1024-d Qdrant Vector Database on AWS
 * Executes intfloat/multilingual-e5-large semantic search in sub-250ms
 *
 * Scripture routing and candidate count both come from the shared
 * deterministic intent layer (queryIntent.js -> query_intent_rules.json), so
 * "Garuda Purana" searches only scripture_garuda_purana instead of all
 * eighteen Purana collections, and top_k reflects what the seeker asked for
 * rather than a fixed 8 that the discourse could never enumerate.
 */
async function queryOracleVectorRAG(query, originalUserQuery = '') {
  if (typeof fetch === 'undefined') return [];

  const controller = new AbortController();
  // Extended timeout: 12000ms ensures Multi-Source Scripture RAG multilingual-e5 search never aborts prematurely
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const textForFilter = originalUserQuery ? `${query} ${originalUserQuery}` : query;
  const intent = analyzeQuery(textForFilter);
  const scriptureFilter = intent.scriptureFilter || 'all';

  // Retrieve a small cushion above the ask so the reranker has something to
  // choose from, but never the old flat 8: fetching 8 while the prompt allowed
  // one verse is exactly what made the citations panel disagree with the body.
  // Robust verse count detection even with adjectives ("5 most powerful verses")
  const askedCountMatch = textForFilter.match(/(?:top\s*([2-9]|\d+)|\b([2-9]|\d+)\b(?:\s+\w+){0,4}\s+(?:verses?|shlokas?|श्लोक|प्रमाण))/i);
  const detectedCount = askedCountMatch ? Math.min(Math.max(parseInt(askedCountMatch[1] || askedCountMatch[2], 10), 2), 8) : (intent.wantsMultiple ? intent.verseCount : 1);
  const topK = detectedCount > 1
    ? Math.min(detectedCount + 2, 10)
    : 3;

  const cleanQ = normalizeQuery(originalUserQuery || query);

  try {
    const res = await fetch(RAG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      signal: controller.signal,
      body: JSON.stringify({
        query: query.trim(),
        scripture: scriptureFilter,
        top_k: topK
      })
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const rawCandidates = Array.isArray(data.results) ? data.results : [];

    const validCandidates = [];
    for (const c of rawCandidates) {
      if (!c || !c.original_text) continue;
      const vecScore = Number(c.score ?? c.vector_score ?? 0);
      const rrScore = c.rerank_score != null ? Number(c.rerank_score ?? c.rerankScore) : null;

      // Rejection floor: only reject if dense vector score is clearly poor
      if (vecScore < 0.60) continue;

      const hindiMean = normalizeScriptureMeaning((c.hindi_meaning || '').trim());
      const engMean = normalizeScriptureMeaning((c.english_translation || '').trim());
      if (hindiMean.length < 6 && engMean.length < 6) continue;

      const scriptureId = c.scripture_id || ((c.reference || '').toLowerCase().includes('gita') ? 'bhagavad_gita' : (c.collection || 'sacred_text').replace('scripture_', ''));
      const effectiveScore = Number(vecScore.toFixed(4));

      const itemCandidate = {
        id: c.id || `qdrant_${Date.now()}_${Math.random()}`,
        scripture_id: scriptureId,
        reference: c.reference,
        original_text: c.original_text,
        hindi_meaning: hindiMean || engMean,
        english_translation: engMean || hindiMean,
        score: effectiveScore,
        vector_score: vecScore,
        rerank_score: rrScore !== null ? Number(rrScore) : 0,
        blended_score: effectiveScore,
        match_type: 'qdrant_vector_rag'
      };

      // Check topic exclusion gate:
      if (isTopicExcluded(cleanQ, itemCandidate)) {
        continue;
      }

      const isGita = (itemCandidate.scripture_id || '').includes('gita') || (itemCandidate.reference || '').includes('Gita');
      itemCandidate.context_intro_hi = isGita
        ? `जैसे ${c.reference} में भगवान श्रीकृष्ण कहते हैं कि —`
        : `जैसे ${c.reference} में पावन उपदेश है कि —`;
      itemCandidate.context_intro_en = isGita
        ? `Just as revealed in ${c.reference} —`
        : `Just as proclaimed in ${c.reference} —`;

      validCandidates.push(itemCandidate);
    }

    return validCandidates;
  } catch (err) {
    clearTimeout(timeoutId);
  }
  return [];
}

const SCRIPTURE_STOP_WORDS = new Set([
  // Latin / Hinglish common stop words
  'kaise', 'kare', 'karein', 'karta', 'karti', 'karo', 'karna', 'karke',
  'door', 'dur', 'hota', 'hoti', 'hote', 'hai', 'hain', 'ho', 'hoon', 'hun',
  'nahi', 'nahin', 'mat', 'chahiye', 'batao', 'bataiye', 'kya', 'kyu', 'kyun',
  'meri', 'mera', 'mere', 'hum', 'hume', 'hame', 'aap', 'apka', 'apki', 'apne',
  'how', 'what', 'why', 'when', 'where', 'who', 'stop', 'overcome', 'from', 'with', 'and', 'the',
  // Comprehensive Devanagari / Hindi function & auxiliary stop words
  'क्या', 'क्यों', 'क्यो', 'कैसे', 'कैसा', 'कैसी', 'कितना', 'कितनी', 'कितने',
  'कहाँ', 'कहा', 'कहे', 'कहते', 'कहती', 'कहना',
  'है', 'हैं', 'हो', 'था', 'थी', 'थे', 'होता', 'होती', 'होते', 'होना', 'होने',
  'और', 'तथा', 'एवं', 'या', 'अथवा',
  'यह', 'वह', 'ये', 'वे', 'इस', 'उस', 'इन', 'उन', 'इन्हें', 'उन्हें', 'इससे', 'उससे',
  'का', 'के', 'की', 'को', 'में', 'से', 'पर', 'ने', 'तक', 'लिए', 'वास्ते', 'द्वारा',
  'किस', 'किसे', 'किसने', 'किसका', 'किसकी', 'किसके', 'कौन', 'कोई', 'कुछ',
  'अपना', 'अपनी', 'अपने', 'आप', 'हम', 'हमारा', 'हमारी', 'हमारे', 'मुझे', 'मुझको', 'मेरा', 'मेरी', 'मेरे',
  'नहीं', 'ना', 'मत',
  'चाहिए', 'सकता', 'सकती', 'सकते', 'सके',
  'करना', 'करने', 'करता', 'करती', 'करते', 'किया', 'किये', 'कीजिए', 'करो', 'करें',
  'देना', 'देने', 'देता', 'देती', 'देते', 'दिया', 'दिये', 'दीजिए', 'दो',
  'डालना', 'डालता', 'डालती', 'डालते', 'डाला',
  'रहना', 'रहता', 'रहती', 'रहते', 'रहा', 'रही', 'रहे',
  'बताना', 'बताओ', 'बताइए', 'जानना', 'बताएं',
  'प्रकार', 'तरह', 'बारे'
]);

export const SCRIPTURE_TOPIC_GATES = [
  {
    topic: 'matsya_purana',
    patterns: [/(मत्स्य|matsya)/i],
    allowedScriptureIds: ['matsya_purana']
  },
  {
    topic: 'garuda_purana',
    patterns: [/(गरुड़|गरुण|garud|garun)/i],
    allowedScriptureIds: ['garuda_purana']
  },
  {
    topic: 'shiva_purana',
    patterns: [/(शिव\s*पुराण|shiva?\s*puran)/i],
    allowedScriptureIds: ['shiva_purana', 'shiva']
  },
  {
    topic: 'vishnu_purana',
    patterns: [/(विष्णु\s*पुराण|vishnu\s*puran)/i],
    allowedScriptureIds: ['vishnu_purana', 'vishnu']
  },
  {
    topic: 'bhagavata_purana',
    patterns: [/(श्रीमद्भागवत|भागवत\s*पुराण|bhagavat|bhagavatam)/i],
    allowedScriptureIds: ['bhagavata_purana', 'srimad_bhagavatam']
  },
  {
    topic: 'bhagavad_gita',
    patterns: [/(गीता|भगवद्गीता|gita|geeta)/i],
    allowedScriptureIds: ['bhagavad_gita']
  },
  {
    topic: 'ramcharitmanas',
    patterns: [/(रामायण|रामचरितमानस|ramayan|ramcharitmanas|मानस)/i],
    allowedScriptureIds: ['ramcharitmanas']
  },
  {
    topic: 'samaveda',
    patterns: [/(सामवेद|sa+m\s*ved|samaveda)/i],
    allowedScriptureIds: ['samaveda', 'bhagavad_gita']
  },
  {
    topic: 'atharvaveda',
    patterns: [/(अथर्ववेद|atharv?a?\s*ved)/i],
    allowedScriptureIds: ['atharvaveda']
  },
  {
    topic: 'rigveda',
    patterns: [/(ऋग्वेद|ri?g\s*ved)/i],
    allowedScriptureIds: ['rigveda']
  },
  {
    topic: 'yajurveda',
    patterns: [/(यजुर्वेद|yajur?\s*ved)/i],
    allowedScriptureIds: ['yajurveda']
  }
];

export function isTopicExcluded(cleanQ, item) {
  if (!cleanQ || !item) return false;
  const sId = (item.scripture_id || '').toLowerCase();
  const ref = (item.reference || '').toLowerCase();

  // Exclude criminal sin verses and other puranas for sexuality questions - ONLY allow rcm_universal_love_equality
  const isSexuality = /(?:\bgay\b|homosexual|homosexuality|same\s*sex|like\s*boys|attracted\s*to\s*boys|queer|\blgbtq?\b|समलैंगिक|\bगे\b|लड़का\s*लड़के)/i.test(cleanQ);
  if (isSexuality) {
    return item.id !== 'rcm_universal_love_equality';
  }

  // Gate 'gita_summary_core': Only match when explicitly asking for a summary/essence of Gita or Gita 2.47/18.66
  if (item.id === 'gita_summary_core') {
    const isGitaSummaryQuery = /(summary\s*of\s*(?:geeta|gita)|geeta\s*summary|gita\s*summary|गीता\s*का\s*सार|गीता\s*का\s*सारांश|गीता\s*के\s*बारे\s*में|गीता\s*का\s*उपदेश|tell\s*me\s*about\s*gita|essence\s*of\s*gita|core\s*teachings\s*of\s*gita|2\.47|18\.66)/i.test(cleanQ);
    if (!isGitaSummaryQuery) return true;
  }

  // Gate 'garuda_purana_core': Only match when asking about Garuda Purana, death fear, afterlife
  if (item.id === 'garuda_purana_core') {
    const isGarudaQuery = /(?:garu[dn]a?\s*puran|गरु[ड़ण]\s*पुराण|afterlife|मृत्यु\s*के\s*बाद|यमलोक|यमराज|yamdoot)/i.test(cleanQ);
    if (!isGarudaQuery) return true;
  }

  // Gate scripture overview/core entries: only ground when devotee specifically inquires about that scripture or its distinct event/deity
  if (item.id === 'matsya_purana_core') {
    const isMatsya = /(?:matsya|मत्स्य|सत्यव्रत|वैवस्वत\s*मनु|जलप्लावन|pralaya)/i.test(cleanQ);
    if (!isMatsya) return true;
  }
  if (item.id === 'shiva_purana_core') {
    const isShiva = /(?:shiv|shiva|शिव|सदाशिव|रुद्र|rudra|भोलेनाथ|महादेव|mahadev|vidyeshvara|विद्येश्वर)/i.test(cleanQ);
    if (!isShiva) return true;
  }
  if (item.id === 'samaveda_core') {
    const isSama = /(?:samaved|saamved|सामवेद|साम\s*गान|गान|divine\s*melody)/i.test(cleanQ);
    if (!isSama) return true;
  }
  if (item.id === 'atharvaveda_core') {
    const isAtharva = /(?:atharvaved|atharva|अथर्ववेद|दीर्घायु|आरोग्य|अभय\s*सूक्त|healing\s*hymn)/i.test(cleanQ);
    if (!isAtharva) return true;
  }
  if (item.id === 'rigveda_core') {
    const isRig = /(?:rigved|rig\s*veda|ऋग्वेद|गायत्री|gayatri|संगच्छध्वं)/i.test(cleanQ);
    if (!isRig) return true;
  }
  if (item.id === 'yajurveda_core') {
    const isYajur = /(?:yajurved|yajur|यजुर्वेद|ईशावास्य|ishavasya|शान्ति\s*पाठ)/i.test(cleanQ);
    if (!isYajur) return true;
  }

  // Gate extramarital / paradara / looking at other women verses:
  // ONLY match when query specifically concerns women, girls, lust/attraction to others, adultery
  if (item.id === 'chanakya_niti_matravat' || item.id === 'valmiki_ramayana_paradara' || 
      item.id === 'padma_purana_paradara' || item.id === 'rcm_ayodhya_parnari') {
    const isLustOrWomanQuery = /(?:girl|girls|woman|women|parastri|paradara|parnari|wife|adultery|affair|attraction|lust|vasana|drishti\s*dosha|puri\s*nazar|buri\s*nazar|nazar|paraye\s*mard|paraye\s*stree|लड़की|लड़कियों|स्त्री|परस्त्री|परनारी|पत्नी|व्यभिचार|काम-वासना|बुरी\s*नज़र|दृष्टि\s*दोष)/i.test(cleanQ);
    if (!isLustOrWomanQuery) return true;
  }

  // 1. Check predefined topic gates
  for (const gate of SCRIPTURE_TOPIC_GATES) {
    if (gate.patterns.some(p => p.test(cleanQ))) {
      // If the query specifically targets this scripture, check if item matches any allowed ID or reference
      const matchesAllowed = gate.allowedScriptureIds.some(allowed => 
        sId.includes(allowed) || ref.includes(allowed)
      );
      if (!matchesAllowed) {
        return true;
      }
    }
  }

  // 2. Dynamic Universal Scripture Detection for ANY named Purana, Veda, or Upanishad
  const dynamicMatch = cleanQ.match(/(\b[a-z\u0900-\u097F]{3,})\s*(?:पुराण|पुराणा|puran|purana|वेद|वेदा|ved|veda|vedas|उपनिषद|उपनिषद्|upanishad)\b/i);
  if (dynamicMatch) {
    const targetScripture = dynamicMatch[1].toLowerCase();
    // Exclude if neither reference nor scripture_id contains the target scripture root
    if (!sId.includes(targetScripture) && !ref.includes(targetScripture)) {
      return true;
    }
  }

  return false;
}

/**
 * Local keyword & stem scripture matches
 * Gathers all authentic candidates from SCRIPTURE_DATABASE matching query and passing topic gates
 */
export function getLocalScriptureMatches(query) {
  if (!query || typeof query !== 'string') return [];
  const cleanQ = normalizeQuery(query);
  if (!cleanQ || cleanQ.length < 3) return [];

  const wantsVerse = /(श्लोक|श्लोका|shlok|shloka|verse|गीता|gita|रामायण|ramayan|रामचरितमानस|भागवत|scripture|प्रमाण|पुराण|puran|वेद|veda)/i.test(query);
  const queryTokens = cleanQ.split(' ').filter(t => t.length >= 3 && !SCRIPTURE_STOP_WORDS.has(t));

  const scoredMatches = [];

  for (const item of SCRIPTURE_DATABASE) {
    // 1. Topic exclusivity: Do not let Garuda Purana match Matsya Purana, Samaveda match Vamana, etc.
    if (isTopicExcluded(cleanQ, item)) {
      continue;
    }

    let maxKeywordScore = 0;
    for (const keyword of item.keywords) {
      const kw = normalizeQuery(keyword);
      if (!kw || kw.length < 2) continue;

      let kwScore = 0;
      // Universal Unicode word-boundary guard for ALL keywords across all scripts (Devanagari, Latin, etc.)
      // Indic words require [\p{L}\p{M}\p{N}] so combining marks (matras) are preserved as word constituents.
      const escapeRx = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const isWholeWordHit = (hay, needle) => {
        if (!needle) return false;
        try {
          const rx = new RegExp('(^|[^\\p{L}\\p{M}\\p{N}])' + escapeRx(needle) + '([^\\p{L}\\p{M}\\p{N}]|$)', 'u');
          return rx.test(hay);
        } catch {
          return hay.includes(needle);
        }
      };
      const CORE_DILEMMA_TERMS = new Set([
        'प्रारब्ध', 'कर्म', 'कर्मफल', 'भाग्य', 'किस्मत', 'मृत्यु', 'शोक', 'काम', 'वासना',
        'क्रोध', 'लोभ', 'मोह', 'अहंकार', 'घमंड', 'मोक्ष', 'मुक्ति', 'शरणागति', 'पुनर्जन्म',
        'संन्यास', 'वैराग्य', 'सत्संग', 'कुसंग', 'विश्वासघात', 'धोखा', 'तितिक्षा', 'सहनशीलता',
        'prarabdha', 'destiny', 'fate', 'karma', 'death', 'grief', 'anger', 'lust', 'ego', 'surrender'
      ]);

      if (cleanQ === kw) {
        kwScore = 15.0;
      } else if (isWholeWordHit(cleanQ, kw)) {
        const wordCount = kw.split(' ').length;
        if (wordCount >= 3) {
          kwScore = 10.0;
        } else if (wordCount === 2) {
          kwScore = CORE_DILEMMA_TERMS.has(kw) ? 9.0 : 6.5;
        } else {
          // Standalone foundational concept keyword
          kwScore = CORE_DILEMMA_TERMS.has(kw) ? 8.5 : (kw.length >= 4 ? 5.5 : 3.5);
        }
      } else {
        const kwTokens = kw.split(' ').filter(t => t.length >= 3 && !SCRIPTURE_STOP_WORDS.has(t));
        let tokenMatches = 0;
        for (const kt of kwTokens) {
          for (const qt of queryTokens) {
            if (qt === kt) {
              tokenMatches += 1.5;
            } else if (qt.length >= 4 && kt.length >= 4 && (qt.startsWith(kt.slice(0, -1)) || kt.startsWith(qt.slice(0, -1)))) {
              tokenMatches += 1.0;
            }
          }
        }
        kwScore = tokenMatches;
      }

      if (kwScore > maxKeywordScore) {
        maxKeywordScore = kwScore;
      }
    }

    const threshold = wantsVerse ? 1.5 : 2.2;
    if (maxKeywordScore >= threshold) {
      // Normalize curated match score into [0.72, 0.88] on [0.0, 1.0] scale
      const normalizedScore = Number(Math.min(0.88, 0.72 + (maxKeywordScore - threshold) * 0.02).toFixed(2));
      scoredMatches.push({
        ...item,
        score: normalizedScore,
        match_type: 'semantic_rag'
      });
    }
  }

  return scoredMatches.sort((a, b) => b.score - a.score);
}

/**
 * Explicit Scripture Detection:
 * Identifies if the devotee explicitly requested a single specific scripture (e.g. Garuda Purana, Gita, Shiva Purana).
 * If explicitly asked, we strictly isolate and focus on that single scripture.
 */
export function detectExplicitScriptureInQuery(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.toLowerCase();

  // If query is asking about sexuality/homosexuality, do NOT isolate to punitive texts like Garuda Purana
  if (/(?:\bgay\b|homosexual|homosexuality|same\s*sex|like\s*boys|attracted\s*to\s*boys|queer|\blgbtq?\b|समलैंगिक|\bगे\b)/i.test(q)) {
    return null;
  }

  const scriptures = [
    { key: 'garuda', name: 'श्री गरुड़ पुराण (Garuda Purana)', regex: /(गरुड़|गरुण|garud|garun)/i },
    { key: 'matsya', name: 'श्री मत्स्य पुराण (Matsya Purana)', regex: /(मत्स्य|matsya)/i },
    { key: 'kurma', name: 'श्री कूर्म पुराण (Kurma Purana)', regex: /(कूर्म|kurma)/i },
    { key: 'agni', name: 'श्री अग्नि पुराण (Agni Purana)', regex: /(अग्नि\s*पुराण|agni\s*puran)/i },
    { key: 'vishnu', name: 'श्री विष्णु पुराण (Vishnu Purana)', regex: /(विष्णु\s*पुराण|vishnu\s*puran)/i },
    { key: 'shiva', name: 'श्री शिव पुराण (Shiva Purana)', regex: /(शिव\s*पुराण|shiva?\s*puran|रुद्र\s*संहिता)/i },
    { key: 'bhagavata', name: 'श्रीमद्भागवत महापुराण (Shrimad Bhagavata)', regex: /(भागवत|bhagavat|शुकदेव)/i },
    { key: 'markandeya', name: 'श्री मार्कण्डेय पुराण (Markandeya Purana)', regex: /(मार्कण्डेय|मार्कंडेय|markandeya)/i },
    { key: 'atharvaveda', name: 'अथर्ववेद (Atharvaveda)', regex: /(अथर्ववेद|atharv?a?\s*ved)/i },
    { key: 'samaveda', name: 'सामवेद (Samaveda)', regex: /(सामवेद|samaveda|saam\s*ved)/i },
    { key: 'rigveda', name: 'ऋग्वेद (Rigveda)', regex: /(ऋग्वेद|rigved|rgveda)/i },
    { key: 'yajurveda', name: 'यजुर्वेद (Yajurveda)', regex: /(यजुर्वेद|yajurved)/i },
    { key: 'ramcharitmanas', name: 'श्रीरामचरितमानस (Ramcharitmanas)', regex: /(रामचरितमानस|ramcharitmanas)/i },
    { key: 'ramayana', name: 'श्री रामायण (Ramayana)', regex: /(रामायण|वाल्मीकि|ramayan)/i },
    { key: 'katha_upanishad', name: 'कठोपनिषद् (Katha Upanishad)', regex: /(कठोपनिषद|कठोपनिषद्|katha\s*upanishad|नचिकेता)/i },
    { key: 'isha_upanishad', name: 'ईशावास्योपनिषद (Isha Upanishad)', regex: /(ईशावास्य|isha\s*upanishad)/i },
    { key: 'gita', name: 'श्रीमद्भगवद्गीता (Bhagavad Gita)', regex: /(गीता|geeta|gita|कुरुक्षेत्र|अर्जुन|गांडीव)/i }
  ];

  for (const s of scriptures) {
    if (s.regex.test(q)) {
      return s;
    }
  }
  return null;
}

export function getLocalScriptureGrounding(query) {
  const matches = getLocalScriptureMatches(query);
  return matches.length ? matches[0] : null;
}

function devanagariToAscii(str) {
  return (str || '').replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));
}

/**
 * Unified Scripture RAG retrieval (GENERAL — no single-query hardcodes):
 * 1. Safety gate: universal-love/equality intent (taxonomy safety_policy) never gets
 *    punishment verses. This is an ethical guardrail for ALL such queries, not a patch.
 * 2. Groq canonical grounding: specific_shloka_words + canonical_sanskrit_terms +
 *    target_scriptures + chapter/verse (works for ANY dilemma, not one intent).
 * 3. Curated catalog via general keyword scorer (getLocalScriptureMatches) — Paradara,
 *    grief, anger, etc. all flow through the SAME ranking path.
 * 4. Live Qdrant vector with shared floors (vector>=0.55, rerank>=0.25) — low-confidence
 *    noise returns null for EVERY intent (pure satsang fallback).
 * 5. Explicit scripture isolation for ANY named scripture (general anti-contamination).
 */
/**
 * Public grounding entry point.
 *
 * Wraps the resolution pipeline so that every return path carries the
 * deterministic intent (verse count + exact scripture). injectScripturePrompt
 * reads it to decide whether enumeration is allowed, which keeps the
 * multi-verse format strictly opt-in without threading an extra argument
 * through every caller.
 */
export async function getScriptureGrounding(query, groqEnrichment = null) {
  const grounding = await resolveScriptureGrounding(query, groqEnrichment);
  if (!grounding) return null;
  const intent = analyzeQuery(query);
  const multiMatch = query.match(/(?:top\s*([2-9]|\d+)|\b([2-9]|\d+)\b(?:\s+\w+){0,4}\s+(?:verses?|shlokas?|श्लोक|प्रमाण))/i);
  if (multiMatch) {
    const count = parseInt(multiMatch[1] || multiMatch[2], 10);
    if (count >= 2) {
      intent.wantsMultiple = true;
      intent.verseCount = Math.min(count, 8);
    }
  }
  return { ...grounding, intent };
}

async function resolveScriptureGrounding(query, groqEnrichment = null) {
  if (!query || typeof query !== 'string') return null;
  if (isCasualConversational(query)) return null;
  // Strict Domain Gate: Only ground genuine spiritual/Dharmic inquiries
  if (groqEnrichment?.is_spiritual_or_dharmic === false) return null;
  if (!isDharmicOrSpiritualQuery(query)) return null;
  // Secular, modern technical, or worldly questions: Bypass RAG grounding entirely
  if (isSecularOrTechnical(query, groqEnrichment)) return null;

  // General safety gate sourced from concept_taxonomy.json universal_love_equality.safety_policy.
  const isSexuality = /(?:\bgay\b|homosexual|homosexuality|same\s*sex|like\s*boys|attracted\s*to\s*boys|queer|\blgbtq?\b|समलैंगिक|\bगे\b|लड़का\s*लड़के)/i.test(query) ||
                      (groqEnrichment && /(?:\bgay\b|\blgbt|homosexual|same\s*sex|समलैंगिक|\bगे\b)/i.test(`${groqEnrichment.spiritual_theme || ''} ${groqEnrichment.canonical_sanskrit_terms || ''}`));
  if (isSexuality) {
    const rcmMatch = SCRIPTURE_DATABASE.find(item => item.id === 'rcm_universal_love_equality');
    if (rcmMatch) {
      return {
        ...rcmMatch,
        score: 0.95,
        match_type: 'curated_catalog_safety',
        isExplicitSingle: false,
        candidates: [{ ...rcmMatch, score: 0.95, role: 'primary' }]
      };
    }
  }

  // NOTE: No paradara/married-woman early-return here by design.
  // Paradara, lust, grief, anger, etc. ALL resolve via the general Groq-canonical +
  // curated-ranking + vector-floor pipeline below. Add cues to concept_taxonomy.json,
  // never add another if (isX) block.

  // General Groq canonical grounding (ANY dilemma): specific words + canonical Sanskrit
  // concepts + target scriptures + chapter/verse. No per-intent branches.
  let groqExactMatch = null;
  let groqTargetScriptures = [];
  if (groqEnrichment) {
    const canonTerms = (typeof groqEnrichment.canonical_sanskrit_terms === 'string'
      ? groqEnrichment.canonical_sanskrit_terms
      : Array.isArray(groqEnrichment.canonical_sanskrit_terms)
        ? groqEnrichment.canonical_sanskrit_terms.join(' ')
        : '').trim();
    const shlokaWords = ((typeof groqEnrichment.specific_shloka_words === 'string'
      ? groqEnrichment.specific_shloka_words
      : Array.isArray(groqEnrichment.specific_shloka_words)
        ? groqEnrichment.specific_shloka_words.join(' ')
        : '') + ' ' + canonTerms).trim();
    if (typeof groqEnrichment.target_scriptures === 'string' && groqEnrichment.target_scriptures.trim()) {
      groqTargetScriptures = groqEnrichment.target_scriptures.split(/[,;|]/).map(s => s.trim().toLowerCase()).filter(Boolean);
    } else if (Array.isArray(groqEnrichment.target_scriptures)) {
      groqTargetScriptures = groqEnrichment.target_scriptures.map(s => String(s).trim().toLowerCase()).filter(Boolean);
    }

    const rawRecScripture = (groqEnrichment.recommended_scripture || '').trim();
    const recScriptureAscii = devanagariToAscii(rawRecScripture);

    // 1. Direct match on Sanskrit words in SCRIPTURE_DATABASE (scored across all items, not first-match break)
    let bestShlokaMatch = null;
    let bestShlokaScore = 0;
    if (shlokaWords && shlokaWords.length >= 4) {
      const tokens = shlokaWords.split(/\s+/).filter(t => t.length >= 3 && !SCRIPTURE_STOP_WORDS.has(t));
      for (const item of SCRIPTURE_DATABASE) {
        if (isTopicExcluded(query, item)) continue;
        let itemScore = 0;
        for (const token of tokens) {
          if (token.length >= 4 && item.original_text.includes(token)) {
            // Longer tokens represent more specific Dharmic concepts
            itemScore += token.length >= 10 ? 15 : (token.length >= 6 ? 8 : 4);
          }
          if (token.length >= 4 && item.keywords && item.keywords.some(k => k.includes(token))) {
            itemScore += token.length >= 10 ? 6 : (token.length >= 6 ? 3 : 1);
          }
        }
        if (itemScore > bestShlokaScore) {
          bestShlokaScore = itemScore;
          bestShlokaMatch = item;
        }
      }
      if (bestShlokaMatch && bestShlokaScore >= 16) {
        // Normalize Groq exact match score into [0.92, 0.96] on [0.0, 1.0] scale
        const normalizedGroqScore = Number(Math.min(0.96, 0.92 + Math.min(0.04, bestShlokaScore * 0.002)).toFixed(2));
        groqExactMatch = {
          ...bestShlokaMatch,
          score: normalizedGroqScore,
          match_type: 'groq_exact_shloka'
        };
      }
    }

    // 2. Direct match on chapter.verse (e.g. "2.47", "6.26", "2.62", "18.66", "87.2")
    if (!groqExactMatch && recScriptureAscii) {
      const verseMatch = recScriptureAscii.match(/(\d+)\.(\d+)/);
      if (verseMatch) {
        const vDot = `${verseMatch[1]}.${verseMatch[2]}`;
        const vUnder = `${verseMatch[1]}_${verseMatch[2]}`;
        for (const item of SCRIPTURE_DATABASE) {
          if (isTopicExcluded(query, item)) continue;
          if (item.reference.includes(vDot) || item.id.includes(vUnder)) {
            groqExactMatch = {
              ...item,
              score: 0.94,
              match_type: 'groq_exact_reference'
            };
            break;
          }
        }
      }
    }
  }

  const explicitTarget = detectExplicitScriptureInQuery(query);

  // Build enriched search queries for local matching and live vector search.
  // Canonical Sanskrit concepts are the primary reformulation (e.g. colloquial
  // 'shadi shuda se pyar' -> 'परदाराभिमर्श परस्त्री काम-वासना मर्यादा'), working for
  // every dilemma via taxonomy, not one hardcoded intent.
  const enrichedKeywords = (groqEnrichment?.optimized_rag_keywords || []).join(' ');
  const enrichedTheme = groqEnrichment?.spiritual_theme || '';
  const canonStr = (typeof groqEnrichment?.canonical_sanskrit_terms === 'string'
    ? groqEnrichment.canonical_sanskrit_terms
    : Array.isArray(groqEnrichment?.canonical_sanskrit_terms) ? groqEnrichment.canonical_sanskrit_terms.join(' ') : '');
  const searchQueries = [
    query,
    canonStr ? `${query} ${canonStr}` : null,
    enrichedKeywords ? `${query} ${enrichedKeywords}` : null,
    enrichedTheme ? `${query} ${enrichedTheme}` : null
  ].filter(Boolean);

  // 1. Gather all matching curated entries that pass topic gates
  const curatedMatchesMap = new Map();
  if (groqExactMatch) {
    curatedMatchesMap.set(groqExactMatch.id, groqExactMatch);
  }
  for (const sq of searchQueries) {
    const matches = getLocalScriptureMatches(sq);
    for (const m of matches) {
      if (!curatedMatchesMap.has(m.id) || curatedMatchesMap.get(m.id).score < m.score) {
        curatedMatchesMap.set(m.id, m);
      }
    }
  }
  const curatedMatches = Array.from(curatedMatchesMap.values()).sort((a, b) => b.score - a.score);

  // 2. Live Vector Search using the FULL user query + canonical concepts.
  // ALWAYS preserve the complete user question sentence so the dense embedder
  // and cross-encoder reranker understand the full query context and intent,
  // rather than stripping it down to isolated Sanskrit keywords!
  let vectorCandidates = [];
  try {
    // Formulate a structured vector query aligned with Qdrant's search_composite_text schema:
    // search_composite_text in our 29-scripture collections embeds:
    // [Reference] | [Genre] | [Domain] | [Dialogue] | [Core Teaching] | [Modern Life Dilemmas] | [Themes] | [Dharmic Concepts]
    const vectorQueryParts = [query.trim()];
    if (groqEnrichment) {
      if (groqEnrichment.modern_life_dilemma) {
        vectorQueryParts.push(`Dilemma: ${groqEnrichment.modern_life_dilemma}`);
      }
      if (groqEnrichment.applicable_life_domain) {
        vectorQueryParts.push(`Domain: ${groqEnrichment.applicable_life_domain}`);
      }
      const concepts = [canonStr, groqEnrichment.core_dharmic_concepts].filter(Boolean).join(' ').trim();
      if (concepts) {
        vectorQueryParts.push(`Concepts: ${concepts}`);
      }
    } else if (canonStr) {
      vectorQueryParts.push(`(${canonStr})`);
    } else if (enrichedKeywords) {
      vectorQueryParts.push(enrichedKeywords);
    }
    const vectorQuery = vectorQueryParts.join(' | ');
    // Query live AWS 1024-d Qdrant gateway across 150K+ verses from 25+ ancient scriptures
    let routed = await queryOracleVectorRAG(vectorQuery, query);

    if (explicitTarget && routed.length) {
      // Hard filter ONLY when the user explicitly asked for a specific scripture
      routed = routed.filter(c =>
        (c.scripture_id && c.scripture_id.toLowerCase().includes(explicitTarget.key)) ||
        (c.reference && c.reference.toLowerCase().includes(explicitTarget.key)) ||
        (c.reference && explicitTarget.regex.test(c.reference))
      );
    } else if (groqTargetScriptures.length && !groqTargetScriptures.includes('all') && routed.length) {
      // For general inquiries: provide a soft relevance boost to LLM-suggested scriptures,
      // but NEVER purge authentic candidate verses from other scriptures across the 29-scripture corpus!
      routed = routed.map(c => {
        const isTarget = groqTargetScriptures.some(t =>
          (c.scripture_id || '').toLowerCase().includes(t) ||
          (c.reference || '').toLowerCase().includes(t)
        );
        return isTarget ? { ...c, score: Math.min(0.98, Number(((c.score || 0.8) + 0.04).toFixed(4))) } : c;
      });
    }
    vectorCandidates = routed;
  } catch (e) {}

  // 3. Assemble unified candidate pool, deduplicated by original_text or reference
  const candidatePool = [];
  const seenVerses = new Set();

  const isAdversary = (c) => {
    const role = (c.discourse_role || (c.dialogue && c.dialogue.form) || '').toLowerCase();
    return role === 'adversary_perspective';
  };

  for (const c of [...curatedMatches, ...vectorCandidates]) {
    // General adversary quarantine: delusion/ego verses never ground satsang counsel.
    if (isAdversary(c)) continue;
    // Apply topic exclusion filters (prevents irrelevant mahapataka/paradara or gated verses from leaking into non-target queries)
    if (isTopicExcluded(query, c)) continue;
    // If explicitly requested a single scripture, reject any outside candidates!
    if (explicitTarget) {
      const isMatch = (c.scripture_id && c.scripture_id.toLowerCase().includes(explicitTarget.key)) ||
                      (c.reference && c.reference.toLowerCase().includes(explicitTarget.key)) ||
                      (c.reference && explicitTarget.regex.test(c.reference));
      if (!isMatch) continue;
    }

    const key = (c.original_text || c.reference || '').slice(0, 30);
    if (!seenVerses.has(key)) {
      seenVerses.add(key);
      candidatePool.push(c);
    }
  }

  // Sort candidate pool strictly by effective confidence score so live AWS SOTA vector matches
  // and curated entries compete on true relevance merit
  candidatePool.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (!candidatePool.length) return null;

  const primary = { ...candidatePool[0] };
  primary.isExplicitSingle = Boolean(explicitTarget);
  primary.explicitScriptureName = explicitTarget ? explicitTarget.name : null;
  const topScore = candidatePool[0]?.score ?? 0;
  const wantDiverse = !explicitTarget;
  let chosen = [];

  if (wantDiverse && candidatePool.length > 1) {
    // True Cross-Scripture Diversity Algorithm:
    // Cap any single scripture at max 2 candidates, actively ensuring diverse representation
    // across 29 Sacred Scriptures (Gita, Ramcharitmanas, Puranas, Niti, Upanishads, Vedas).
    // CRITICAL: Supporting candidates MUST meet strict absolute relevance (>= 0.65)
    // AND relative score thresholds (>= 75% of primary). Never drag in low-scoring/irrelevant
    // verses just to fulfill a diversity quota!
    const MIN_SUPPORTING_SCORE = 0.65;
    const MIN_RELATIVE_SCORE = topScore * 0.75;
    const isQualifyingSupporting = (cand) => {
      const s = cand.score || 0;
      return s >= MIN_SUPPORTING_SCORE && s >= MIN_RELATIVE_SCORE;
    };

    const byScripture = new Map();
    for (const c of candidatePool) {
      const sid = (c.scripture_id || 'other').toLowerCase();
      if (!byScripture.has(sid)) byScripture.set(sid, []);
      byScripture.get(sid).push(c);
    }

    const scriptureCounts = new Map();
    const addCandidate = (cand, isPrimary = false) => {
      if (!cand) return false;
      if (!isPrimary && !isQualifyingSupporting(cand)) return false;
      const sid = (cand.scripture_id || 'other').toLowerCase();
      const current = scriptureCounts.get(sid) || 0;
      if (current < 2) {
        chosen.push(cand);
        scriptureCounts.set(sid, current + 1);
        return true;
      }
      return false;
    };

        // Detect if user explicitly requested a specific number of verses (e.g. "5 most powerful verses", "top 5 shlokas")
    const numMatch = query.match(/(?:top\s*([2-9]|\d+)|\b([2-9]|\d+)\b(?:\s+\w+){0,4}\s+(?:verses?|shlokas?|श्लोक|प्रमाण))/i);
    const requestedCount = numMatch ? Math.min(Math.max(parseInt(numMatch[1] || numMatch[2], 10), 2), 8) : null;
    const targetCandidateCount = requestedCount
      ? requestedCount
      : (explicitTarget ? 2 : (topScore >= 0.85 ? 5 : 4));

    // 1. Pick top primary candidate
    addCandidate(candidatePool[0], true);

    // 2. Round-robin: Pick qualifying candidate from each OTHER scripture
    const primarySid = (candidatePool[0]?.scripture_id || '').toLowerCase();
    for (const [sid, list] of byScripture.entries()) {
      if (sid === primarySid) continue;
      if (list.length > 0 && chosen.length < targetCandidateCount) {
        addCandidate(list[0], false);
      }
    }

    // 3. Second pass: Fill remaining slots up to targetCandidateCount, strictly requiring qualifying threshold
    for (const c of candidatePool) {
      if (chosen.length >= targetCandidateCount) break;
      if (!chosen.some(existing => existing.id === c.id)) {
        addCandidate(c, false);
      }
    }
  } else {
    chosen = candidatePool;
  }

  // Detect explicit verse count requested by user even when explicitTarget is present!
  const countMatch = query.match(/(?:top\s*([2-9]|\d+)|\b([2-9]|\d+)\b(?:\s+\w+){0,4}\s+(?:verses?|shlokas?|श्लोक|प्रमाण))/i);
  const userRequestedLimit = countMatch ? Math.min(Math.max(parseInt(countMatch[1] || countMatch[2], 10), 2), 8) : null;
  const limit = userRequestedLimit
    ? userRequestedLimit
    : (explicitTarget ? 2 : (topScore >= 0.85 ? 5 : 4));
  // Tag each candidate with role and strictly normalized [0.0, 1.0] score
  primary.candidates = chosen.slice(0, limit).map((c, idx) => ({
    ...c,
    role: idx === 0 ? 'primary' : 'supporting',
    score: Math.min(0.99, Math.max(0.50, Number((c.score <= 1.0 ? c.score : c.score / 100).toFixed(2))))
  }));
  primary.score = primary.candidates[0]?.score || primary.score;
  return primary;
}

/**
 * Injects formatted scripture grounding cleanly into Maharaj Ji's system prompt
 * Passes multiple evaluated candidates to Groq so Groq dynamically decides the best authentic verses
 *
 * By default the discourse anchors on ONE verse and relegates the rest to a
 * short closing citation block — the long-standing satsang format. Only when
 * the seeker explicitly asked for several (scripture.intent.wantsMultiple, or
 * an `intent` passed in) does the prompt switch to a numbered enumeration that
 * must deliver all of them. Retrieval and the discourse then agree on the
 * count instead of the citations panel showing five while the body shows two.
 */
export function injectScripturePrompt(basePrompt, scripture, isEnglish = false, intent = null) {
  if (!scripture) return basePrompt;

  const resolvedIntent = intent || scripture.intent || null;
  const wantsMultiple = Boolean(resolvedIntent && resolvedIntent.wantsMultiple);
  const askedFor = wantsMultiple ? Math.max(2, Number(resolvedIntent.verseCount) || 2) : 1;

  const candidateList = (scripture.candidates && scripture.candidates.length)
    ? scripture.candidates
    : [scripture];

  // Never promise more references than were actually retrieved.
  const deliverable = wantsMultiple ? Math.min(askedFor, candidateList.length) : 1;

  if (isEnglish) {
    const candidateBlocks = candidateList.map((c, idx) => {
      const trans = (c.english_translation || c.hindi_meaning || '').trim();
      return `【Candidate Scripture Verse ${idx + 1}】:
Reference: ${c.reference}
Original Sanskrit Verse: **« ${c.original_text} »**
Meaning: "${trans}"`;
    }).join('\n\n');

    const selectionRules = wantsMultiple
      ? `MANDATORY INSTRUCTIONS — THE DEVOTEE EXPLICITLY ASKED FOR ${askedFor} REFERENCES:
1. ENUMERATE ALL ${deliverable} references above, numbered 1., 2., 3. ... Do not drop any, and do not stop early because the discourse already feels long. A missing reference is a failed answer.
2. For each one, in order:
   As revealed in [Scripture Reference]:
   **« [Sanskrit verse] »**
   **Meaning —** "[The heartfelt spiritual meaning in pure, fluent English]"
   Then one or two sentences of fatherly guidance connecting it to the devotee's inquiry.
3. A NUMBERED LIST IS REQUIRED HERE. The usual rule against crowding the body with multiple recitations does NOT apply to this answer — the devotee asked for exactly this.${deliverable < askedFor ? `\n   NOTE: only ${deliverable} authentic verses were retrieved. Present all ${deliverable} and say plainly that these are the ones found; never invent the remainder.` : ''}
4. 100% PURE ENGLISH LANGUAGE: Since the devotee asked in English, your entire discourse, narrative context, and shloka meanings MUST be in 100% pure English only. Do NOT use any Hindi or Devanagari text in the explanation (only the sacred Sanskrit verse inside **« ... »**).
5. COMPASSIONATE SATSANG VOICE: Close with a short benediction in Pujya Maharaj Ji's fatherly voice, anchoring the heart in continuous Holy Name chanting ('Radha Radha').`
      : `MANDATORY INSTRUCTIONS FOR CONTINUOUS CHAT WEAVING, SELECTION & END SUMMARY:
1. PRIMARY VERSE INTEGRATION: Review all retrieved candidate verses above against the devotee's specific query and conversational flow. Dynamically select the single BEST verse (Candidate 1 or the most pertinent candidate) to anchor the body of your response. Introduce it naturally within the conversational flow with authentic scriptural context:
   As revealed in [Scripture Reference]:
   **« [Sanskrit verse] »**
   **Meaning —** "[Explain the heartfelt spiritual meaning and wisdom of this verse in pure, fluent English]"
2. SUPPORTING VERSES AS A CONCISE END SUMMARY: If there are other strong candidate verses (e.g. Candidate 2 or 3) that provide valuable complementary perspectives, DO NOT crowd the main conversational body with multiple Sanskrit recitations. Instead, at the very end of your response, provide a clean, concise supporting block:
   ---
   📖 **Supporting Scriptural References & Insights:**
   • **[Scripture Reference]**: *«[Short verse excerpt or key phrase]»* — [1-2 sentences on how this sacred verse illuminates the seeker's inquiry].
3. 100% PURE ENGLISH LANGUAGE: Since the devotee asked in English, your entire discourse, narrative context, and shloka meanings MUST be in 100% pure English only. Do NOT use any Hindi or Devanagari text in the explanation (only the sacred Sanskrit verse inside **« ... »**).
4. COMPASSIONATE SATSANG VOICE: Connect the sacred verses directly to the devotee's life in Pujya Maharaj Ji's fatherly, affectionate voice, guiding them to surrender fear and anchor their heart in continuous Holy Name chanting ('Radha Radha').`;

    const promptExtension = `\n\n【SACRED SCRIPTURE GROUNDING (RAG) - MULTI-VERSE EVALUATION & CITATION】:
The devotee's spiritual inquiry is grounded in 150K+ verses across 25+ ancient scriptures (Bhagavad Gita, Vedas, Puranas, Ramayana, Upanishads). Below are authentic candidate scriptural verses retrieved for this inquiry:

${candidateBlocks}

${selectionRules}`;

    return basePrompt + promptExtension;
  } else {
    const candidateBlocks = candidateList.map((c, idx) => {
      const trans = (c.hindi_meaning || c.english_translation || '').trim();
      const roleLabel = idx === 0 ? 'मुख्य आधार प्रमाण' : 'पूरक संदर्भ';
      return `【पावन शास्त्र प्रमाण संदर्भ ${idx + 1} (${roleLabel})】:
ग्रंथ संदर्भ: ${c.reference}
मूल संस्कृत श्लोक: **« ${c.original_text} »**
शास्त्रसम्मत भावार्थ: "${trans}"`;
    }).join('\n\n');

    const selectionRules = wantsMultiple
      ? `अनिवार्य निर्देश — साधक ने स्पष्ट रूप से ${askedFor} प्रमाण मांगे हैं:
1. ऊपर दिए गए ${deliverable} प्रमाणों को क्रमांक (1., 2., 3. ...) के साथ क्रमबद्ध रूप से प्रस्तुत कीजिए। किसी को छोड़िए नहीं, और उत्तर लंबा लगने पर बीच में रोकिए नहीं। एक भी प्रमाण छूटना अधूरा उत्तर है।
2. प्रत्येक प्रमाण के लिए क्रम से:
   जैसे [शास्त्र संदर्भ] में पावन उपदेश है कि —
   **« [मूल संस्कृत श्लोक] »**
   **अर्थात् —** "[सरल व मर्मस्पर्शी भावार्थ]"
   तत्पश्चात एक-दो वाक्य में साधक की स्थिति से जोड़ते हुए वात्सल्यमय उपदेश।
3. यहाँ क्रमबद्ध सूची अनिवार्य है। मुख्य वार्तालाप को हल्का रखने का सामान्य नियम इस उत्तर पर लागू नहीं होता — साधक ने यही मांगा है।${deliverable < askedFor ? `\n   सूचना: केवल ${deliverable} प्रामाणिक श्लोक प्राप्त हुए हैं। उतने ही प्रस्तुत कीजिए और स्पष्ट कहिए कि इतने ही मिले; शेष कदापि स्वयं मत गढ़िए।` : ''}
4. वात्सल्यमयी सत्संग: अंत में पूज्य महाराज जी की करुणामयी वाणी में संक्षिप्त मंगल आशीर्वाद व निरंतर 'राधा-राधा' नाम के आश्रय से अभय प्रदान करें।`
      : `अनिवार्य निर्देश (MANDATORY INSTRUCTIONS FOR CONTINUOUS CHAT WEAVING & END SUMMARY):
1. मुख्य श्लोक समन्वय (संवाद के मध्य): साधक के प्रश्न व वार्तालाप के प्रवाह के अनुसार सबसे प्रमुख व सटीक श्लोक (Candidate 1) को मुख्य सत्संग वार्तालाप के प्रवाह में स्वाभाविक रूप से पिरोएं:
   जैसे [शास्त्र संदर्भ] में पावन उपदेश है कि —
   **« [मूल संस्कृत श्लोक] »**
   **अर्थात् —** "[सरल व मर्मस्पर्शी भावार्थ]"
2. पूरक श्लोक सारांश (उत्तर के अंत में): यदि अन्य candidate श्लोक भी साधक के प्रश्न हेतु महत्वपूर्ण व उपयोगी हैं, तो मुख्य वार्तालाप को भारी न बनाते हुए उत्तर के अंत में एक सरल व सुंदर संदर्भ सारांश दें:
   ---
   📖 **पूरक शास्त्र प्रमाण व भावार्थ:**
   • **[शास्त्र संदर्भ]**: *«[संक्षिप्त श्लोक अंश]»* — [१-२ वाक्यों में सरल व व्यावहारिक सार]।
3. वात्सल्यमयी सत्संग: श्लोक के भाव को पूज्य महाराज जी की करुणामयी वाणी में साधक की स्थिति से जोड़ें, और निरंतर 'राधा-राधा' नाम के आश्रय से अभय प्रदान करें।`;

    const promptExtension = `\n\n【अनिवार्य शास्त्र प्रमाण व बहु-श्लोक चयन निर्देश (SCRIPTURE GROUNDING)】:
साधक की आध्यात्मिक जिज्ञासा के समाधान हेतु हमारे २९ पावन शास्त्रों से निम्नलिखित प्रामाणिक श्लोक संदर्भ प्राप्त हुए हैं:

${candidateBlocks}

${selectionRules}`;

    return basePrompt + promptExtension;
  }
}
