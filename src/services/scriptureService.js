/**
 * Scripture Grounding & RAG Retrieval Engine for Samvaad
 * Provides authentic, multi-lingual (Hindi, English, Hinglish, Telugu, Tamil, etc.)
 * scripture matching from Shrimad Bhagavad Gita, Shri Ramcharitmanas, and Srimad Bhagavatam.
 */

export const SCRIPTURE_DATABASE = [
  {
    id: 'gita_2_47',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.४७ (Bhagavad Gita 2.47)',
    original_text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    hindi_meaning: 'तुम्हारा अधिकार केवल निष्काम भाव से कर्म करने में है, उसके फलों में कभी नहीं। अतः कर्म के फल की वासना वाले मत बनो और न ही अकर्मण्यता (आलस्य या कर्म त्याग) में तुम्हारी आसक्ति हो।',
    english_translation: 'You have a right only to perform your prescribed duty, never to the fruits of action. Never let the fruits be your motive, nor be attached to inaction.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण कर्म-सिद्धांत समझाते हुए अर्जुन से कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna instructs Arjuna in the Shrimad Bhagavad Gita —',
    keywords: [
      // Hindi - Karma & Effort
      'मेहनत', 'परिश्रम', 'कड़ी मेहनत', 'सफलता नहीं', 'असफल', 'असफलता', 'फल', 'कर्म', 'कर्म का फल', 'प्रारब्ध', 'सफलता कब मिलेगी', 'मेहनत का फल', 'निराशा कर्म',
      // Hindi - Laziness, Inaction, Lack of zeal
      'आलस', 'आलस्य', 'सुस्ती', 'प्रमाद', 'काम करने का मन नहीं करता', 'अकर्म', 'अकर्मण्यता', 'मन नहीं लगता काम में', 'काम न करना',
      // English
      'hard work', 'working hard', 'work hard', 'no success', 'not getting success', 'failed', 'failure', 'results', 'fruits of action', 'effort', 'struggling', 'career', 'reward', 'appraisal', 'unsuccessful', 'laziness', 'lazy', 'procrastination', 'lethargy', 'inaction', 'lack of motivation', 'demotivated',
      // Telugu
      'కష్టపడి', 'కష్టం', 'పనిచేస్తున్నాను', 'విజయం', 'విజయము', 'ఫలితం', 'సఫలత', 'ఓటమి', 'కష్టానికి ప్రతిఫలం', 'విజయ సాధన', 'బద్ధకం', 'సోమరితనం',
      // Hinglish
      'mehnat kar raha hu', 'safalta nahi mil rahi', 'fal nahi mil raha', 'hardwork', 'struggle', 'karm fal', 'alas', 'aalas', 'sustee'
    ]
  },
  {
    id: 'gita_3_8',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.८ (Bhagavad Gita 3.8)',
    original_text: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्धaddress ह्यकर्मणः॥',
    hindi_meaning: 'तुम अपने शास्त्रविहित कर्तव्य कर्म करो, क्योंकि कर्म न करने (आलस्य) की अपेक्षा कर्म करना श्रेष्ठ है। कर्म न करने से तो तुम्हारा शरीर-निर्वाह भी सिद्ध नहीं हो सकता।',
    english_translation: 'Perform your prescribed duty, for action is superior to inaction. Without work, even the basic sustenance of your physical body is impossible.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अकर्मण्यता व आलस्य का निवारण करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna dispels idleness and inaction in the Bhagavad Gita —',
    keywords: [
      'आलस कैसे छोड़ें', 'आलस दूर कैसे करें', 'सुस्ती दूर', 'कर्महीन', 'बैठे रहना', 'कोई काम न करना',
      'how to stop being lazy', 'overcome laziness', 'action over inaction', 'stop procrastinating', 'duty'
    ]
  },
  {
    id: 'gita_6_26_35',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ६.२६ व ६.३५ (Bhagavad Gita 6.26 & 6.35)',
    original_text: 'यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्। ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥ असं opensयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥',
    hindi_meaning: 'यह चंचल और अस्थिर मन जहाँ-जहाँ भटके, वहाँ-वहाँ से इसे रोककर बार-बार परमात्मा में ही स्थिर करना चाहिए। हे कौन्तेय! मन को वश में करना कठिन अवश्य है, किंतु निरंतर अभ्यास और वैराग्य से यह निश्चित ही वश में आ जाता है।',
    english_translation: 'From wherever the restless and unsteady mind wanders away, one should restrain it and bring it back under the control of the Self. Without doubt, the mind is restless and difficult to curb, but by persistent spiritual practice and detachment, it is subdued.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण चंचल मन को वश में करने की विधि बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals how to master the wandering mind in the Bhagavad Gita —',
    keywords: [
      'मन चंचल', 'मन भटकता', 'मन एकाग्र', 'मन नहीं लगता', 'मन कैसे लगाएं', 'ध्यान', 'मन की शांति', 'एकाग्रता', 'मन शांत कैसे करें',
      'restless mind', 'mind wandering', 'lack of concentration', 'focus', 'distracted', 'control mind', 'mind control', 'meditation',
      'చంచలమైన మనస్సు', 'మనస్సు ప్రశాంతత'
    ]
  },
  {
    id: 'gita_2_48',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.४८ (Bhagavad Gita 2.48)',
    original_text: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    hindi_meaning: 'हे धनंजय! आसक्ति को त्यागकर, सफलता और असफलता में समान भाव रखकर अपने कर्तव्य कर्म करो; यह समत्व भाव ही योग कहलाता है।',
    english_translation: 'Perform your duty with an equanimous mind, abandoning all attachment to success or failure. Such equanimity is called Yoga.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण निष्काम समत्व योग समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna explains the yoga of equanimity in the Bhagavad Gita —',
    keywords: [
      'समत्व', 'सुख-दुख', 'समान भाव', 'जीत हार', 'समभाव', 'संतुलन', 'हर्ष शोक',
      'equanimity', 'balance in failure', 'peace in defeat', 'success and failure', 'neutral mind',
      'సమభావం', 'సుఖదుఃఖాలు', 'సమత్వము'
    ]
  },
  {
    id: 'gita_2_62_63',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.६२-६३ (Bhagavad Gita 2.62-63)',
    original_text: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥ क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥',
    hindi_meaning: 'विषयों का निरंतर चिंतन करने से उनमें आसक्ति उत्पन्न होती है, आसक्ति से कामना और कामना में बाधा आने पर क्रोध उत्पन्न होता है। क्रोध से सम्मोह, सम्मोह से स्मृति भ्रम और स्मृति भ्रम से बुद्धि का नाश हो जाता है।',
    english_translation: 'While contemplating sense objects, attachment arises; from attachment desire is born, and from thwarted desire anger arises. From anger comes delusion, from delusion loss of memory, and from loss of memory destruction of intellect.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण काम व क्रोध की उत्पत्ति समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna warns against the perils of anger and desire in the Bhagavad Gita —',
    keywords: [
      'क्रोध', 'गुस्सा', 'क्रोध कैसे रोकें', 'काम वासना', 'मन भटकना', 'वासना', 'क्रोध शांत', 'गुस्से पर नियंत्रण',
      'anger', 'angry', 'control anger', 'temper', 'rage', 'lust', 'desire', 'distraction',
      'కోపం', 'శాంతి', 'కోపము', 'క్రోధము'
    ]
  },
  {
    id: 'gita_6_5',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ६.५ (Bhagavad Gita 6.5)',
    original_text: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    hindi_meaning: 'मनुष्य को अपने मन द्वारा अपना उद्धार करना चाहिए, स्वयं को कभी अवसाद (निराशा) में न गिराए; क्योंकि मन ही आत्मा का सच्चा मित्र है और असंयमित मन ही उसका सबसे बड़ा शत्रु है।',
    english_translation: 'Elevate yourself through the power of your mind, and do not degrade yourself. For the mind can be the greatest friend, and also the greatest enemy of the self.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण मन की शक्ति व आत्मोद्धार पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides on conquering the mind in the Bhagavad Gita —',
    keywords: [
      'अवसाद', 'निराशा', 'मन विचलित', 'डिप्रेशन', 'मन शांत नहीं', 'आत्मविश्वास', 'संदेह', 'हौसला',
      'depression', 'depressed', 'overcoming sadness', 'hopeless', 'self doubt', 'restless mind', 'control mind', 'mind is wandering',
      'లోపలి ఆవేదన', 'నిరాశ', 'మనస్సు', 'మనసు నిలకడ'
    ]
  },
  {
    id: 'gita_9_22',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ९.२२ (Bhagavad Gita 9.22)',
    original_text: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    hindi_meaning: 'जो अनन्य भाव से मेरा चिंतन करते हुए मेरी उपासना करते हैं, उन नित्य युक्त भक्तों के योग (अप्राप्त की प्राप्ति) और क्षेम (प्राप्त की रक्षा) का वहन मैं स्वयं करता हूँ।',
    english_translation: 'To those who always remember Me with undivided devotion, meditating on My transcendental form, to them I carry what they lack and preserve what they have.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अपने अनन्य भक्तों को परम आश्वासन देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna gives the supreme divine assurance in the Bhagavad Gita —',
    keywords: [
      'चिंता', 'भविष्य की चिंता', 'कौन रक्षा करेगा', 'अकेलापन', 'ईश्वर रक्षा', 'परेशानी', 'आर्थिक चिंता', 'सुरक्षा',
      'god will protect', 'anxiety about future', 'lonely', 'divine protection', 'financial worry', 'helpless', 'who will save me',
      'భయం', 'రక్షణ', 'ఆందోళన', 'భగవంతుని రక్షణ'
    ]
  },
  {
    id: 'gita_18_66',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १८.६६ (Bhagavad Gita 18.66)',
    original_text: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    hindi_meaning: 'संपूर्ण धर्मों और सांसारिक आश्रयों को त्यागकर केवल मेरी शरण में आ जाओ। मैं तुम्हें समस्त पापों से मुक्त कर दूंगा, तुम शोक मत करो।',
    english_translation: 'Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता के चरम उपदेश में भगवान श्रीकृष्ण शरणागति का पावन संदेश देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna proclaims the supreme message of surrender in the Bhagavad Gita —',
    keywords: [
      'शरणागति', 'शरण', 'पाप', 'मुक्ति', 'मोक्ष', 'पापों से मुक्ति', 'पछतावा', 'प्रभु कृपा', 'शोक', 'मुक्ति का मार्ग',
      'surrender', 'refuge', 'shelter', 'sins', 'guilt', 'forgiveness', 'liberation', 'do not grieve',
      'శరణాగతి', 'పాపాలు', 'విముక్తి', 'రక్షించు'
    ]
  },
  {
    id: 'rcm_ram_rachi_rakha',
    scripture_id: 'ramcharitmanas',
    reference: 'श्री रामचरितमानस (बालकाण्ड ५१ / अयोध्या काण्ड)',
    original_text: 'होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥',
    hindi_meaning: 'वही होता है जो प्रभु श्री राम ने पूर्व से रच रखा है। व्यर्थ के तर्क-वितर्क और चिंता से कुछ सिद्ध नहीं होता; प्रभु की मंगलमयी इच्छा को शिरोधार्य कर निरंतर भजन कीजिए।',
    english_translation: 'Whatever Lord Rama has ordained will surely come to pass. Why then multiply vain arguments and worries? Surrender to His divine will and chant His holy Name.',
    context_intro_hi: 'जैसे परम पावन श्री रामचरितमानस में भगवान शिव माता पार्वती जी से कहते हैं कि —',
    context_intro_en: 'Just as Lord Shiva reveals in the sacred Shri Ramcharitmanas —',
    keywords: [
      'प्रारब्ध', 'भाग्य', 'किस्मत', 'होनी', 'नियति', 'प्रभु इच्छा', 'चिंता क्यों', 'भाग्य में क्या है', 'जो भाग्य में होगा',
      'destiny', 'fate', 'gods will', 'acceptance', 'divine plan', 'why worry',
      'విధాత', 'ప్రారబ్ధం', 'దైవేచ్ఛ'
    ]
  },
  {
    id: 'rcm_naam_adhara',
    scripture_id: 'ramcharitmanas',
    reference: 'श्री रामचरितमानस (बालकाण्ड १०२)',
    original_text: 'कलयुग केवल नाम अधारा। सुमिरि सुमिरि नर उतरहिं पारा॥',
    hindi_meaning: 'कलियुग में कठिन योग, यज्ञ या भारी तप संभव नहीं हैं; केवल प्रभु का नाम ही एकमात्र सच्चा आधार है, जिसका निरंतर सुमिरन करने से जीव भवसागर से पार उतर जाता है।',
    english_translation: 'In the age of Kali, there is no other support than the Holy Name. By constantly chanting and remembering it, human beings cross the ocean of mundane existence.',
    context_intro_hi: 'जैसे परम पावन श्री रामचरितमानस में गोस्वामी तुलसीदास जी महाराज नाम महिमा प्रकट करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Goswami Tulsidas Ji proclaims in the sacred Shri Ramcharitmanas —',
    keywords: [
      'नाम जप', 'राधा नाम', 'कलियुग', 'नाम महिमा', 'राम नाम', 'जप कैसे करें', 'मंत्र', 'नाम की शक्ति', 'नाम स्मरण',
      'naam jap', 'radha radha', 'chanting', 'holy name', 'repetition of name', 'kaliyug',
      'నామ జపం', 'రాధా నామం'
    ]
  },
  {
    id: 'rcm_sanmukh_hoi',
    scripture_id: 'ramcharitmanas',
    reference: 'श्री रामचरितमानस (सुन्दरकाण्ड ४४)',
    original_text: 'सन्मुख होइ जीव मोहि जबहीं। जन्म कोटि अघ नासहिं तबहीं॥',
    hindi_meaning: 'जीव जब भी सच्चे हृदय से प्रभु के सन्मुख हो जाता है, उसके करोड़ों जन्मों के संचित पाप उसी क्षण नष्ट हो जाते हैं। प्रभु अहैतुकी कृपा के सिंधु हैं।',
    english_translation: 'The moment a soul turns towards Me with sincere surrender, their sins accumulated over millions of lifetimes are dissolved immediately.',
    context_intro_hi: 'जैसे श्री रामचरितमानस में भगवान श्री राम विभीषण को शरण देते हुए अमृत वाणी में कहते हैं कि —',
    context_intro_en: 'Just as Lord Rama declares when granting refuge in Shri Ramcharitmanas —',
    keywords: [
      'अपराध', 'बुरे कर्म', 'पाप नष्ट', 'भगवान माफ करेंगे', 'अधर्मी', 'गलती हो गई', 'पश्चाताप',
      'bad karma', 'forgive sins', 'will god forgive', 'past mistakes', 'repentance'
    ]
  },
  {
    id: 'gita_4_34',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ४.३४ (Bhagavad Gita 4.34)',
    original_text: 'तद्विद्धि प्रणिपातेन परिप्रश्नेन सेवया। उपदेक्ष्यन्ति ते ज्ञानं ज्ञानिनस्तत्त्वदर्शिनः॥',
    hindi_meaning: 'उस परम ज्ञान को तत्त्वदर्शी संतों व गुरु के चरणों में विनम्र प्रणाम, निष्कपट जिज्ञासा और निष्काम सेवा द्वारा समझो। वे तत्त्व को जानने वाले महापुरुष तुम्हें ज्ञान का उपदेश देंगे।',
    english_translation: 'Acquire that transcendental knowledge by humbly prostrating before the wise, by sincere inquiry, and by selfless service. Those seers of truth will impart that wisdom unto you.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण गुरु शरण व ज्ञान प्राप्ति का मार्ग समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides on taking refuge in a genuine Guru in the Bhagavad Gita —',
    keywords: [
      'गुरु', 'गुरु कृपा', 'गुरु दीक्षा', 'गुरु का महत्व', 'संत', 'मार्गदर्शन', 'दीक्षा',
      'guru', 'spiritual guide', 'enlightenment', 'guru kripa', 'saint'
    ]
  }
];

