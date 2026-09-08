/**
 * Scripture Grounding & RAG Retrieval Engine for Samvaad
 * Provides authentic, diverse, multi-scripture matching from:
 * - Shrimad Bhagavad Gita
 * - Shri Ramcharitmanas
 * - Srimad Bhagavatam
 * - Shri Radha Sudha Nidhi
 */

export const SCRIPTURE_DATABASE = [
  // 1. Laziness, Inaction & Duty (कर्म ज्यायो ह्यकर्मणः)
  {
    id: 'gita_3_8',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.८ (Bhagavad Gita 3.8)',
    original_text: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्धaddress ह्यकर्मणः॥',
    hindi_meaning: 'तुम अपने शास्त्रविहित कर्तव्य कर्म करो, क्योंकि कर्म न करने (आलस्य या अकर्मण्यता) की अपेक्षा कर्म करना श्रेष्ठ है। कर्म न करने से तो तुम्हारा शरीर-निर्वाह भी सिद्ध नहीं हो सकता।',
    english_translation: 'Perform your prescribed duties, for action is far superior to inaction. Without work, even the basic maintenance of your physical body is not possible.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अकर्मण्यता व आलस्य का निवारण करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna dispels laziness and idleness in the Bhagavad Gita —',
    keywords: [
      'आलस', 'आलस्य', 'सुस्ती', 'प्रमाद', 'आलस आता है', 'आलस कैसे छोड़ें', 'काम करने का मन नहीं करता', 'बैठे रहना', 'अकर्म', 'अकर्मण्यता', 'काम टालना', 'सुस्ती दूर', 'कर्महीन',
      'laziness', 'lazy', 'procrastination', 'procrastinate', 'lethargy', 'inaction', 'lack of motivation', 'demotivated', 'overcome laziness', 'stop being lazy',
      'బద్ధకం', 'సోమరితనం', 'పనిచేయాలనిపించట్లేదు',
      'alas', 'aalas', 'sustee', 'kam karne ka man nahi karta', 'procrastinating'
    ]
  },

  // 2. Tamasic Laziness & Over-Sleeping (निद्रालस्यप्रमादोत्थं)
  {
    id: 'gita_18_39',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १८.३९ (Bhagavad Gita 18.39)',
    original_text: 'यदग्रे चानुबन्धे च सुखं मोहनमात्मनः। निद्रालस्यप्रमादोत्थं तत्तामसमुदाहृतम्॥',
    hindi_meaning: 'जो सुख भोगकाल में और परिणाम में भी आत्मा को मोहित (अंधकारमय) करने वाला है, तथा जो निद्रा, आलस्य और व्यर्थ प्रमाद से उत्पन्न होता है, वह सुख तामस कहा गया है।',
    english_translation: 'That pleasure which blinds the soul from beginning to end, arising from sleep, indolence, and negligence, is declared to be in the mode of ignorance (tamas).',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण निद्रा व तामसिक आलस्य के विषय में सचेत करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna warns against the delusion of excessive sleep and lethargy in the Bhagavad Gita —',
    keywords: [
      'ज्यादा नींद', 'नींद बहुत आती है', 'सुबह नींद नहीं खुलती', 'दिन भर सोना', 'तामसिक सुख', 'आलस और नींद',
      'too much sleep', 'oversleeping', 'cannot wake up early', 'lethargic morning', 'sleepy all day',
      'ఎక్కువ నిద్ర', 'నిద్రమత్తు'
    ]
  },

  // 3. Effort, Hard Work & Fruit of Karma (कर्मण्येवाधिकारस्ते)
  {
    id: 'gita_2_47',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.४७ (Bhagavad Gita 2.47)',
    original_text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    hindi_meaning: 'तुम्हारा अधिकार केवल निष्काम भाव से कर्म करने में है, उसके फलों में कभी नहीं। अतः कर्म के फल की वासना वाले मत बनो और न ही अकर्मण्यता में तुम्हारी आसक्ति हो।',
    english_translation: 'You have a right only to perform your prescribed duty, never to the fruits of action. Never let the fruits be your motive, nor be attached to inaction.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण निष्काम कर्म-सिद्धांत समझाते हुए अर्जुन से कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna instructs Arjuna on selfless action in the Shrimad Bhagavad Gita —',
    keywords: [
      'मेहनत', 'परिश्रम', 'कड़ी मेहनत', 'सफलता नहीं मिल रही', 'असफल', 'असफलता', 'कर्म का फल', 'मेहनत का फल', 'सफलता कब मिलेगी', 'निराशा कर्म', 'परीक्षा फल',
      'hard work', 'working hard', 'work hard', 'no success', 'not getting success', 'failed', 'failure', 'results', 'fruits of action', 'effort', 'struggling career', 'reward', 'unsuccessful',
      'కష్టపడి', 'కష్టం', 'పనిచేస్తున్నాను', 'విజయం', 'విజయము', 'ఫలితం', 'సఫలత', 'ఓటమి', 'కష్టానికి ప్రతిఫలం',
      'mehnat kar raha hu', 'safalta nahi mil rahi', 'fal nahi mil raha', 'hardwork', 'karm fal'
    ]
  },

  // 4. Restless Mind & Meditation (अभ्यासेन तु कौन्तेय)
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
      'मन चंचल', 'चंचल मन', 'चंचल', 'मन भटकता है', 'मन भटकता', 'भटकता', 'अशांत मन', 'मन अशांत', 'मन एकाग्र', 'मन नहीं लगता', 'मन कैसे लगाएं', 'ध्यान', 'एकाग्रता', 'मन शांत कैसे करें', 'मन की शांति', 'विचार बहुत आते हैं',
      'restless mind', 'mind wandering', 'wandering mind', 'lack of concentration', 'focus', 'distracted mind', 'control mind', 'mind control', 'meditation', 'overthinking',
      'చంచలమైన మనస్సు', 'మనస్సు ప్రశాంతత', 'ధ్యానం',
      'man chanchal hai', 'man bhatakta hai', 'man shant kaise kare', 'dhyan'
    ]
  },

  // 5. Fear of Death & Immortality of Soul (न जायते म्रियते वा कदाचिन्)
  {
    id: 'gita_2_20',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.२० (Bhagavad Gita 2.20)',
    original_text: 'न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥',
    hindi_meaning: 'यह आत्मा न कभी जन्म लेती है और न कभी मरती है; यह अजन्मा, नित्य, सनातन और पुरातन है। शरीर के नष्ट होने पर भी यह कभी नष्ट नहीं होती।',
    english_translation: 'The soul is never born nor does it ever die; nor having once existed, does it ever cease to be. The soul is unborn, eternal, ever-existing, and primeval. It is not slain when the body is slain.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण आत्मा की अमरता और मृत्यु के सत्य पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals the immortality of the soul in the Bhagavad Gita —',
    keywords: [
      'मृत्यु का भय', 'मौत से डर', 'मृत्यु के बाद क्या', 'अविनाशी आत्मा', 'मौत', 'मरण', 'मृत्यु क्या है', 'अमर आत्मा',
      'fear of death', 'death', 'mortality', 'what happens after death', 'afraid of dying', 'immortal soul', 'overcome fear of death',
      'మరణం భయం', 'చనిపోవడం', 'ఆత్మ',
      'mrityu ka dar', 'mrityu ka bhay', 'maut se dar', 'mrityu', 'bhay', 'atma amar hai'
    ]
  },

  // 6. Transmigration of Soul (वासांसि जीर्णानि)
  {
    id: 'gita_2_22',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.२२ (Bhagavad Gita 2.22)',
    original_text: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि। तथा शरीराणि विहाय जीर्णान्यन्यानि संयाति नवानि देही॥',
    hindi_meaning: 'जैसे मनुष्य पुराने वस्त्रों को त्यागकर दूसरे नए वस्त्र धारण करता है, वैसे ही जीवात्मा पुराने शरीरों को त्यागकर नए शरीरों को प्राप्त होती है।',
    english_translation: 'Just as a person casts off worn-out garments and puts on new ones, so the embodied soul casts off worn-out bodies and enters into new ones.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण देह-त्याग और पुनर्जन्म का रहस्य समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna explains the shedding of the mortal frame in the Bhagavad Gita —',
    keywords: [
      'पुनर्जन्म', 'शरीर छोड़ना', 'देह त्याग', 'वस्त्र बदलना', 'शोक किसी की मृत्यु पर', 'स्वजन की मृत्यु',
      'rebirth', 'reincarnation', 'changing bodies', 'passing away of loved one', 'transmigration',
      'పునర్జన్మ'
    ]
  },

  // 7. Anger & Destruction of Intellect (क्रोधाद्भवति संमोहः)
  {
    id: 'gita_2_62_63',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.६२-६३ (Bhagavad Gita 2.62-63)',
    original_text: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥ क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥',
    hindi_meaning: 'विषयों का निरंतर चिंतन करने से आसक्ति होती है, आसक्ति से कामना और कामना में बाधा आने पर क्रोध उत्पन्न होता है। क्रोध से सम्मोह, सम्मोह से स्मृति भ्रम और स्मृति भ्रम से बुद्धि का नाश हो जाता है।',
    english_translation: 'While contemplating sense objects, attachment arises; from attachment desire is born, and from thwarted desire anger arises. From anger comes delusion, from delusion loss of memory, and from loss of memory destruction of intellect.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण क्रोध और पतन की श्रृंखला समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna warns against the perils of anger and desire in the Bhagavad Gita —',
    keywords: [
      'क्रोध', 'गुस्सा', 'क्रोध कैसे रोकें', 'गुस्सा बहुत आता है', 'क्रोध शांत', 'गुस्से पर नियंत्रण', 'चिड़चिड़ापन',
      'anger', 'angry', 'control anger', 'temper', 'rage', 'how to control temper', 'short tempered',
      'కోపం', 'కోపము', 'క్రోధము',
      'gussa aata hai', 'gussa kaise roke', 'krodh shant'
    ]
  },

  // 8. Depression & Self-Elevation (उद्धरेदात्मनात्मानं)
  {
    id: 'gita_6_5',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ६.५ (Bhagavad Gita 6.5)',
    original_text: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    hindi_meaning: 'मनुष्य को अपने मन द्वारा अपना उद्धार करना चाहिए, स्वयं को कभी अवसाद (निराशा) में न गिराए; क्योंकि मन ही आत्मा का सच्चा मित्र है और असंयमित मन ही उसका सबसे बड़ा शत्रु है।',
    english_translation: 'Elevate yourself through the power of your mind, and do not degrade yourself. For the mind can be the greatest friend, and also the greatest enemy of the self.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण मन की शक्ति व आत्मोद्धार पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides on conquering despair through the mind in the Bhagavad Gita —',
    keywords: [
      'अवसाद', 'निराशा', 'निराश', 'जीवन से निराश', 'डिप्रेशन', 'मन टूट गया', 'उदास', 'हताश', 'हताशा', 'आत्मविश्वास टूट गया', 'हौसला टूटना', 'जीने की इच्छा नहीं',
      'depression', 'depressed', 'overcoming sadness', 'hopeless', 'despair', 'feeling low', 'self doubt', 'lost hope',
      'డిప్రెషన్', 'నిరాశ',
      'nirasha', 'nirash', 'depression ho raha hai', 'udas hu'
    ]
  },

  // 9. Total Surrender & Absolute Refuge (सर्वधर्मान्परित्यज्य)
  {
    id: 'gita_18_66',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १८.६६ (Bhagavad Gita 18.66)',
    original_text: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    hindi_meaning: 'संपूर्ण धर्मों के आश्रय को त्यागकर केवल मेरी शरण में आ जाओ; मैं तुम्हें समस्त पापों से मुक्त कर दूंगा, तुम शोक मत करो।',
    english_translation: 'Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sins; do not grieve.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता के चरम श्लोक में भगवान श्रीकृष्ण अनन्य शरणागति का अभयदान देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna grants the supreme promise of total refuge in the Bhagavad Gita —',
    keywords: [
      'शरणागति', 'शरण', 'प्रभु की शरण', 'सब छोड़ दिया', 'अकेला असहाय', 'पाप से मुक्ति', 'मुझे बचा लो', 'ईश्वर पर भरोसा', 'समर्पण', 'समर्पित', 'भगवान को समर्पित', 'सब कुछ भगवान को',
      'surrender', 'total refuge', 'surrendering to God', 'helpless', 'forgiveness of sins', 'sharanagati', 'take my shelter',
      'శరణాగతి', 'శరణు',
      'sharanagati', 'sharan me kaise jaye', 'prabhu ki sharan', 'samarpan', 'samarpit'
    ]
  },

  // 10. Power of Holy Name (कलिजुग केवल नाम अधारा - श्रीरामचरितमानस)
  {
    id: 'rcm_naam_adhara',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस बालकाण्ड (Ramcharitmanas Balkand)',
    original_text: 'कलिजुग केवल नाम अधारा। सुमिरि सुमिरि नर उतरहिं पारा॥ उलटा नाम जपत जगु जाना। बाल्मीकि भए ब्रह्म समाना॥',
    hindi_meaning: 'कलियुग में योग, यज्ञ या तप नहीं, केवल भगवन्नाम ही उद्धार का एकमात्र आधार है, जिसका निरंतर स्मरण करके मनुष्य भवसागर से पार उतर जाता है। उलटे नाम का जप करके भी वाल्मीकि जी ब्रह्म के समान पूज्य हो गए।',
    english_translation: 'In the age of Kali, neither austere yoga nor rituals save; the Holy Name alone is the sole anchor. By remembering it continuously, mortals cross the ocean of mundane existence.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में गोस्वामी तुलसीदास जी कलियुग में नाम-जप की महिमा गाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Goswami Tulsidas sings the supreme power of the Holy Name in Ramcharitmanas —',
    keywords: [
      'नाम जप', 'राधा नाम', 'राम नाम', 'नाम की महिमा', 'जप कैसे करें', 'नाम जप का फल', 'मंत्र जप', 'राधा राधा', 'भगवान का नाम',
      'chanting', 'naam jap', 'holy name', 'power of chanting', 'radha radha', 'mantra chanting', 'repetition of name',
      'నామ జపం', 'రామ నామం',
      'naam jap kaise kare', 'radha naam mahima', 'jap karne ka tarika'
    ]
  },

  // 11. Glory of Satsang (तात स्वर्ग अपबर्ग सुख - श्रीरामचरितमानस)
  {
    id: 'rcm_satsang_glory',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस उत्तरकाण्ड (Ramcharitmanas Uttarkand)',
    original_text: 'तात स्वर्ग अपबर्ग सुख धरिअ तुला एक अंग। तूल न ताहि सकल मिलि जो सुख लव सतसंग॥ बिनु सतसंग बिबेक न होई। राम कृपा बिनु सुलभ न सोई॥',
    hindi_meaning: 'हे तात! यदि तराजू के एक पलड़े पर स्वर्ग और मोक्ष के सब सुख रखे जाएं, तब भी वे सत्संग के एक लव (क्षणमात्र) के सुख की बराबरी नहीं कर सकते। बिना सत्संग के विवेक नहीं जागता।',
    english_translation: 'Even if the pleasures of heaven and final liberation are placed on one scale, they cannot equal a single moment of genuine Satsang. Without holy association, spiritual discrimination never awakens.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में सत्संग की अद्वितीय महिमा बताते हुए कहा गया है कि —',
    context_intro_en: 'Just as the unmatched glory of holy company is proclaimed in Ramcharitmanas —',
    keywords: [
      'सत्संग', 'सत्संग की महिमा', 'संतों का संग', 'अच्छी संगति', 'कुसंगति से कैसे बचें', 'सत्संग क्यों जरूरी है',
      'satsang', 'holy company', 'association of saints', 'good company', 'importance of satsang',
      'సత్సంగం'
    ]
  },

  // 12. Purity of Heart & Sincerity (निर्मल मन जन सो मोहि पावा - श्रीरामचरितमानस)
  {
    id: 'rcm_nirmal_man',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस सुन्दरकाण्ड (Ramcharitmanas Sundarkand)',
    original_text: 'निर्मल मन जन सो मोहि पावा। मोहि कपट छल छिद्र न भावा॥',
    hindi_meaning: 'जो मनुष्य निर्मल मन का होता है, वही मुझे प्राप्त कर सकता है; मुझे कपट, छल और प्रपंच लेशमात्र भी पसंद नहीं हैं।',
    english_translation: 'Only the devotee endowed with a pure, innocent heart can attain Me; I harbor no liking for deceit, pretension, or guile.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में भगवान श्री राम अपने भक्त के अंतःकरण की शुद्धता पर कहते हैं कि —',
    context_intro_en: 'Just as Lord Rama declares the beauty of a pure, guileless heart in Ramcharitmanas —',
    keywords: [
      'निर्मल मन', 'कपट', 'ईश्वर कैसे मिलते हैं', 'छल', 'मन की पवित्रता', 'दिखावा', 'सच्ची भक्ति',
      'pure heart', 'purity of mind', 'hypocrisy', 'how to please God', 'sincerity in devotion', 'guileless',
      'నిర్మల మనస్సు'
    ]
  },

  // 13. God's Personal Care & Protection (अनन्याश्चिन्तयन्तो मां)
  {
    id: 'gita_9_22',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ९.२२ (Bhagavad Gita 9.22)',
    original_text: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    hindi_meaning: 'जो अनन्य भक्त केवल मेरा ही चिंतन करते हुए निष्काम भाव से मुझे भजते हैं, उन नित्य-युक्त भक्तों के योग (अप्राप्त की प्राप्ति) और क्षेम (प्राप्त की रक्षा) का वहन मैं स्वयं करता हूँ।',
    english_translation: 'For those who worship Me with undivided devotion, meditating solely upon Me, I personally carry what they lack and preserve what they have.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अपने अनन्य भक्तों के संरक्षण का वचन देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna promises divine protection and care in the Bhagavad Gita —',
    keywords: [
      'भगवान रक्षा करेंगे', 'चिंता', 'भविष्य की चिंता', 'परिवार की चिंता', 'योगक्षेम', 'ईश्वर सहारा', 'प्रभु संभालेंगे',
      'will God protect me', 'future anxiety', 'financial anxiety', 'divine care', 'providence', 'who will take care of me',
      'యోగక్షేమం'
    ]
  },

  // 14. Lust & Sensual Addiction (काम एष क्रोध एष)
  {
    id: 'gita_3_37',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.३७ (Bhagavad Gita 3.37)',
    original_text: 'काम एष क्रोध एष रजोगुणसमुद्भवः। महाशनो महापाप्मा विद्ध्येनमिह वैरिणम्॥',
    hindi_meaning: 'यह काम (वासना) ही है जो रजोगुण से उत्पन्न होता है और यही बाद में क्रोध में बदल जाता है; यह बहुत खाने वाला और महापापी है, इसे ही तुम इस संसार में अपना सबसे बड़ा शत्रु जानो।',
    english_translation: 'It is lust alone, born of the mode of passion, which subsequently turns into wrath; know this to be the all-devouring, greatly sinful enemy of the world.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण काम-वासना को जीव का सबसे बड़ा शत्रु बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna identifies lust as the formidable inner enemy in the Bhagavad Gita —',
    keywords: [
      'काम वासना', 'वासना', 'हवस', 'गंदे विचार', 'इंद्रिय सुख', 'लत', 'व्यसन', 'ब्रह्मचर्य', 'अश्लीलता',
      'lust', 'sensual desires', 'addiction', 'lustful thoughts', 'sexual urges', 'celibacy', 'bad habits',
      'కామం'
    ]
  },

  // 15. Diet, Sleep & Lifestyle Balance (युक्ताहारविहारस्य)
  {
    id: 'gita_6_16_17',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ६.१६-१७ (Bhagavad Gita 6.16-17)',
    original_text: 'नात्यश्नतस्तु योगोऽस्ति न चैकान्तमनश्नतः। न चाति स्वप्नशीलस्य जाग्रतो नैव चार्जुन॥ युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु। युक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥',
    hindi_meaning: 'हे अर्जुन! यह योग न तो बहुत अधिक खाने वाले का सिद्ध होता है, न बिल्कुल न खाने वाले का; न बहुत सोने वाले का और न सदा जागने वाले का। जिसका आहार, विहार, कर्म और शयन-जागरण संतुलित है, उसका योग समस्त दुखों का नाश कर देता है।',
    english_translation: 'Yoga is not possible for one who eats too much, or eats too little; nor for one who sleeps too much or stays awake too long. He who is regulated in eating, resting, working, and sleeping attains freedom from sorrow.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण आहार-विहार और दिनचर्या के संतुलन पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides on balanced living and diet in the Bhagavad Gita —',
    keywords: [
      'खान पान', 'आहार', 'दिनचर्या', 'सोना जागना', 'उपवास', 'दिनचर्या कैसी हो', 'संतुलित जीवन', 'स्वास्थ्य',
      'diet', 'food habits', 'sleep routine', 'balanced lifestyle', 'daily routine', 'fasting too much',
      'ఆహారం'
    ]
  },

  // 16. Finding a True Guru (तद्विद्धि प्रणिपातेन)
  {
    id: 'gita_4_34',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ४.३४ (Bhagavad Gita 4.34)',
    original_text: 'तद्विद्धि प्रणिपातेन परिप्रश्नेन सेवया। उपदेक्ष्यन्ति ते ज्ञानं ज्ञानिनस्तत्त्वदर्शिनः॥',
    hindi_meaning: 'उस तत्त्वज्ञान को तत्त्वदर्शी संतों व गुरु के पास जाकर विनम्र प्रणाम, निष्कपट जिज्ञासा और निष्काम सेवा द्वारा समझो। वे तत्त्व को जानने वाले महापुरुष तुम्हें ज्ञान का उपदेश देंगे।',
    english_translation: 'Acquire that transcendental knowledge by humbly prostrating before the wise, by sincere inquiry, and by selfless service. Those seers of truth will impart that wisdom unto you.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण सद्गुरु की शरण और ज्ञान-प्राप्ति का मार्ग बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna instructs on taking shelter of an authentic Guru in the Bhagavad Gita —',
    keywords: [
      'गुरु', 'सद्गुरु', 'गुरु कृपा', 'गुरु का महत्व', 'गुरु दीक्षा', 'गुरु की आवश्यकता', 'सच्चे संत',
      'guru', 'spiritual master', 'finding a guru', 'need a guru', 'guru kripa', 'guidance of a saint',
      'గురువు'
    ]
  },

  // 17. Sincere Simple Devotion (पत्रं पुष्पं फलं तोयं)
  {
    id: 'gita_9_26',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ९.२६ (Bhagavad Gita 9.26)',
    original_text: 'पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति। तदहं भक्त्युपहृतमश्नामि प्रयतात्मनः॥',
    hindi_meaning: 'जो कोई भक्त प्रेम और भक्ति से मुझे एक पत्ता, फूल, फल या केवल जल भी अर्पित करता है, उस शुद्ध मन वाले भक्त के प्रेमपूर्वक भेंट किए हुए उस उपहार को मैं साक्षात् स्वीकार करता हूँ।',
    english_translation: 'Whoever offers Me with devotion a leaf, a flower, fruit or water, that offering made with love by a pure heart I lovingly accept.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण निष्कपट प्रेम-भक्ति की सुगमता बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals how easily the Lord is pleased by love in the Bhagavad Gita —',
    keywords: [
      'पूजा कैसे करें', 'भोग लगाना', 'भगवान को कैसे रीझाएं', 'पत्ता फूल', 'भक्ति का भाव', 'साधारण पूजा',
      'how to worship', 'offering food', 'love of God', 'simple devotion', 'offering water',
      'పూజ'
    ]
  },

  // 18. Equanimity in Success & Failure (समत्वं योग उच्यते)
  {
    id: 'gita_2_48',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.४८ (Bhagavad Gita 2.48)',
    original_text: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    hindi_meaning: 'हे धनंजय! आसक्ति को त्यागकर, सफलता और असफलता में समान भाव रखकर अपने कर्तव्य कर्म करो; यह समत्व भाव ही योग कहलाता है।',
    english_translation: 'Perform your duty with an equanimous mind, abandoning all attachment to success or failure. Such equanimity is called Yoga.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण समत्व योग का रहस्य समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna explains the yoga of equanimity in the Bhagavad Gita —',
    keywords: [
      'समत्व', 'सुख दुख में समान', 'हार जीत', 'समान भाव', 'संतुलन', 'हर्ष शोक',
      'equanimity', 'balance in joy and sorrow', 'neutral mind', 'success and defeat',
      'సమభావం'
    ]
  },

  // 19. Destruction by Doubt & Skepticism (संशयात्मा विनश्यति)
  {
    id: 'gita_4_40',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ४.४० (Bhagavad Gita 4.40)',
    original_text: 'अज्ञश्चाश्रद्दधानश्च संशयात्मा विनश्यति। नायं लोकोऽस्ति न परो न सुखं संशयात्मनः॥',
    hindi_meaning: 'विवेकहीन, श्रद्धाहीन और संशययुक्त मन वाले मनुष्य का विनाश हो जाता है। संशयात्मा के लिए न यह लोक है, न परलोक है और न ही कोई सुख है।',
    english_translation: 'The ignorant, faithless person who is constantly doubtful is ruined. For the doubting soul there is neither happiness in this world nor in the next.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण संशय व अविश्वास की हानि बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna warns against the poison of doubt in the Bhagavad Gita —',
    keywords: [
      'संशय', 'संदेह', 'विश्वास नहीं होता', 'श्रद्धा की कमी', 'अविश्वास', 'शक',
      'doubt', 'skepticism', 'lack of faith', 'suspicious mind', 'doubting God',
      'అనుమానం'
    ]
  },

  // 20. Overcoming Worldly Maya (मामेव ये प्रपद्यन्ते)
  {
    id: 'gita_7_14',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ७.१४ (Bhagavad Gita 7.14)',
    original_text: 'दैवी ह्येषा गुणमयी मम माया दुरत्यया। मामेव ये प्रपद्यन्ते मायामेतां तरन्ति ते॥',
    hindi_meaning: 'मेरी यह त्रिगुणमयी अलौकिक दैवी माया पार करना अत्यंत कठिन है; परंतु जो केवल मेरी ही अनन्य शरण में आ जाते हैं, वे इस माया को सरलता से पार कर जाते हैं।',
    english_translation: 'This divine energy of Mine, consisting of the three modes of nature, is difficult to overcome. But those who surrender unto Me alone cross beyond this illusion easily.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण माया से मुक्ति का उपाय बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals how to transcend the cosmic illusion in the Bhagavad Gita —',
    keywords: [
      'माया', 'संसार का भ्रम', 'माया से कैसे बचें', 'मोह माया', 'संसार की आसक्ति',
      'maya', 'illusion', 'transcending illusion', 'attachment to world', 'material bondage',
      'మాయ'
    ]
  },

  // 21. Supreme Oceanic Peace (शान्तिमाप्नोति न कामकामी)
  {
    id: 'gita_2_70',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.७० (Bhagavad Gita 2.70)',
    original_text: 'आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत्। तद्वत्कामा यं प्रविशन्ति सर्वे स शान्तिमाप्नोति न कामकामी॥',
    hindi_meaning: 'जैसे चारों ओर से जल से परिपूर्ण समुद्र में अनेक नदियाँ बिना उसे विचलित किए समा जाती हैं, वैसे ही जिस स्थितप्रज्ञ पुरुष में समस्त कामनाएं बिना विक्षेप उत्पन्न किए समा जाती हैं, वही परम शांति को प्राप्त होता है।',
    english_translation: 'A person who is not disturbed by the incessant flow of desires—that enter like rivers into the ocean, which is ever being filled yet always still—can alone achieve true peace.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण परम शांति के स्वरूप पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna illustrates undisturbed peace of heart in the Bhagavad Gita —',
    keywords: [
      'शांति', 'परम शांति', 'शांति कैसे मिले', 'अशांति', 'मन की स्थिरता', 'सच्चा सुख',
      'peace', 'inner peace', 'how to get peace', 'restlessness', 'true serenity',
      'శాంతి'
    ]
  },

  // 22. Forgiveness & Compassion (अद्वेष्टा सर्वभूतानां)
  {
    id: 'gita_12_13_14',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १२.१३-१४ (Bhagavad Gita 12.13-14)',
    original_text: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥ सन्तुष्टः सततं योगी यतात्मा दृढनिश्चयः। मय्यर्पितमनोबुद्धिर्यो मद्भक्तः स मे प्रियः॥',
    hindi_meaning: 'जो किसी भी प्राणी से द्वेष नहीं करता, सबका मित्र और दयालु है, ममता और अहंकार से रहित, सुख-दुख में समान और क्षमावान है—ऐसा दृढ़ निश्चयी भक्त मुझे अत्यंत प्रिय है।',
    english_translation: 'One who is not envious of any living being, who is a kind friend to all, free from false ego and possessiveness, tolerant, and always satisfied—such a devotee is very dear to Me.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अपने प्रिय भक्त के सद्गुण बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna describes the endearing qualities of a true devotee in the Bhagavad Gita —',
    keywords: [
      'ईर्ष्या', 'जलन', 'द्वेष', 'क्षमा', 'शत्रुता', 'सबसे प्रेम कैसे करें', 'माफ करना',
      'jealousy', 'envy', 'forgiveness', 'compassion to all', 'forgiving others', 'hatred',
      'క్షమ'
    ]
  },

  // 23. Destiny & Past Karma (गहना कर्मणो गतिः)
  {
    id: 'gita_4_17',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ४.१७ (Bhagavad Gita 4.17)',
    original_text: 'कर्मणो ह्यपि बोद्धव्यं बोद्धव्यं च विकर्मणः। अकर्मणश्च बोद्धव्यं गहना कर्मणो गतिः॥',
    hindi_meaning: 'कर्म का स्वरूप भी जानना चाहिए, अकर्म का भी और विकर्म (निषिद्ध कर्म) का भी; क्योंकि कर्म की गति अत्यंत गहन और गूढ़ है।',
    english_translation: 'The intricacies of action are very hard to understand. Therefore, one should know properly what action is, what forbidden action is, and what inaction is; profound is the path of karma.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण कर्म और प्रारब्ध की गूढ़ गति पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals the unfathomable depth of destiny and karma in the Bhagavad Gita —',
    keywords: [
      'प्रारब्ध', 'भाग्य', 'कर्म की गति', 'मेरे साथ ही ऐसा क्यों', 'किस्मत', 'पूर्व जन्म के कर्म',
      'destiny', 'past karma', 'prarabdha', 'fate', 'why do bad things happen to good people', 'bad luck',
      'ప్రారబ్ధం', 'కర్మ'
    ]
  },

  // 24. Divine Grace & Forgiveness of Sins (सनमुख होइ जीव मोहि जबहीं - श्रीरामचरितमानस)
  {
    id: 'rcm_sanmukh_jiva',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस सुन्दरकाण्ड (Ramcharitmanas Sundarkand)',
    original_text: 'सनमुख होइ जीव मोहि जबहीं। जन्म कोटि अघ नासहिं तबहीं॥',
    hindi_meaning: 'जीव जैसे ही हृदय से मेरी ओर उन्मुख होता है (मेरी शरण में आता है), उसी क्षण उसके करोड़ों जन्मों के पाप नष्ट हो जाते हैं।',
    english_translation: 'The moment a mortal turns sincerely towards Me in heart, millions of past sins accumulated across lifetimes are instantly erased.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में भगवान श्री राम अपनी अहैतुकी दया का वचन देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Lord Rama proclaims unconditional divine redemption in Ramcharitmanas —',
    keywords: [
      'पाप', 'पाप से मुक्ति', 'क्या भगवान मुझे माफ करेंगे', 'प्रायश्चित', 'गुनाह', 'करोड़ों जन्मों के पाप',
      'sins', 'forgiveness of sins', 'repentance', 'can God forgive me', 'redemption',
      'పాపాలు'
    ]
  },

  // 25. Supreme Devotion Above Intellectual Yoga (श्रीमद्भागवतम्)
  {
    id: 'sb_pure_bhakti',
    scripture_id: 'srimad_bhagavatam',
    reference: 'श्रीमद्भागवतम् ११.१४.२० (Srimad Bhagavatam 11.14.20)',
    original_text: 'न साधयति मां योगो न साङ्ख्यं धर्म उद्धव। न स्वाध्यायस्तपस्त्यागो यथा भक्तिर्ममोर्जिता॥',
    hindi_meaning: 'हे उद्धव! न अष्टांग योग, न सांख्य ज्ञान, न तप, न स्वाध्याय और न ही त्याग मुझे उतना वश में कर सकते हैं, जितना कि मुझमें की गई अनन्य निष्काम प्रेम-भक्ति मुझे वश में कर लेती है।',
    english_translation: 'Neither asthanga yoga, nor philosophical discernment, nor austerities, nor rituals can bind Me as completely as unalloyed loving devotion (bhakti) cultivated for Me.',
    context_intro_hi: 'जैसे श्रीमद्भागवत महापुराण में भगवान श्रीकृष्ण उद्धव जी से विशुद्ध प्रेम-भक्ति का मर्म बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals the supreme power of pure devotion in Srimad Bhagavatam —',
    keywords: [
      'शुद्ध भक्ति', 'भगवान से प्रेम', 'प्रेम भक्ति', 'ज्ञान या भक्ति', 'भगवान को कैसे वश में करें',
      'pure devotion', 'love of God', 'bhakti over yoga', 'how to love God', 'devotional love',
      'భక్తి'
    ]
  },

  // 26. God Residing in Every Heart (ईश्वरः सर्वभूतानां)
  {
    id: 'gita_18_61',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १८.६१ (Bhagavad Gita 18.61)',
    original_text: 'ईश्वरः सर्वभूतानां हृद्देशेऽर्जुन तिष्ठति। भ्रामयन्सर्वभूतानि यंत्रारूढानि मायया॥',
    hindi_meaning: 'हे अर्जुन! सर्वशक्तिमान परमेश्वर समस्त प्राणियों के हृदय-प्रदेश में विराजमान हैं और अपनी माया से सभी जीवों को उनके कर्मों के अनुसार यंत्र पर आरूढ़ की भांति घुमा रहे हैं।',
    english_translation: 'The Supreme Lord resides in the hearts of all living beings, directing their wanderings through the mechanism of material energy according to their karma.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण हृदय में परमात्मा की उपस्थिति बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals the indwelling Divine Presence in the Bhagavad Gita —',
    keywords: [
      'भगवान कहाँ हैं', 'ईश्वर का वास', 'हृदय में भगवान', 'क्या भगवान हमें देखते हैं',
      'where is God', 'God inside', 'divine presence in heart', 'is God watching me',
      'దేవుడు ఎక్కడ ఉన్నాడు'
    ]
  },

  // 27. Ego & False Doership (अहंकारविमूढात्मा कर्ताहमिति)
  {
    id: 'gita_3_27',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.२७ (Bhagavad Gita 3.27)',
    original_text: 'प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः। अहंकारविमूढात्मा कर्ताहमिति मन्यते॥',
    hindi_meaning: 'समस्त कर्म वास्तव में प्रकृति के गुणों द्वारा किए जाते हैं, परंतु अहंकार से मोहित अंतःकरण वाला अज्ञानी मनुष्य स्वयं को उनका \'कर्ता\' मान बैठता है।',
    english_translation: 'All activities are carried out by the modes of material nature, but bewildered by false ego, the ignorant soul mistakenly thinks: "I am the doer."',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अहंकार और कर्तापन के भ्रम पर कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna exposes the illusion of false doership in the Bhagavad Gita —',
    keywords: [
      'अहंकार', 'घमंड', 'मैंने किया', 'कर्तापन', 'अभिमान', 'अहंकार कैसे मिटाएं',
      'ego', 'false pride', 'arrogance', 'i am the doer', 'overcoming pride',
      'అహంకారం'
    ]
  },

  // 28. Seeing God in All Beings (पण्डिताः समदर्शिनः)
  {
    id: 'gita_5_18',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ५.१८ (Bhagavad Gita 5.18)',
    original_text: 'विद्याविनयसंपन्ने ब्राह्मणे गवि हस्तिनि। शुनि चैव श्वपाके च पण्डिताः समदर्शिनः॥',
    hindi_meaning: 'ज्ञानी महापुरुष विद्या और विनय से युक्त ब्राह्मण में, गौ में, हाथी में, कुत्ते में और चाण्डाल में भी समान रूप से आत्म-तत्व (परमात्मा) को देखने वाले समदर्शी होते हैं।',
    english_translation: 'The enlightened sages, by virtue of true knowledge, see with equal vision a learned and gentle brahmana, a cow, an elephant, a dog, and an outcast.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण आत्म-साक्षात्कार की समदृष्टि समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna portrays the divine vision of seeing God in all beings in the Bhagavad Gita —',
    keywords: [
      'समदृष्टि', 'सबमें भगवान देखना', 'भेदभाव', 'समानता', 'जीवों पर दया',
      'equal vision', 'seeing God in all', 'samadarshana', 'respecting all living beings',
      'సమదృష్టి'
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
 * Casual conversational gating:
 * Returns true if the query is merely a greeting or casual remark
 * that should receive warm natural Satsang discourse WITHOUT forcing an unprompted scripture shlok.
 */
function isCasualConversational(query) {
  if (!query) return true;
  let clean = query.trim().toLowerCase();
  if (clean.length < 3) return true;

  // Remove trailing/leading honorifics for greeting check
  const stripped = clean
    .replace(/(?:महाराज\s*जी|महाराज|गुरु\s*जी|गुरुजी|गुरुदेव|बाबा\s*जी|प्रभु\s*जी|ji|guruji|maharaj\s*ji|baba\s*ji)/gi, '')
    .replace(/[^\w\s\u0900-\u0D7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Pure greetings
  const pureGreetings = /^(?:राधे\s*राधे|जय\s*श्री\s*(?:कृष्णा?|राम|राधे)|प्रणाम|चरण\s*स्पर्श|नमस्ते|नमस्कार|हेलो|हाय|hello|hi|hey|good\s*(?:morning|evening|afternoon)|hare\s*krishna)$/i;
  if (!stripped || pureGreetings.test(stripped) || pureGreetings.test(clean)) return true;

  // Simple routine queries like 'how are you'
  const casualQuestions = /^(?:आप\s*कैसे\s*हैं|कैसे\s*हो|सब\s*ठीक\s*है|हाल\s*चाल|how\s*are\s*you|who\s*are\s*you|how\s*r\s*u)$/i;
  if (casualQuestions.test(stripped) || casualQuestions.test(clean)) return true;

  return false;
}

const RAG_ENDPOINT = 'https://immature-zen-earthen.ngrok-free.dev/rag/search';

/**
 * Queries the live 9,558-passage Qdrant Vector Database on Oracle Cloud
 * Executes BAAI/bge-m3 / multilingual cosine similarity search in sub-100ms
 */
async function queryOracleVectorRAG(query) {
  if (typeof fetch === 'undefined') return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2200);

  let scriptureFilter = 'all';
  if (/(गीता|gita|भगवद्गीता)/i.test(query)) {
    scriptureFilter = 'gita';
  } else if (/(रामायण|ramayan|रामचरित|ramcharitmanas|मानस)/i.test(query)) {
    scriptureFilter = 'ramcharitmanas';
  } else if (/(भागवत|bhagavatam|पुराण)/i.test(query)) {
    scriptureFilter = 'bhagavata';
  }

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
        top_k: 2
      })
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const top = data.results?.[0];

    // High confidence vector threshold (cosine similarity >= 0.38)
    if (top && top.score >= 0.38 && top.original_text) {
      const isGita = (top.scripture_id || '').includes('gita') || (top.reference || '').includes('Gita');
      return {
        id: top.id || `qdrant_${Date.now()}`,
        scripture_id: top.scripture_id || (isGita ? 'bhagavad_gita' : 'ramcharitmanas'),
        reference: top.reference,
        original_text: top.original_text,
        hindi_meaning: top.hindi_meaning,
        english_translation: top.english_translation || top.hindi_meaning,
        context_intro_hi: isGita
          ? `जैसे ${top.reference} में भगवान श्रीकृष्ण कहते हैं कि —`
          : `जैसे ${top.reference} में पावन उपदेश है कि —`,
        context_intro_en: isGita
          ? `Just as revealed in ${top.reference} —`
          : `Just as proclaimed in ${top.reference} —`,
        score: top.score,
        match_type: 'qdrant_vector_rag'
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * Local keyword & stem scripture matcher fallback
 */
export function getLocalScriptureGrounding(query) {
  if (!query || typeof query !== 'string') return null;
  const cleanQ = normalizeQuery(query);
  if (!cleanQ || cleanQ.length < 3) return null;

  const wantsVerse = /(श्लोक|श्लोका|shlok|shloka|verse|गीता|gita|रामायण|ramayan|रामचरितमानस|भागवत|scripture|प्रमाण)/i.test(query);

  let bestMatch = null;
  let highestScore = 0;

  const queryTokens = cleanQ.split(' ').filter(t => t.length >= 3);

  for (const item of SCRIPTURE_DATABASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      const kw = normalizeQuery(keyword);
      if (!kw || kw.length < 2) continue;

      if (cleanQ === kw) {
        score += 15.0;
      } else if (cleanQ.includes(kw)) {
        const wordCount = kw.split(' ').length;
        if (wordCount >= 3) {
          score += 8.0;
        } else if (wordCount === 2) {
          score += 5.5;
        } else {
          score += kw.length >= 6 ? 3.5 : 2.5;
        }
      } else {
        const kwTokens = kw.split(' ').filter(t => t.length >= 3);
        for (const kt of kwTokens) {
          for (const qt of queryTokens) {
            if (qt === kt) {
              score += 2.5;
            } else if (qt.length >= 4 && kt.length >= 4 && (qt.startsWith(kt.slice(0, -1)) || kt.startsWith(qt.slice(0, -1)))) {
              score += 2.0;
            }
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  const threshold = wantsVerse ? 1.5 : 2.2;
  if (highestScore >= threshold && bestMatch) {
    return {
      ...bestMatch,
      score: Number(highestScore.toFixed(2)),
      match_type: 'semantic_rag'
    };
  }

  return null;
}

/**
 * Unified Scripture RAG retrieval:
 * 1. Priority 1: High-speed live Qdrant Vector Search (9,558 passages) on Oracle VM.
 * 2. Priority 2: Zero-latency verified curated catalog fallback.
 */
export async function getScriptureGrounding(query) {
  if (!query || typeof query !== 'string') return null;
  if (isCasualConversational(query)) return null;

  // 1. Live Vector Search from Oracle Cloud Qdrant database (9,558 scriptures)
  try {
    const liveVectorMatch = await queryOracleVectorRAG(query);
    if (liveVectorMatch) {
      return liveVectorMatch;
    }
  } catch (e) {}

  // 2. Fallback to local curated index
  return getLocalScriptureGrounding(query);
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
मर्यादा: श्लोक को शुद्ध रखें, **« ${scripture.original_text} »** और **अर्थात् —** का प्रारूप सुरक्षित रखें।`;
    return basePrompt + block;
  }
}