/**
 * Normalizes query string for robust cross-lingual matching
 */
function normalizeQuery(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w\s\u0900-\u0D7F]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Searches the scripture database for the single most relevant verse.
 * Returns null if no match is found.
 */
export function getScriptureGrounding(query) {
  if (!query || typeof query !== 'string') return null;
  const cleanQ = normalizeQuery(query);
  if (!cleanQ || cleanQ.length < 2) return null;

  // Direct explicit requests: if user explicitly asked for a shloka, verse, or scripture
  const wantsVerse = /(श्लोक|श्लोका|shlok|shloka|verse|गीता|gita|रामायण|ramayan|रामचरितमानस|scripture|quote)/i.test(query);

  let bestMatch = null;
  let highestScore = 0;

  for (const item of SCRIPTURE_DATABASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      const kw = normalizeQuery(keyword);
      if (!kw) continue;
      if (cleanQ.includes(kw)) {
        score += kw.length >= 6 ? 3.5 : 2.5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Minimum relevance threshold: 2.0 (at least one clear keyword match)
  const threshold = wantsVerse ? 1.5 : 2.0;
  if (highestScore >= threshold && bestMatch) {
    return {
      ...bestMatch,
      score: highestScore,
      match_type: 'semantic_rag'
    };
  }

  return null;
}

/**
 * Injects formatted scripture grounding cleanly into Maharaj Ji's system prompt
 */
export function injectScripturePrompt(basePrompt, scripture, isEnglish = false) {
  if (!scripture) return basePrompt;

  const intro = isEnglish ? scripture.context_intro_en : scripture.context_intro_hi;
  const meaning = isEnglish ? scripture.english_translation : scripture.hindi_meaning;

  if (isEnglish) {
    const block = `\n\n【SACRED SCRIPTURE GROUNDING (RAG) - MANDATORY CITATION】:
Scripture Reference: ${scripture.reference}
Contextual Introduction: ${intro}
Original Sanskrit Verse: ${scripture.original_text}
Sacred Meaning: ${meaning}

PRESENTATION FORMAT (MANDATORY):
1. Naturally weave this verse into your discourse using its authentic introduction:
   ${intro}
   **« ${scripture.original_text} »**
2. Immediately provide its heartfelt spiritual essence:
   **अर्थात् —** "${meaning}"
3. Thereafter, in Pujya Maharaj Ji's compassionate, fatherly voice ('Look, dear child...', 'Thakur Ji...'), comfort the seeker's struggle with loving spiritual assurance and Holy Name remembrance ('Radha Radha').`;
    return basePrompt + block;
  } else {
    const block = `\n\n【अनिवार्य शास्त्र प्रमाण व प्रसंग निर्देश (SCRIPTURE GROUNDING)】:
ग्रंथ संदर्भ: ${scripture.reference}
प्रसंग भूमिका: ${intro}
मूल संस्कृत श्लोक: ${scripture.original_text}
शास्त्रसम्मत भावार्थ: ${meaning}

प्रस्तुति प्रारूप (MANDATORY FORMAT):
1. उत्तर में श्लोक से ठीक पहले उसकी प्रामाणिक प्रसंग भूमिका स्वाभाविक रूप से कहें:
   ${intro}
   **« ${scripture.original_text} »**
2. श्लोक के ठीक नीचे उसका सरल व मर्मस्पर्शी भावार्थ अवश्य लिखें:
   **अर्थात् —** "${meaning}"
3. इसके पश्चात पूज्य श्री प्रेमानंद जी महाराज की प्रामाणिक वात्सल्यमयी शैली ('देखो बच्चा...', 'हमारे ठाकुर जी...') में साधक के प्रश्न से जोड़ते हुए उपदेश दीजिए (कर्म को प्रभु सेवा मानना, फल प्रभु पर छोड़ना, और निरंतर 'राधा-राधा' नाम का आश्रय लेना)।
मर्यादा: श्लोक को शुद्ध रखें, **« ${scripture.original_text} »** और **अर्थात् —** का बोल्ड प्रारूप सुरक्षित रखें।`;
    return basePrompt + block;
  }
}
