/**
 * Scripture Grounding & RAG Retrieval Engine for Samvaad
 * Provides authentic, diverse, multi-scripture matching from:
 * - Shrimad Bhagavad Gita
 * - Shri Ramcharitmanas
 * - Srimad Bhagavatam
 * - Shri Radha Sudha Nidhi
 */

export const SCRIPTURE_DATABASE = [
  // 0. Comprehensive Gita Summary & Core Teachings (कुरुक्षेत्र, अर्जुन विषाद, निष्काम कर्म व शरणागति)
  {
    id: 'gita_summary_core',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.४७ व १८.६६ (Bhagavad Gita Summary & Core)',
    original_text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    hindi_meaning: 'कुरुक्षेत्र के धर्मक्षेत्र में मोहग्रस्त होकर कर्तव्य से विमुख होते अर्जुन को भगवान श्रीकृष्ण ने उपदेश दिया कि तुम्हारा अधिकार केवल निष्काम भाव से कर्म करने में है, फल में कभी नहीं। और अंत में समस्त भयों, संशयों और चिंताओं को त्यागकर केवल भगवान की अनन्य शरण में आओ।',
    english_translation: 'On the sacred battlefield of Kurukshetra, when Arjuna was overwhelmed by delusion and sorrow, Lord Krishna commanded him to perform righteous duty without attachment to fruits, and ultimately surrender all doubts and fears at the lotus feet of the Divine.',
    context_intro_hi: 'जैसे कुरुक्षेत्र के युद्धक्षेत्र में मोहग्रस्त अर्जुन को जागृत करते हुए साक्षात् भगवान श्रीकृष्ण संपूर्ण गीता के सार रूप में कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides the despondent Arjuna on the sacred battlefield of Kurukshetra, revealing the supreme essence of the Bhagavad Gita —',
    keywords: [
      'summary of geeta', 'geeta summary', 'summary of gita', 'gita summary', 'summary of the gita', 'summary of the geeta',
      'गीता का सार', 'गीता का सारांश', 'गीता का संक्षेप', 'गीता के बारे में', 'भगवद्गीता का सार', 'गीता का उपदेश', 'गीता के मुख्य उपदेश', 'गीता क्या सिखाती है',
      'tell me about geeta', 'tell me about gita', 'what is geeta', 'what is gita', 'explain geeta', 'explain gita', 'essence of geeta', 'essence of gita',
      'core teachings of gita', 'core teachings of geeta', 'teachings of bhagavad gita', 'teachings of gita', 'geeta ke updesh', 'gita ke updesh',
      'geeta ka saar', 'gita ka saar', 'geeta ka sar', 'gita ka sar', 'geeta summary in hindi', 'gita summary in hindi'
    ]
  },

  // 0B. Garuda Purana Core & Summary (भगवान विष्णु व पक्षीराज गरुड़ संवाद, मृत्यु, कर्म-विपाक व नाम महिमा)
  {
    id: 'garuda_purana_core',
    scripture_id: 'garuda_purana',
    reference: 'श्री गरुड़ पुराण (Garuda Purana · भगवान विष्णु व गरुड़ जी संवाद)',
    original_text: 'हरिनाम सदा सेव्यं यमदूतभयापहम्। ये जपन्ति हरेश्चित्ते न तेषां यमयातना॥ येन केन प्रकारेण यस्य कस्यापि जन्तुनः। संतोषं जनयेत्प्राज्ञस्तदेवेश्वरपूजनम्॥',
    hindi_meaning: 'गरुड़ पुराण में साक्षात् भगवान श्रीहरि विष्णु अपने प्रिय वाहन पक्षीराज गरुड़ जी को उपदेश देते हैं कि जीव को अपने शुभ-अशुभ कर्मों का फल अवश्य भोगना पड़ता है। किंतु जो निरंतर भगवान के पावन नाम का जप करते हैं और किसी भी प्राणी को कष्ट न देकर परोपकार व संतोष प्रदान करते हैं, उन्हें यमदूतों का कोई भय नहीं रहता और वे समस्त यमयातनाओं से छूटकर वैकुंठ धाम को प्राप्त होते हैं।',
    english_translation: 'In the sacred Garuda Purana, Lord Shri Hari Vishnu instructs the bird-king Garuda that every soul experiences the fruits of its karma. Yet those who continuously chant the holy name of God and serve living beings with compassion are freed from all fear of death, attaining the supreme divine abode.',
    context_intro_hi: 'जैसे श्री गरुड़ पुराण में साक्षात् भगवान श्रीहरि विष्णु पक्षीराज गरुड़ जी को जीवन, मृत्यु और परम गति का रहस्य समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Hari Vishnu illuminates the mysteries of life, karma, and ultimate liberation to Garuda in the Garuda Purana —',
    keywords: [
      'garun puran', 'garun puran me kya hai', 'garun puran me kya hota hai', 'garun puran kya hai', 'garun puran ke baare me batao',
      'garun puran ke bare me', 'garuda puran', 'garuda puran me kya hai', 'garuda purana', 'garuda purana kya hai',
      'garud puran', 'garud puran me kya hai', 'garud puran kya hai', 'garuda purana summary',
      'गरुड़ पुराण', 'गरुड़ पुराण में क्या है', 'गरुड पुराण', 'गरुड़ पुराण का सार', 'गरुण पुराण', 'गरुण पुराण में क्या है',
      'गरुड़ पुराण क्या है', 'गरुण पुराण क्या है', 'गरुड़ पुराण के बारे में बताओ', 'गरुड़ पुराण कथा',
      'what is garuda purana', 'what is in garun puran', 'tell me about garun puran', 'tell me about garuda puran',
      'garun puran ki katha', 'garuda puran katha', 'garun puran sankshep', 'garun puran updesh', 'yamlok', 'yamdoot',
      'मृत्यु के बाद क्या होता है', 'मृत्यु के बाद जीव की गति', 'यमलोक क्या है',
      'fear of death', 'mrityu ka darr', 'mrityu se darr', 'marne se darr', 'marne ke baad kya hota hai',
      'yamraj', 'afterlife', 'soul after death', 'death anxiety', 'loss of loved one', 'mrityu', 'death fear'
    ]
  },

  // 0C. Garuda Purana Greatest Sin & Betrayal (महापाप, कृतघ्नता, मित्रद्रोह व माता-पिता अनादर निर्णय)
  {
    id: 'garuda_purana_sins',
    scripture_id: 'garuda_purana',
    reference: 'श्री गरुड़ पुराण (Garuda Purana · महापाप व कृतघ्नता निर्णय)',
    original_text: 'गोघ्ने चैव सुरापे च चौरे भग्नव्रते तथा। निष्कृतिर्विहिता सद्भिः कृतघ्ने नास्ति निष्कृतिः॥ मित्रद्रोही कृतघ्नश्च विश्वासघाती नराधमः। यमस्य भवने घोरे तिष्ठत्याचन्द्रतारकम्॥',
    hindi_meaning: 'श्री गरुड़ पुराण (प्रेतकल्प) में साक्षात् भगवान श्रीहरि विष्णु ने पक्षीराज गरुड़ जी को बताया है कि संसार में सबसे बड़ा और अक्षम्य पाप "कृतघ्नता" (विश्वासघात व उपकार को भूलना) और मित्रद्रोह है। शास्त्रों में गोहत्या, मद्यपान या चोरी का प्रायश्चित संभव है, किंतु जो व्यक्ति उपकार करने वाले का बुरा करता है, विश्वासघात करता है, अथवा अपने जन्मदाता माता-पिता और गुरु का अनादर करता है, उसके लिए संसार के किसी लोक में मुक्ति या प्रायश्चित नहीं है।',
    english_translation: 'In the sacred Garuda Purana (Preta Kalpa), Lord Shri Hari Vishnu reveals to the bird-king Garuda that the gravest and most unforgivable sin is "Kritaghnata" (betrayal of trust, ingratitude, and harming a benefactor) along with betraying friends and disrespecting parents and Guru. Sages prescribe expiation for many misdeeds, but for a betrayer of trust and an ungrateful soul, no atonement exists in any realm.',
    context_intro_hi: 'जैसे श्री गरुड़ पुराण में साक्षात् भगवान श्रीहरि विष्णु पक्षीराज गरुड़ जी को सबसे बड़े पाप और कृतघ्नता का निर्णय समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Hari Vishnu reveals the gravest sins and the fate of betrayal to Garuda in the Garuda Purana —',
    keywords: [
      'garun puran me sabse bada paap', 'garuda puran me sabse bada paap', 'garun puran me sabse bada paap kya hai',
      'garuda purana greatest sin', 'garun puran paap', 'garuda puran paap', 'garun puran me paap',
      'sabse bada paap garun puran', 'sabse bada paap garuda puran', 'garun puran ke anusaar sabse bada paap',
      'गरुड़ पुराण में सबसे बड़ा पाप', 'गरुण पुराण में सबसे बड़ा पाप', 'गरुड़ पुराण में पाप', 'गरुण पुराण में पाप',
      'गरुड़ पुराण महापाप', 'गरुण पुराण महापाप', 'गरुड़ पुराण पाप फल', 'garuda purana sins', 'garun puran sins',
      'garun puran mahapaap', 'garuda puran mahapaap', 'sabse bada paap kya likha hai', 'sabse bada paap kya hai garun puran',
      'friend cheated', 'friend cheated me', 'cheated by friend', 'friend betrayed me', 'dost ne dhokha diya',
      'mitra ne dhokha diya', 'dhokha', 'vishwasghat', 'betrayal', 'cheating in friendship', 'revenge on friend',
      'badla lena', 'revenge', 'want revenge', 'mitradroha', 'mitra droha', 'कृतघ्नता', 'मित्रद्रोह', 'विश्वासघात'
    ]
  },

  // 0C2. Vidura Niti & Mahabharata - Kshama as the Supreme Shield over Revenge (क्षमा शस्त्रं करे यस्य दुर्जनः किं करिष्यति)
  {
    id: 'vidura_niti_forgiveness',
    scripture_id: 'vidura_niti',
    reference: 'विदुर नीति १.५८ (Vidura Niti · क्षमा रूपी अमोघ शस्त्र व प्रतिशोध निवारण)',
    original_text: 'क्षमा शस्त्रं करे यस्य दुर्जनः किं करिष्यति। अतृणे पतितो वह्निः स्वयमेवोपशाम्यति॥ एकः क्षमावतां दोषो द्वितीया न च विद्यते। यदेनं क्षमया युक्तमशक्तं मन्यते जनः॥',
    hindi_meaning: 'महात्मा विदुर जी उपदेश देते हैं कि जिस मनुष्य के हाथ में "क्षमा" रूपी अमोघ शस्त्र है, दुष्ट व्यक्ति उसका क्या बिगाड़ सकता है? जैसे तृण (घास) से रहित सूखी भूमि पर गिरी हुई आग स्वयं ही शांत हो जाती है, वैसे ही क्षमाशील व्यक्ति के आगे शत्रुता व विश्वासघात का विष स्वयं निष्फल हो जाता है। किसी मित्र या संबंधी द्वारा दिए गए धोखे पर प्रतिशोध की आग में स्वयं को जलाना नहीं चाहिए, क्योंकि कर्म का न्याय अटल है। क्षमा ही आत्मा का सबसे बड़ा बल है।',
    english_translation: 'In Vidura Niti (1.58), Mahatma Vidura proclaims: "He who holds the supreme weapon of forgiveness (Kshama) in his hand, what harm can a wicked adversary ever do to him? Just as fire falling upon barren, grassless ground extinguishes entirely on its own, so does malice fade before a forgiving heart." When a friend betrays or cheats you, harboring vengeful wrath only poisons your own soul. Surrendering the wrongdoer to the infallible cosmic justice of Karma and cultivating forgiveness brings absolute inner victory and peace.',
    context_intro_hi: 'जैसे विदुर नीति में महात्मा विदुर जी धोखे और प्रतिशोध के संताप से मुक्ति हेतु क्षमा का रहस्य बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Mahatma Vidura illuminates the invulnerable shield of forgiveness against betrayal and malice in the Vidura Niti —',
    keywords: [
      'friend cheated', 'friend cheated me', 'cheated by friend', 'friend betrayed me',
      'my friend cheated me', 'revenge', 'want revenge', 'want revenge from him',
      'take revenge', 'taking revenge', 'revenge on friend', 'badla', 'badla lena',
      'dost ne dhokha diya', 'mitra ne dhokha diya', 'mitra droha', 'vishwasghat',
      'dhokha mila', 'dhokhe ka badla', 'forgiveness', 'kshama', 'क्षमा शस्त्रं करे यस्य',
      'विदुर नीति', 'vidura niti', 'प्रतिशोध', 'बदला कैसे लें', 'how to deal with betrayal',
      'overcoming revenge', 'inner peace after betrayal', 'dealing with cheating'
    ]
  },

  // 0D. Matsya Purana Core (भगवान मत्स्य व राजा मनु संवाद, प्रलय, वेद-रक्षा व धर्म प्रतिष्ठा)
  {
    id: 'matsya_purana_core',
    scripture_id: 'matsya_purana',
    reference: 'श्रीमत्स्य पुराण (Matsya Purana · भगवान मत्स्य व राजा मनु संवाद)',
    original_text: 'यतो धर्मस्ततो जयः। धर्मेण धार्यते लोकः सत्ये सर्वं प्रतिष्ठितम्॥ वेदानां रक्षणार्थाय धर्मसंरक्षणाय च। प्रादुर्भूतो हरिः साक्षात् मत्स्यरूपेण केशवः॥',
    hindi_meaning: 'श्रीमत्स्य पुराण में भगवान श्रीहरि विष्णु के प्रथम मत्स्य अवतार का पावन चरित्र वर्णित है। जब प्रलयकाल के महाजलप्लावन में समस्त सृष्टि डूबने लगी थी, तब भगवान श्रीहरि ने मत्स्य रूप धारण करके राजा सत्यव्रत (वैवस्वत मनु), सप्तर्षियों, समस्त वनस्पतियों के बीजों और पवित्र वेदों की रक्षा की थी। इस पुराण में भगवान मत्स्य ने राजा मनु को सृष्टि-रचना, धर्म, कर्म, सदाचार और मोक्ष के परम सत्य का उपदेश दिया है।',
    english_translation: 'In the sacred Matsya Purana, the divine descent of Lord Shri Hari Vishnu as the Matsya (fish) avatar is revealed. During the cosmic deluge (Pralaya), Lord Matsya rescued King Satyavrata (Vaivasvata Manu), the Seven Sages (Saptarshis), cosmic life-seeds, and the sacred Vedas. Lord Matsya imparted supreme cosmic wisdom to King Manu, establishing that righteousness upholds the universe and truth alone triumphs.',
    context_intro_hi: 'जैसे श्रीमत्स्य पुराण में साक्षात् भगवान मत्स्य राजा सत्यव्रत (मनु) को प्रलय के महाजलप्लावन में धर्म और सत्य का रहस्य समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Lord Matsya illuminates cosmic wisdom and truth to King Satyavrata Manu during the great deluge in the Matsya Purana —',
    keywords: [
      'matsya puran', 'matsya puran me kya hai', 'matsya puran kya hai', 'matsya purana', 'matsya purana summary',
      'matsya puran ke baare me', 'matsya puran katha', 'matsyavatar', 'matsya avatar', 'matsya purana kya hai',
      'मत्स्य पुराण', 'मत्स्य पुराण में क्या है', 'मत्स्य पुराण क्या है', 'मत्स्य अवतार', 'मत्स्य पुराण का सार',
      'मत्स्य पुराण कथा', 'राजा मनु और मत्स्य', 'what is matsya purana', 'tell me about matsya puran',
      'matsya puran me kya likha hai', 'matsya puran details'
    ]
  },

  // 0E. Shiva Purana Core (भगवान शिव व माता पार्वती, विद्येश्वर व रुद्र संहिता, पाप-मुक्ति व शिव-भक्ति)
  {
    id: 'shiva_purana_core',
    scripture_id: 'shiva_purana',
    reference: 'श्री शिव पुराण (Shiva Purana · विद्येश्वर व रुद्र संहिता)',
    original_text: 'सर्वोत्तमस्य शैवस्य ते यास्यंति सुसद्गतिम्। यावच्छिवपुराणं हि नोदेष्यति जगत्यहो तावत्कलिमहोत्पाताः संचरिष्यन्ति निर्भयाः॥ श्लोकानां संख्यया सप्तसंहितं ब्रह्मसंमितम्। विद्येश्वराख्या तन्मुख्या द्वितीया रुद्रसंहिता॥',
    hindi_meaning: 'श्री शिव पुराण में साक्षात् भगवान सदाशिव की पराभक्ति, सृष्टि के प्राकट्य और जीवों के उद्धार का मार्ग वर्णित है। जब तक संसार में शिव पुराण का प्राकट्य नहीं होता, तब तक ही कलियुग के उत्पात निर्भय होकर विचरते हैं। इस पावन पुराण की सात संहिताएँ हैं (विद्येश्वर, रुद्र, शतरुद्र, कोटिरुद्र, उमा, कैलास व वायु संहिता)। इसके श्रवण और शिव-स्मरण से जीव समस्त पापों से मुक्त होकर परम सद्गति को प्राप्त करता है।',
    english_translation: 'In the sacred Shiva Purana, the supreme glory, grace, and eternal truth of Bhagavan Sadashiva are revealed. As long as the nectar of the Shiva Purana is not heard, the afflictions of Kaliyuga wander fearlessly. Comprising seven divine Samhitas (Vidyeshvara, Rudra, and others), this sacred scripture liberates the soul from all sins and confers ultimate spiritual realization and peace.',
    context_intro_hi: 'जैसे श्री शिव पुराण में भगवान सदाशिव की महिमा और कलियुग के संतापों के निवारण का पावन उपदेश है कि —',
    context_intro_en: 'Just as Bhagavan Sadashiva reveals the divine path of redemption and ultimate liberation in the Shiva Purana —',
    keywords: [
      'shiv puran', 'shiva puran', 'shiv purana', 'shiva purana', 'shiv puran me kya hai', 'shiva puran me kya hai',
      'shiv purana me kya hai', 'shiva purana me kya hai', 'what is in shiva purana', 'what is shiva purana',
      'tell me about shiv puran', 'tell me about shiva puran', 'shiv puran ka saransh', 'shiva purana summary',
      'शिव पुराण', 'शिव पुराण में क्या है', 'शिव पुराण क्या है', 'शिवपुराण का सार', 'शिवपुराण कथा', 'शिव पुराण उपदेश',
      'bholenath', 'har har mahadev', 'shiva grace', 'mahadev', 'rudra samhita', 'vidyeshvara samhita'
    ]
  },

  // 0F. Samaveda Core & Melody (साम-गान, दिव्य स्वर, भक्ति-संगीत व श्रीमद्भगवद्गीता १०.२२)
  {
    id: 'samaveda_core',
    scripture_id: 'samaveda',
    reference: 'सामवेद व श्रीमद्भगवद्गीता १०.२२ (Samaveda · भक्ति संगीत व दिव्य स्वर)',
    original_text: 'वेदानां सामवेदोऽस्मि देवानामस्मि वासवः। इन्द्रियाणां मनश्चास्मि भूतानामस्मि चेतना॥ अग्न आयाहि वीतये गृणानो हव्यदातये। नि होता सत्सि बर्हिषि॥',
    hindi_meaning: 'श्रीमद्भगवद्गीता में साक्षात् भगवान श्रीकृष्ण कहते हैं कि वेदों में मैं सामवेद हूँ। सामवेद समस्त वेदों का वह दिव्य संगीतमय स्वरूप है, जिसमें परमात्मा की स्तुति दिव्य स्वरों और साम-गान के माध्यम से की जाती है। सामवेद का सार यह है कि जब भक्त अपने मन, वाणी और स्वर को भगवत्भक्ति में लीन कर देता है, तब उसका अंतःकरण परम शांत होकर परमात्मा से एकाकार हो जाता है।',
    english_translation: 'In the Shrimad Bhagavad Gita, Lord Krishna proclaims: "Among the Vedas, I am the Samaveda." The Samaveda is the supreme musical and melodic manifestation of Vedic wisdom, wherein hymns are sung in transcendental devotion. Its essence teaches that when one unites heart and breath in divine remembrance, the soul attains supreme peace and divine communion.',
    context_intro_hi: 'जैसे साक्षात् भगवान श्रीकृष्ण सामवेद की दिव्यता प्रकट करते हुए और सामवेद के पावन मंगलाचरण में उपदेश है कि —',
    context_intro_en: 'Just as Lord Krishna reveals the divine musical glory of the Samaveda in the Bhagavad Gita and the opening Samaveda hymn proclaims —',
    keywords: [
      'saamved', 'samved', 'samaveda', 'saamveda', 'saamved ka sarash kya hai', 'saamved ka saransh', 'samved ka saransh',
      'samved me kya hai', 'saamved me kya hai', 'samaveda summary', 'what is in samaveda', 'what is samaveda',
      'tell me about samaveda', 'tell me about saamved', 'essence of samaveda', 'samaveda teachings',
      'सामवेद', 'सामवेद में क्या है', 'सामवेद का सार', 'सामवेद का सारांश', 'सामवेद क्या है', 'सामवेद की कथा',
      'soothing mind', 'musical devotion', 'kirtan', 'sangeet bhakti', 'nada brahma', 'distracted mind soothing',
      'restless heart music', 'melodic prayer', 'संगीत भक्ति', 'कीर्तन महिमा'
    ]
  },

  // 0G. Atharvaveda Core & Healing (दीर्घायु, पूर्ण आरोग्य, भय-निवारण व आयुर्वेद का मूल)
  {
    id: 'atharvaveda_core',
    scripture_id: 'atharvaveda',
    reference: 'अथर्ववेद १९.६७.१ व १९.६१ (Atharvaveda · दीर्घायु, आरोग्य व अभय सूक्त)',
    original_text: 'पश्येम शरदः शतं जीवेम शरदः शतं शृणुयाम शरदः शतं प्र ब्रवाम शरदः शतमदीनाः स्याम शरदः शतं भूयश्च शरदः शतात्॥ पूर्णायुः। तनूस्तन्वा मे सहे दतः सर्वमायुरशीय। स्योनं मे सीद पुरुः पृणस्व पवमानः स्वर्गे॥',
    hindi_meaning: 'अथर्ववेद में मानव जीवन की रक्षा, आरोग्य, दीर्घायु, भय-निवारण और परमात्मा की सर्वव्यापक कृपा का विशद वर्णन है। अथर्ववेद का यह पावन सूक्त प्रार्थना करता है कि हम सौ वर्षों तक स्वस्थ नेत्रों से देखें, सौ वर्षों तक पूर्ण आरोग्य के साथ जिएं, सौ वर्षों तक सद्ज्ञान सुनें, दीन-हीन न होकर स्वाभिमान और प्रभु-भक्ति से जिएं। अथर्ववेद लौकिक जीवन में रोगों, दुःखों और भयों से मुक्ति देकर आत्मा को पूर्ण अभय प्रदान करता है।',
    english_translation: 'The Atharvaveda illuminates divine healing, longevity, immunity from diseases, freedom from fear, and practical righteousness in daily life. Its quintessential hymn prays: "May we see for a hundred autumns, may we live for a hundred autumns, may we hear for a hundred autumns, speaking truthfully and living unvanquished in faith and vigor." It assures divine protection from all earthly distress and fears.',
    context_intro_hi: 'जैसे अथर्ववेद में पूर्ण आयु, आरोग्य और भय-निवारण का पावन सूक्त उपदेश करता है कि —',
    context_intro_en: 'Just as the Atharvaveda imparts the sacred prayer for health, longevity, and divine protection from all fear —',
    keywords: [
      'atharvaved', 'atharva veda', 'atharvaveda', 'atharvaved me kya hai', 'atharva veda me kya hai', 'atharvaved kya hai',
      'what is in atharvaveda', 'what is atharvaveda', 'atharvaveda summary', 'tell me about atharvaveda', 'essence of atharvaveda',
      'अथर्ववेद', 'अथर्ववेद में क्या है', 'अथर्ववेद क्या है', 'अथर्ववेद का सार', 'अथर्ववेद का सारांश', 'अथर्ववेद के उपदेश',
      'health', 'illness', 'disease', 'bimari', 'rog', 'sehat', 'swasthya', 'healing', 'body pain', 'fear of sickness',
      'longevity', 'deerghayu', 'ayurveda', 'protection from disease', 'immunity', 'sharir me rog', 'बीमारी', 'रोग', 'आरोग्य', 'स्वास्थ्य', 'दीर्घायु'
    ]
  },

  // 0H. Rigveda Core (गायत्री मंत्र, संगच्छध्वं सूक्त व वैदिक ज्ञान का उद्गम)
  {
    id: 'rigveda_core',
    scripture_id: 'rigveda',
    reference: 'ऋग्वेद ३.६२.१० व १०.१९१.२ (Rigveda · गायत्री व संगच्छध्वं सूक्त)',
    original_text: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥ संगच्छध्वं संवदध्वं सं वो मनांसि जानताम्। देवा भागं यथा पूर्वे सञ्जानाना उपासते॥',
    hindi_meaning: 'ऋग्वेद समस्त वेदों में सबसे प्राचीन और ज्ञान का मूल आधार है। इसमें साक्षात् गायत्री मंत्र और विश्व-एकता का संगच्छध्वं सूक्त निहित है। ऋग्वेद का सार है कि हम सब मिलकर चलें, एक स्वर में सत्य बोलें, हमारे हृदय और मन एकाकार हों, और परमपिता परमात्मा की दिव्य ज्योति हमारी बुद्धि को सन्मार्ग पर प्रेरित करे।',
    english_translation: 'The Rigveda is the most ancient fountainhead of divine cosmic wisdom, enshrining the universal Gayatri Mantra and the hymn of cosmic unity (Samgacchadhvam). It commands: "Walk together, speak together in harmony, let your minds comprehend truth together, and may the Divine Illuminator guide our intellect on the righteous path."',
    context_intro_hi: 'जैसे ऋग्वेद के पावन गायत्री व संगच्छध्वं सूक्त में उपदेश है कि —',
    context_intro_en: 'Just as the Rigveda reveals the supreme light of truth and universal harmony —',
    keywords: [
      'rigved', 'rigveda', 'rig veda', 'rigved me kya hai', 'rigveda me kya hai', 'what is in rigveda', 'what is rigveda',
      'tell me about rigveda', 'rigveda summary', 'ऋग्वेद', 'ऋग्वेद में क्या है', 'ऋग्वेद का सार', 'ऋग्वेद क्या है'
    ]
  },

  // 0I. Yajurveda Core (ईशावास्योपनिषद, त्यागपूर्वक उपभोग व शान्ति पाठ)
  {
    id: 'yajurveda_core',
    scripture_id: 'yajurveda',
    reference: 'यजुर्वेद (शुक्ल) ४०.१ व ३६.१८ (Yajurveda · ईशावास्योपनिषद व शान्ति सूक्त)',
    original_text: 'ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥ मित्रस्याहं चक्षुषा सर्वाणि भूतानि समीक्षे। मित्रस्य चक्षुषा समीक्षामहे॥',
    hindi_meaning: 'यजुर्वेद यज्ञ, कर्म, कर्तव्य और अंतरात्मा के समर्पण का शास्त्र है। इसका ४०वाँ अध्याय प्रसिद्ध ईशावास्योपनिषद है, जो सिखाता है कि इस चराचर जगत के कण-कण में परमात्मा व्याप्त हैं; अतः त्यागपूर्वक उपभोग करो और किसी के धन या वस्तु का लोभ मत करो। हम सभी प्राणियों को मित्र और बंधु की दृष्टि से देखें।',
    english_translation: 'The Yajurveda is the sacred scripture of righteous action, sacrifice, duty, and spiritual surrender. Its celebrated fortieth chapter (Ishavasya Upanishad) proclaims that the entire cosmos is enveloped by the Supreme Divine; therefore, live with detachment without coveting another’s possessions, and behold all living beings through the eyes of a loving friend.',
    context_intro_hi: 'जैसे यजुर्वेद में परमात्मा की सर्वव्यापकता और निष्काम कर्म का पावन उपदेश है कि —',
    context_intro_en: 'Just as the Yajurveda illuminates divine omnipresence and compassionate living —',
    keywords: [
      'yajurved', 'yajurveda', 'yajur veda', 'yajurved me kya hai', 'what is in yajurveda', 'what is yajurveda',
      'tell me about yajurveda', 'yajurveda summary', 'यजुर्वेद', 'यजुर्वेद में क्या है', 'यजुर्वेद का सार', 'यजुर्वेद क्या है'
    ]
  },
  {
    id: 'gita_3_8',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.८ (Bhagavad Gita 3.8)',
    original_text: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥',
    hindi_meaning: 'तुम अपने शास्त्रविहित कर्तव्य कर्म करो, क्योंकि कर्म न करने (आलस्य या अकर्मण्यता) की अपेक्षा कर्म करना श्रेष्ठ है। कर्म न करने से तो तुम्हारा शरीर-निर्वाह भी सिद्ध नहीं हो सकता।',
    english_translation: 'Perform your prescribed duties, for action is far superior to inaction. Without work, even the basic maintenance of your physical body is not possible.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण अकर्मण्यता व आलस्य का निवारण करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna dispels laziness and idleness in the Bhagavad Gita —',
    keywords: [
      'आलस', 'आलस्य', 'सुस्ती', 'प्रमाद', 'आलस आता है', 'आलस कैसे छोड़ें', 'काम करने का मन नहीं करता', 'बैठे रहना', 'अकर्म', 'अकर्मण्यता', 'काम टालना', 'सुस्ती दूर', 'कर्महीन',
      'laziness', 'lazy', 'procrastination', 'procrastinate', 'lethargy', 'inaction', 'lack of motivation', 'demotivated', 'overcome laziness', 'stop being lazy',
      'బద్ధకం', 'సోమరితనం', 'పనిచేయాలనిపించట్లేదు',
      'alas', 'aalas', 'alasya', 'alasya kaise dur kare', 'alas kaise chhode', 'alas kaise door kare', 'sustee', 'kam karne ka man nahi karta', 'procrastinating'
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
      'mehnat kar raha hu', 'safalta nahi mil rahi', 'fal nahi mil raha', 'hardwork', 'karm fal', 'karm ka phal', 'karm ka fal', 'karm ka phal kab milta hai', 'karm ka fal kab milta hai'
    ]
  },

  // 4. Restless Mind & Meditation (अभ्यासेन तु कौन्तेय)
  {
    id: 'gita_6_26_35',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ६.२६ व ६.३५ (Bhagavad Gita 6.26 & 6.35)',
    original_text: 'यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्। ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥ असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥',
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

  // 4B. Endurance of Bodily Pain & Fleeting Distress (मात्रास्पर्शास्तु कौन्तेय)
  {
    id: 'gita_2_14',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.१४ (Bhagavad Gita 2.14 · शारीरिक कष्ट व सुख-दुःख सहनशीलता)',
    original_text: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः। आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥',
    hindi_meaning: 'हे कुन्तीपुत्र! इन्द्रियों और उनके विषयों का संयोग ही शीत-उष्ण और सुख-दुःख को देने वाला है। ये सब आने-जाने वाले और अनित्य हैं; इसलिए हे भारत! तुम इन्हें धैर्यपूर्वक सहन करो।',
    english_translation: 'O son of Kunti, the contact of the senses with their objects gives rise to fleeting experiences of cold and heat, pleasure and pain. They are transient and impermanent; therefore, endure them patiently, O Bharata.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण शारीरिक कष्टों और सांसारिक द्वंद्वों को धैर्यपूर्वक सहने का उपदेश देते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna guides on enduring physical pain and transient suffering with fortitude in the Bhagavad Gita —',
    keywords: [
      'pain', 'physical pain', 'suffering', 'body pain', 'sickness', 'illness', 'bimari', 'kashth', 'dard', 'titiksha', 'endurance',
      'tolerance', 'sharir me dard', 'dard kaise sahe', 'kashth dur kare', 'shuk dukh', 'sukha dukkha', 'dheeraj', 'sharirik kasht',
      'कष्ट', 'शारीरिक कष्ट', 'दर्द', 'बीमारी और कष्ट', 'दुःख', 'सहनशीलता', 'तितिक्षा', 'धैर्य', 'शारीरिक पीड़ा', 'रोग कष्ट'
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
      'gussa aata hai', 'gussa kaise roke', 'krodh shant', 'krodh par kabu', 'krodh kaise kabu kare', 'krodh par kaise kabu karein', 'gusse par kabu', 'gussa kaise shant kare'
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

  // 12A1. Ramcharitmanas - Awakening Love for the Unseen Lord (जाने बिनु न होइ परतीती)
  {
    id: 'rcm_jane_binu_preeti',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस उत्तरकाण्ड ८९.३ (Ramcharitmanas · जाने बिनु न होइ परतीती)',
    original_text: 'जाने बिनु न होइ परतीती। बिनु परतीति होइ नहिं प्रीती॥ प्रीति बिना नहिं भगति दृढ़ाई। जिमि खगपति जल कै चिकनाई॥',
    hindi_meaning: 'श्रीरामचरितमानस में काकभुशुण्डि जी गरुड़ जी को समझाते हैं कि—परमात्मा के स्वरूप, गुणों, महिमा और लीलाओं को जाने बिना हृदय में सच्चा विश्वास (परतीति) जाग्रत नहीं होता, और विश्वास के बिना वास्तविक प्रेम (प्रीति) उत्पन्न नहीं हो सकता। और बिना प्रीति के भक्ति कभी सुदृढ़ नहीं हो सकती, जैसे जल के ऊपर तेल की चिकनाई कभी ठहरती नहीं। इसलिए भगवान को चर्मचक्षुओं से न देखने पर भी, संतों के मुख से उनकी लीलाओं का श्रवण करने और अनन्य नाम-जप करने से हृदय में साक्षात् भगवत्-प्रेम प्रकट हो जाता है।',
    english_translation: 'In the Ramcharitmanas (Uttar Kanda 89.3), Kakabhushundi reveals to Garuda: "Without knowing the Lord\'s divine nature and glory, unshakable faith (Paratiti) cannot awaken; and without faith, genuine divine love (Preeti) cannot blossom. Without love, devotion can never become steadfast, just as oiliness cannot adhere to water." Thus, even if physical eyes have not seen the Divine, hearing His glories from saints and taking refuge in His Holy Name directly ignites true divine love within the heart.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस के उत्तरकाण्ड में बिना देखे ईश्वर से प्रेम व विश्वास जागने का मर्म समझाते हुए कहा गया है कि —',
    context_intro_en: 'Just as the Ramcharitmanas reveals the secret of cultivating love and faith towards the unseen Divine —',
    keywords: [
      'जाने बिनु न होइ परतीती', 'बिनु परतीति होइ नहिं प्रीती', 'भगवान को देखा नहीं', 'भगवान को देखा ही नहीं',
      'unseen god', 'never seen god', 'love for god without seeing', 'how to love god',
      'jab hamne bhagwan ko dekha hi nahi', 'bhagwan ko dekha nahi to prem kaise', 'prem kaise ho sakta hai',
      'ईश्वर को देखा नहीं', 'अदृश्य भगवान', 'प्रेम कैसे हो', 'प्रीति', 'परतीति', 'भगति दृढ़ाई',
      'kakabhushundi', 'divine love', 'faith in god', 'how to love the divine'
    ]
  },

  // 12A2. Bhagavad Gita - Devotion to Unseen vs Loving the Personal Form (क्लेशोऽधिकतरस्तेषाम्)
  {
    id: 'gita_12_5_avyakta',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता १२.५ (Bhagavad Gita 12.5 · अव्यक्तासक्तचेतसाम्)',
    original_text: 'क्लेशोऽधिकतरस्तेषामव्यक्तासक्तचेतसाम्। अव्यक्ता हि गतिर्दुःखं देहवद्भिरवाप्यते॥',
    hindi_meaning: 'जिनका चित्त अव्यक्त (अदृश्य, निराकार) में लगा है, उनके साधन में क्लेश बहुत अधिक है; क्योंकि देहाभिमानियों के लिए अव्यक्त का मार्ग अत्यंत कठिनता से प्राप्त होता है। इसलिए भगवान के नाम, रूप, गुणों और लीलाओं का आश्रय लेकर साकार भाव से उनसे सहज व स्वाभाविक प्रेम किया जा सकता है।',
    english_translation: 'For those whose minds are attached to the unmanifest and unseen, the path is exceedingly fraught with hardship; for the unmanifest path is sorrowfully difficult for embodied souls to realize. Therefore, embracing the Lord through His sweet Names, attributes, and loving pastimes makes devotion natural and attainable.',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता के १२वें अध्याय में भगवान श्रीकृष्ण अनदेखे निराकार की तुलना में साकार प्रेम-भक्ति का सुगम मार्ग समझाते हुए कहते हैं कि —',
    context_intro_en: 'As Lord Krishna explains the difficulty of focusing upon the unseen unmanifest versus the loving path of devotion in Bhagavad Gita —',
    keywords: [
      'क्लेशोऽधिकतरस्तेषामव्यक्तासक्तचेतसाम्', 'अव्यक्ता हि गतिर्दुःखं', 'gita 12.5', 'avyakta', 'unseen god',
      'how to meditate on unseen', 'unmanifest', 'sakar prem', 'bhakti yoga'
    ]
  },

  // 12A3. Narada Bhakti Sutra - The Ineffable Sweetness of Divine Love (अमृतस्वरूपा च)
  {
    id: 'narada_bhakti_sutra_prem',
    scripture_id: 'narada_purana',
    reference: 'नारद भक्ति सूत्र २, ५४ (Narada Bhakti Sutra · अनिर्वचनीयं प्रेमस्वरूपम्)',
    original_text: 'सा त्वस्मिन् परमप्रेमरूपा। अमृतस्वरूपा च॥ अनिर्वचनीयं प्रेमस्वरूपम्। मूकास्वादनवत्॥',
    hindi_meaning: 'भक्ति वास्तव में परमात्मा के प्रति परम प्रेमरूपा और अमृतस्वरूपा है। यह विशुद्ध प्रेम वाणी से अनिर्वचनीय है, जैसे गूँगा व्यक्ति गुड़ खाकर उसके अद्भुत आनंद का शब्दों में वर्णन नहीं कर सकता। भगवान को आँखों से न देखकर भी जब नाम-जप और आर्त भाव से पुकारा जाता है, तो यह प्रेम स्वयं अंतरात्मा में प्रकट हो जाता है।',
    english_translation: 'Devotion is in the nature of supreme divine love, and it is sheer nectar. The intrinsic nature of divine love is ineffable, just like the experience of a mute person savoring sweet molasses. Even when the Divine is unseen by physical eyes, sincere chanting and surrender directly unveil His sweetness within the soul.',
    context_intro_hi: 'जैसे देवर्षि नारद भक्ति सूत्र में ईश्वर के प्रति अनिर्वचनीय प्रेम की पराकाष्ठा समझाते हुए कहते हैं कि —',
    context_intro_en: 'As Devarshi Narada reveals the ineffable nature of divine love in the Narada Bhakti Sutra —',
    keywords: [
      'नारद भक्ति सूत्र', 'परमप्रेमरूपा', 'अमृतस्वरूपा', 'अनिर्वचनीयं प्रेमस्वरूपम्', 'मूकास्वादनवत्',
      'narada bhakti sutra', 'ineffable love', 'pure devotion', 'anirvachaniya prem'
    ]
  },

  // 12B. Equality of All Souls, Gender Transcendence & God's Unconditional Love (पुरुष नपुंसक नारि वा जीव चराचर कोइ)
  {
    id: 'rcm_universal_love_equality',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस उत्तरकाण्ड ८७.२ व श्रीमद्भगवद्गीता ५.१८ (Ramcharitmanas & Gita · समदृष्टि व अहैतुक प्रेम)',
    original_text: 'पुरुष नपुंसक नारि वा जीव चराचर कोइ। सर्ब भाव भज कपट तजि मोहि परम प्रिय सोइ॥ विद्याविनयसम्पन्ने ब्राह्मणे गवि हस्तिनि। शुनि चैव श्वपाके च पण्डिताः समदर्शिनः॥',
    hindi_meaning: 'श्रीरामचरितमानस में साक्षात् भगवान श्री राम घोषणा करते हैं कि चाहे कोई पुरुष हो, नपुंसक (किन्नर/तृतीय लिंग) हो, नारी हो या कोई भी चराचर जीव हो—यदि वह कपट त्यागकर सच्चे भाव से मुझे भजता है, तो वह मुझे प्राणों से भी अधिक प्रिय है। श्रीमद्भगवद्गीता में भगवान कहते हैं कि ज्ञानीजन सभी जीवों में एक ही आत्म-तत्त्व को समान रूप से देखते हैं। परमात्मा शरीर की बनावट या लौकिक आकर्षण नहीं, केवल हृदय का विशुद्ध प्रेम और नाम-जप देखते हैं। शास्त्रों में किसी की स्वाभाविक प्रवृत्ति या समलैंगिकता के लिए कोई सजा या नरक नहीं है।',
    english_translation: 'In the Ramcharitmanas (Uttarkand 87.2), Lord Rama proclaims: "Be they male, female, transgender, or any living entity in creation—whoever surrenders deceit and loves Me sincerely is supremely dear to Me." In the Bhagavad Gita (5.18), Lord Krishna reveals that the wise perceive the same Divine Soul equally within all beings. The Divine does not judge bodily nature or physical attraction, but cherishes only purity of heart, selfless love, and devotion. There is no scriptural punishment for one’s inherent nature; only deceit and cruelty bind the soul.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में साक्षात् भगवान श्री राम समस्त जीवों के प्रति अपने समदर्शी व अहैतुक प्रेम की घोषणा करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Lord Rama declares His unconditional love for all souls irrespective of bodily form in the Ramcharitmanas —',
    keywords: [
      'gay', 'i am gay', 'i am a gay', 'homosexual', 'homosexuality', 'same sex', 'attracted to boys', 'attracted to men', 'like boys',
      'queer', 'lgbt', 'lgbtq', 'lesbian', 'transgender', 'gender identity', 'gay punishment', 'punishment for being gay', 'sexuality',
      'i like boys', 'as a boy i like boys', 'punishment is there in our scriptures', 'is there any punishment is there in our scriptures',
      'is there any punishment', 'garun puran me koi saja hai', 'kya iske liye garun puran me koi saja hai',
      'गे', 'समलैंगिक', 'लड़के पसंद हैं', 'सजा है क्या', 'गे होना पाप है क्या', 'किन्नर', 'समलैंगिकता', 'लड़का लड़के से प्यार', 'गरुड़ पुराण में कोई सजा'
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
      'యోగక్షేమం',
      'bhagwan raksha karenge', 'bhagwan sambhalenge', 'kya bhagwan raksha karenge', 'kya bhagwan meri raksha karenge', 'prabhu raksha karenge'
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

  // 22B. Valmiki Ramayana - Absolute Destruction of Coveting Another's Wife (विभीषण उपदेश - परदाराभिमर्शात्तु नान्यत् पापतरं महत्)
  {
    id: 'valmiki_ramayana_paradara',
    scripture_id: 'valmiki_ramayana',
    reference: 'वाल्मीकि रामायण युद्धकाण्ड ९.१२ (Valmiki Ramayana · परदाराभिमर्श महापाप निर्णय)',
    original_text: 'परदाराभिमर्शात्तु नान्यत् पापतरं महत्। प्रवृत्तं चेह तत्सर्वं तव पापकर्मिणः॥',
    hindi_meaning: 'वाल्मीकि रामायण में महात्मा विभीषण रावण को स्पष्ट चेतावनी देते हैं कि पराई विवाहित स्त्री की कामना करने या उस पर कुदृष्टि डालने से बढ़कर संसार में कोई दूसरा घोर व विनाशकारी पाप नहीं है। यह पाप व्यक्ति के संपूर्ण कुल, धर्म, यश और जीवन का समूल विनाश कर देता है।',
    english_translation: 'In Valmiki Ramayana (Yuddha Kanda 9.12), Vibhishana warns Ravana: "There is no sin in existence greater or more destructive than laying an eye or desire upon another\'s wife. This single transgression is the root of all ruin and total annihilation."',
    context_intro_hi: 'जैसे वाल्मीकि रामायण में विभीषण जी रावण को परस्त्री-कामना के भयानक परिणाम पर सचेत करते हुए कहते हैं कि —',
    context_intro_en: 'Just as Vibhishana explicitly warns Ravana on the fatal ruin of coveting another’s wife in Valmiki Ramayana —',
    keywords: [
      'परदाराभिमर्शात्तु नान्यत् पापतरं महत्', 'वाल्मीकि रामायण युद्धकाण्ड', 'परदाराभिमर्श', 'परदार',
      'विवाहित', 'विवाह', 'परनारी', 'परस्त्री', 'paradara', 'parastri', 'parnari',
      'married', 'extramarital', 'fidelity', 'forbidden craving', 'coveting another spouse',
      'vibhishana ravana', 'yuddha kanda 9'
    ]
  },

  // 22C. Padma Purana - Destruction of Accumulated Punya, Lifespan & Intellect (पद्म पुराण भूमिखण्ड ४१.२२)
  {
    id: 'padma_purana_paradara',
    scripture_id: 'padma_purana',
    reference: 'श्री पद्म पुराण भूमिखण्ड ४१.२२ (Padma Purana · परदार दोष व पुण्य-नाश)',
    original_text: 'परदाराभिमर्शेन हरते पुण्यमर्जितम्। आयुर्लक्ष्मीं यशः कीर्तिं प्रज्ञां चैव विनाशयेत्॥',
    hindi_meaning: 'पद्म पुराण में स्पष्ट विधान है कि पराई विवाहित स्त्री की कामना और संसर्ग मनुष्य के जन्म-जन्मांतर के संचित पुण्यों को हर लेता है। यह मनुष्य की आयु, लक्ष्मी (समृद्धि), यश, कीर्ति और बुद्धि (प्रज्ञा) का पूर्ण विनाश कर देता है।',
    english_translation: 'In Padma Purana (Bhumikhanda 41.22), it is proclaimed: "Entertaining desire for another’s wife robs a person of all accumulated Punya (merits across lifetimes), actively destroying longevity, prosperity (Lakshmi), social honor, reputation, and intellect (Prajna)."',
    context_intro_hi: 'जैसे श्री पद्म पुराण में परस्त्री-कामना से संचित पुण्य और बुद्धि के नाश पर स्पष्ट उपदेश है कि —',
    context_intro_en: 'Just as the Padma Purana reveals how desire for another’s spouse destroys accumulated spiritual merit —',
    keywords: [
      'परदाराभिमर्शेन हरते पुण्यमर्जितम्', 'पद्म पुराण', 'padma purana', 'परदार दोष', 'परदार',
      'विवाहित', 'परस्त्री', 'परनारी', 'paradara', 'parastri', 'parnari',
      'married', 'extramarital', 'fidelity', 'loss of merit', 'punya nasha', 'bhumikhanda 41'
    ]
  },

  // 22D. Chanakya Niti - The True Dharmic Benchmark (मातृवत् परदारेषु - चाणक्य नीति १२.१४)
  {
    id: 'chanakya_niti_matravat',
    scripture_id: 'chanakya_niti',
    reference: 'चाणक्य नीति १२.१४ (Chanakya Niti · मातृवत् परदारेषु)',
    original_text: 'मातृवत् परदारेषु परद्रव्येषु लोष्टवत्। आत्मवत् सर्वभूतेषु यः पश्यति स पण्डितः॥',
    hindi_meaning: 'जो मनुष्य पराई विवाहित स्त्री को अपनी माता के समान पवित्र दृष्टि से देखता है, दूसरे के धन को मिट्टी के ढेले के समान समझता है और सभी प्राणियों में अपनी ही आत्मा को देखता है—वही वास्तव में सच्चा ज्ञानी, पण्डित और धर्मात्मा है।',
    english_translation: 'In Chanakya Niti (12.14), the foundational Dharmic code is established: "He who looks upon another man\'s wife as his own mother, another\'s wealth as a clod of dirt, and treats all living beings as his own self—he alone is truly wise (Pandita)."',
    context_intro_hi: 'जैसे चाणक्य नीति में परस्त्री के प्रति परम पवित्र दृष्टि का धर्म समझाते हुए कहा गया है कि —',
    context_intro_en: 'Just as Chanakya Niti sets the inviolable Dharmic benchmark for moral character —',
    keywords: [
      'मातृवत् परदारेषु', 'चाणक्य नीति', 'chanakya niti', 'परद्रव्येषु लोष्टवत्', 'परदार',
      'विवाहित', 'परस्त्री', 'परनारी', 'paradara', 'parastri', 'parnari',
      'married', 'extramarital', 'purity of vision', 'mother', 'character', 'pandita',
      'having bad sights on another girls', 'bad sight on girls', 'bad sights on girls',
      'looking at girls with lust', 'gandi nazar', 'buri nazar', 'purity of gaze',
      'drishti dosha', 'seeing girls with lust', 'respect for women'
    ]
  },

  // 22D2. Shri Ramcharitmanas - Looking Upon Other Women as Mother (जननी सम जानहिं पर नारी - अयोध्याकाण्ड १२९.२)
  {
    id: 'rcm_purity_of_sight_mother',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस अयोध्याकाण्ड १२९.२ (Ramcharitmanas · परनारी मातृवत दृष्टि)',
    original_text: 'जननी सम जानहिं पर नारी। तिन्ह के मन सुभ सदन तुम्हारे॥ पर धन पत्थर सरिस लुकाहीं। जिन्हहि न लोभ न क्रोध बियाहीं॥',
    hindi_meaning: 'श्रीरामचरितमानस में महर्षि वाल्मीकि भगवान श्रीराम से कहते हैं कि हे राघव! जो मनुष्य पराई स्त्रियों को अपनी माता के समान परम पवित्र दृष्टि से देखते हैं, पराये धन को मिट्टी का ढेला समझते हैं, और जिनके अंतःकरण में न लोभ है न क्रोध—उन निष्काम, शीलवान और पवित्र भक्तों के हृदय ही आपके निवास करने योग्य दिव्य मंदिर हैं।',
    english_translation: 'In Shri Ramcharitmanas (Ayodhyakanda 129.2), Sage Valmiki reveals the supreme sanctified dwelling for Lord Rama: "Those noble devotees who look upon all women outside wedlock with the sacred, immaculate reverence of their own mother, who view another\'s wealth as mere worthless stone, and whose hearts are free from greed and wrath—in their pure hearts, O Lord Rama, take up Your eternal divine abode."',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में महर्षि वाल्मीकि भगवान श्रीराम के दिव्य निवास का रहस्य बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Sage Valmiki describes the pure hearts worthy of Lord Rama\'s dwelling in Shri Ramcharitmanas —',
    keywords: [
      'जननी सम जानहिं पर नारी', 'रामचरितमानस अयोध्याकाण्ड', 'rcm 129.2', 'par nari matrivat',
      'having bad sights on another girls', 'bad sight on girls', 'bad sights on girls',
      'looking at girls with lust', 'lustful eyes', 'gandi nazar', 'buri nazar',
      'gandi drishti', 'drishti dosha', 'purity of sight', 'purity of gaze',
      'seeing girls', 'looking at other girls', 'respecting women', 'nari samman',
      'परनारी', 'मातृवत', 'पवित्र दृष्टि', 'बुरी नजर', 'लड़कियों पर बुरी नजर'
    ]
  },

  // 22E. Bhagavad Gita - Lust as the Ultimate All-Devouring Enemy & Gate to Ruin (काम एष क्रोध एष - ३.३७ व १६.२१)
  {
    id: 'gita_3_37_16_21_kama',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता ३.३७ व १६.२१ (Bhagavad Gita · काम वैरी व नरक के तीन द्वार)',
    original_text: 'काम एष क्रोध एष रजोगुणसमुद्भवः। महाशनो महापाप्मा विद्ध्येनमिह वैरिणम्॥ त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः। कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥',
    hindi_meaning: 'भगवान श्रीकृष्ण कहते हैं कि यह अनियंत्रित काम (अंधा आकर्षण व वासना) ही महापापी और सर्वभक्षी शत्रु है। काम, क्रोध और लोभ—ये आत्मा का नाश करने वाले नरक के तीन मुख्य द्वार हैं। अतः इस अनधिकार आकर्षण को वासना का जाल समझकर तुरंत त्याग देना चाहिए।',
    english_translation: 'In Bhagavad Gita (3.37 & 16.21), Lord Krishna warns: "This lust/craving (Kama), born of the mode of passion, is all-devouring and greatly sinful; know it to be the ultimate enemy in this world. Lust, anger, and greed are the three gates to self-destruction; therefore, one must abandon them."',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण काम-वासना को आत्मा का परम शत्रु बताते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna reveals the destructive nature of forbidden craving in the Bhagavad Gita —',
    keywords: [
      'काम एष क्रोध एष', 'महाशनो महापाप्मा', 'त्रिविधं नरकस्येदं द्वारं', 'गीता ३.३७', 'gita 3.37', 'gita 16.21',
      'काम वासना', 'कामासक्ति', 'परस्त्री', 'paradara', 'lust', 'forbidden craving', 'three gates', 'kama krodha lobha',
      'having bad sights on another girls', 'bad sight on girls', 'bad sights on girls',
      'looking at girls with lust', 'lustful eyes', 'gandi nazar', 'buri nazar',
      'drishti dosha', 'seeing girls with lust', 'control lust', 'vasana par niyantran'
    ]
  },

  // 22F. Controlling Attachment & Overcoming Forbidden Desires (ध्यायतो विषयान्पुंसः - श्रीमद्भगवद्गीता २.६२-६३)
  {
    id: 'gita_2_62_63',
    scripture_id: 'bhagavad_gita',
    reference: 'श्रीमद्भगवद्गीता २.६२-६३ (Bhagavad Gita 2.62-63 · आसक्ति, काम व मर्यादा)',
    original_text: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥ क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥',
    hindi_meaning: 'विषयों व अनधिकार संबंधों का निरंतर चिंतन करने से आसक्ति उत्पन्न होती है। आसक्ति से तीव्र कामना और कामना में बाधा आने पर विक्षोभ व अशांति उत्पन्न होती है। इससे विवेक और मर्यादा का नाश हो जाता है। अतः मन को मर्यादा में बांधकर प्रभु-आश्रय लेना ही कल्याण का मार्ग है।',
    english_translation: 'In Bhagavad Gita (2.62–63), Lord Krishna explains: "By constantly contemplating on forbidden desire, deep attachment arises. From attachment springs burning passion (Kama). When desire is blocked, frustration arises; from delusion comes loss of discernment, and finally total ruin. True peace lies in self-mastery."',
    context_intro_hi: 'जैसे श्रीमद्भगवद्गीता में भगवान श्रीकृष्ण आसक्ति और कामना के पतनकारी वेग को समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Bhagavan Shri Krishna warns against the destructive progression of obsessive desire in the Bhagavad Gita —',
    keywords: [
      'ध्यायतो विषयान्पुंसः', 'श्रीमद्भगवद्गीता 2.62-63', 'गीता २.६२', 'gita 2.62', 'gita 2.63',
      'परस्त्री', 'paradara', 'attachment', 'obsession', 'spiral of desire', 'buddhi nasha', 'forbidden craving',
      'having bad sights on another girls', 'bad sights on girls', 'looking at girls with lust',
      'attraction to girls', 'mind wandering on girls', 'restless gaze'
    ]
  },

  // 22G. Garuda Purana & Mahabharata - Karmic Retribution & Loss of Life Force (तप्तं लोहमयं स्तम्भं व अनुशासन पर्व)
  {
    id: 'garuda_purana_paradara_stambha',
    scripture_id: 'garuda_purana',
    reference: 'श्री गरुड़ पुराण व महाभारत (Garuda Purana & Mahabharata · परदार कर्म विपाक)',
    original_text: 'तप्तं लोहमयं स्तम्भं परस्त्रीगः समालिङ्गेत्। न हीदृशमनायुष्यं लोके किञ्चन विद्यते यादृशं पुरुषस्येह परदारोपसेवनम्॥',
    hindi_meaning: 'गरुड़ पुराण व महाभारत (अनुशासन पर्व १०४.२१) में स्पष्ट चेतावनी है कि पराई विवाहित स्त्री की कामना करने वाले की आत्मा को तीव्र संताप और पश्चाताप भोगना पड़ता है। संसार में पराई स्त्री के संसर्ग के समान आयु, ओज और तेज का नाश करने वाला कोई दूसरा अधर्म नहीं है।',
    english_translation: 'In Garuda Purana (Preta Kalpa) and Mahabharata (Anushasana Parva 104.21): "The soul that pursues another’s spouse is made to embrace a burning iron pillar in Yama\'s realm. In all the worlds, there is nothing that shortens life-span and destroys vitality so thoroughly as consorting with another\'s wife."',
    context_intro_hi: 'जैसे श्री गरुड़ पुराण व महाभारत में परस्त्री-कामना के घोर कर्म-विपाक पर सचेत करते हुए कहा गया है कि —',
    context_intro_en: 'Just as Garuda Purana and Mahabharata warn against the severe karmic retribution of breaching another’s marriage —',
    keywords: [
      'तप्तं लोहमयं स्तम्भं परस्त्रीगः समालिङ्गेत्', 'गरुड़ पुराण परस्त्री', 'garuda purana paradara', 'न हीदृशमनायुष्यं',
      'परदारोपसेवनम्', 'विवाहित', 'परस्त्री', 'परनारी', 'paradara', 'parastri', 'parnari',
      'married', 'extramarital', 'iron pillar', 'yama', 'karmic retribution', 'anushasana 104'
    ]
  },

  // 22H. Valmiki Ramayana - Rama's Verdict to Vali (Kishkindha Kanda 18.18-19, Ruma/maryada danda)
  {
    id: 'valmiki_ramayana_vali_vadha',
    scripture_id: 'valmiki_ramayana',
    reference: 'वाल्मीकि रामायण किष्किन्धाकाण्ड १८.१८-१९ (Valmiki Ramayana · Vali-vadha maryada)',
    original_text: 'भार्यायां यः प्रवर्तेत कनीयान्यस्य वै सुतः। गमनेन सुतस्त्रीं वा स्नुषां वा पापकर्मिणः। दण्डो वध इह स्मृतः॥',
    hindi_meaning: 'श्रीराम सुग्रीव की पत्नी रूमा का हरण करने वाले वालि से कहते हैं कि जो व्यक्ति पराई पत्नी, पुत्रवधू या शिष्य-पत्नी की मर्यादा तोड़ता है, वह पापकर्मी है और धर्मशास्त्र में उसके लिए वध-दण्ड स्मृत है, क्योंकि वह गृहस्थ धर्म के पवित्र विश्वास को नष्ट करता है।',
    english_translation: 'Rama declares to Vali: whoever violates another’s wife, daughter-in-law or disciple’s wife breaks the sacred trust of household dharma and incurs the highest punishment under natural law.',
    context_intro_hi: 'जैसे वाल्मीकि रामायण में श्रीराम वालि को परस्त्री-हरण की मर्यादा समझाते हुए कहते हैं कि —',
    context_intro_en: 'Just as Sri Rama lays down the inviolable law of marital sanctity before Vali in Valmiki Ramayana —',
    keywords: [
      'भार्यायां यः प्रवर्तेत', 'किष्किन्धा 18', 'वालि वध', 'रूमा', 'vali', 'ruma', 'दण्डो वध', 'सुग्रीव',
      'विवाहित', 'परस्त्री', 'परनारी', 'paradara', 'parastri', 'married', 'extramarital', 'household dharma'
    ]
  },

  // 22I. Shiva Purana - Chandra-Tara transgression (Kotirudra, Mahapataka, Kshaya Roga)
  {
    id: 'shiva_purana_chandra_tara',
    scripture_id: 'shiva_purana',
    reference: 'श्री शिव पुराण कोटिरुद्र संहिता (Shiva Purana · Chandra-Tara Mahapataka)',
    original_text: 'गुरुपत्नीं न हरेत् क्वचित् महापातकमेव तत्। चन्द्रः क्षयरोगेण ग्रस्तो बभूव तारया सह॥',
    hindi_meaning: 'शिव पुराण में चन्द्रमा द्वारा गुरु बृहस्पति की पत्नी तारा का हरण महापातक कहा गया है। तारा के reciprocation के बाद भी तारकामय युद्ध हुआ और चन्द्रमा क्षय रोग से ग्रस्त होकर समस्त तेज खो बैठे — परस्पर आकर्षण भी इस पाप के क्षयकारी परिणाम से नहीं बचाता।',
    english_translation: 'Shiva Purana recounts Chandra abducting Tara, wife of Guru Brihaspati, as a Mahapataka. Despite mutual attraction it caused the Tarakamaya war, and Chandra was struck with wasting decay, losing all brilliance.',
    context_intro_hi: 'जैसे श्री शिव पुराण में चन्द्र-तारा प्रसंग से परस्त्री-कामना को महापातक बताते हुए कहा गया है कि —',
    context_intro_en: 'Just as the Shiva Purana holds up the Chandra-Tara fall as proof that mutual attraction never shields paradara desire —',
    keywords: [
      'चन्द्र तारा', 'chandra tara', 'tarakamaya', 'क्षय रोग', 'kshaya roga', 'महापातक', 'mahapataka', 'गुरु पत्नी', 'brihaspati',
      'विवाहित', 'परस्त्री', 'परनारी', 'paradara', 'married', 'guru wife', 'cosmic war'
    ]
  },

  // 22J. Mahabharata/Manusmriti - Destruction of vitality (Anushasana Parva 104.21)
  {
    id: 'mahabharata_anushasana_paradara',
    scripture_id: 'mahabharata',
    reference: 'महाभारत अनुशासन पर्व १०४.२१ व मनुस्मृति (Mahabharata · आयु-ओज नाश)',
    original_text: 'न हीदृशमनायुष्यं लोके किञ्चन विद्यते। यादृशं पुरुषस्येह परदारोपसेवनम्॥',
    hindi_meaning: 'महाभारत व मनुस्मृति का स्पष्ट विधान है कि संसार में पराई स्त्री के सेवन के समान आयु, ओज और तेज का नाश करने वाला कोई दूसरा अधर्म नहीं है।',
    english_translation: 'Mahabharata and Manusmriti: nothing shortens life and destroys vitality so thoroughly as consorting with another’s wife.',
    context_intro_hi: 'जैसे महाभारत व मनुस्मृति में परदार-सेवन से आयु और ओज के नाश पर कहा गया है कि —',
    context_intro_en: 'Just as Mahabharata and Manusmriti warn that nothing destroys life-force like breaching another’s marriage —',
    keywords: [
      'न हीदृशमनायुष्यं', 'परदारोपसेवनम्', 'अनुशासन पर्व 104', 'anushasana 104', 'manusmriti paradara', 'आयु नाश', 'vitality destroyed',
      'विवाहित', 'परस्त्री', 'paradara', 'married', 'lifespan', 'bhishma yudhishthira'
    ]
  },

  // 22K. Vidura Niti - Slaughterhouses of intellect (Udyoga Parva 33.66)
  {
    id: 'vidura_niti_paradara_33_66',
    scripture_id: 'vidura_niti',
    reference: 'विदुर नीति उद्योग पर्व ३३.६६ (Vidura Niti · बुद्धि के वधस्थान)',
    original_text: 'परदाराभिमर्शश्च सुहृदां च विसर्जनम्। अहङ्कारश्च त्रीण्येव वधस्थानानि चेतसः॥',
    hindi_meaning: 'महात्मा विदुर कहते हैं कि परस्त्री की कामना, सच्चे मित्रों का त्याग और अहंकार — ये तीनों बुद्धि और आत्मा के वधस्थान (slaughterhouses) हैं।',
    english_translation: 'Vidura: violating another’s wife, betraying loyal friends, and arrogance — these three are the slaughterhouses of intellect and soul.',
    context_intro_hi: 'जैसे विदुर नीति में परदार-कामना को बुद्धि का वधस्थान बताते हुए कहा गया है कि —',
    context_intro_en: 'Just as Vidura names paradara desire among the three slaughterhouses of the intellect —',
    keywords: [
      'परदाराभिमर्शश्च', 'वधस्थानानि चेतसः', 'विदुर नीति 33', 'vidura niti paradara', 'slaughterhouses of intellect',
      'विवाहित', 'परस्त्री', 'paradara', 'married', 'arrogance', 'betraying friends', 'udyoga parva'
    ]
  },

  // 22L. Srimad Bhagavatam - Tamisra retribution (Canto 5.26.20)
  {
    id: 'bhagavata_tamisra_paradara',
    scripture_id: 'bhagavata_purana',
    reference: 'श्रीमद्भागवतम् ५.२६.२० (Bhagavatam · तामिस्र नरक)',
    original_text: 'यस्तु परदारं परद्रव्यं वा हरेत् स तामिस्रे पात्यते यमदूतैः।',
    hindi_meaning: 'श्रीमद्भागवतम् में वर्णन है कि पराई पत्नी या पराए संबंध का हरण करने वाली आत्मा को यमदूत तामिस्र नरक में डालते हैं, जहाँ घोर संताप से आध्यात्मिक प्रगति पूर्णतः अवरुद्ध हो जाती है।',
    english_translation: 'Bhagavatam: one who seizes another’s spouse is cast by Yama’s messengers into Tamisra hell, where torment halts all spiritual progress.',
    context_intro_hi: 'जैसे श्रीमद्भागवतम् में परदार-हरण की तामिस्र गति पर कहा गया है कि —',
    context_intro_en: 'Just as Srimad Bhagavatam describes the Tamisra fate of those who breach marital sanctity —',
    keywords: [
      'तामिस्र', 'tamisra', 'भागवतम् 5.26', 'bhagavatam tamisra', 'यमदूत', 'illicit relations hell',
      'विवाहित', 'परस्त्री', 'paradara', 'married', 'yama messengers', 'shuka parikshit'
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
  },

  // 29. Ramcharitmanas - Primacy of Righteous Action (कर्म प्रधान विश्व करि राखा)
  {
    id: 'rcm_karma_pradhan',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस अयोध्याकाण्ड (Ramcharitmanas Ayodhyakand)',
    original_text: 'कर्म प्रधान विश्व करि राखा। जो जस करइ सो तस फलु चाखा॥',
    hindi_meaning: 'भगवान ने इस संसार को कर्म-प्रधान बनाया है; जो मनुष्य जैसा निष्काम या सकाम कर्म करता है, उसे वैसा ही फल प्राप्त होता है। अतः निराश न होकर पवित्र भाव से अपना कर्तव्य करें।',
    english_translation: 'The Supreme Lord has structured this cosmic realm on the sovereign principle of Karma; whatever effort one sows with purity, that is what unfolds in divine justice. Do not be dejected by delays, but persevere with an honest, devoted heart.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में गोस्वामी तुलसीदास जी कर्म की सर्वोच्च महिमा स्पष्ट करते हैं —',
    context_intro_en: 'As Goswami Tulsidas Ji proclaims the foundational truth of Karma in the Shri Ramcharitmanas —',
    keywords: [
      'कर्म प्रधान', 'विश्व करि राखा', 'karma pradhan', 'hard work', 'success', 'effort', 'फल की चिंता', 'कामयाबी',
      'struggle', 'delayed success', 'मेहनत', 'परिश्रम', 'karmic justice', 'sovereign karma'
    ]
  },

  // 30. Ramcharitmanas - Transcending Frustration & Blame (काहु न कोउ सुख दुख कर दाता)
  {
    id: 'rcm_kahu_na_kou',
    scripture_id: 'ramcharitmanas',
    reference: 'श्रीरामचरितमानस अयोध्याकाण्ड (Ramcharitmanas Ayodhyakand)',
    original_text: 'काहु न कोउ सुख दुख कर दाता। निज कृत करम भोग सबु भ्राता॥',
    hindi_meaning: 'हे भाई! कोई दूसरा किसी को सुख या दुःख देने वाला नहीं है; सब अपने ही किए हुए कर्मों का फल भोगते हैं। अतः दूसरों को या भाग्य को दोष न देकर प्रभु के भरोसे कर्म करें।',
    english_translation: 'No external agency is the giver of our joy or sorrow; we experience the fruit of our own past actions. Blame neither fate nor others, but anchor your effort in devotion to Shri Raghunatha.',
    context_intro_hi: 'जैसे श्रीरामचरितमानस में लक्ष्मण जी निषादराज को कर्म-गति का बोध कराते हुए कहते हैं —',
    context_intro_en: 'As Shri Lakshmana reveals the deep spiritual science of karma in Ramcharitmanas —',
    keywords: [
      'काहु न कोउ सुख दुख कर दाता', 'sukha dukha', 'karma bhoga', 'hard work frustration', 'blaming others',
      'fate', 'destiny', 'प्रारब्ध', 'पुरुषार्थ', 'disappointment'
    ]
  },

  // 31. Chanakya Niti / Hitopadesha - The Power of Relentless Hard Work (उद्यमेन हि सिध्यन्ति)
  {
    id: 'chanakya_udyam',
    scripture_id: 'chanakya_niti',
    reference: 'चाणक्य नीति व हितोपदेश (Chanakya Niti · Hitopadesha)',
    original_text: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः। न हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥',
    hindi_meaning: 'सारे कार्य उद्यम (सच्चे परिश्रम) से ही सिद्ध होते हैं, केवल मन के संकल्पों या इच्छाओं से नहीं। जैसे सोते हुए सिंह के मुख में हिरण स्वयं प्रवेश नहीं करते।',
    english_translation: 'All noble undertakings reach fulfillment through steadfast hard work (udyoga), never by mere daydreaming or wishful thinking; prey never enters into the mouth of a sleeping lion on its own.',
    context_intro_hi: 'जैसे चाणक्य नीति और हितोपदेश में पुरुषार्थ व कर्तव्य का उद्घोष किया गया है —',
    context_intro_en: 'As declared in Chanakya Niti and Hitopadesha regarding the supreme necessity of relentless honest effort —',
    keywords: [
      'उद्यमेन हि सिध्यन्ति', 'कार्य', 'मनोरथ', 'udyam', 'hard work', 'success', 'perseverance', 'karya siddhi',
      'सफलता', 'मेहनत का फल', 'working hard', 'effort', 'achieve goals'
    ]
  },

  // 32. Patanjali Yoga Sutras - Cultivating Long-Term Dedicated Practice (स तु दीर्घकालनैरन्तर्य)
  {
    id: 'yogasutra_abhyasa',
    scripture_id: 'patanjali_yoga_sutra',
    reference: 'पातञ्जल योगसूत्र १.१४ (Patanjali Yoga Sutras 1.14)',
    original_text: 'स तु दीर्घकालनैरन्तर्यसत्कारासेवितो दृढभूमिः॥',
    hindi_meaning: 'वह अभ्यास या कर्म जब दीर्घकाल तक, बिना किसी रुकावट के (निरंतर), और पूर्ण श्रद्धा-सत्कार के साथ किया जाता है, तभी वह दृढ़ स्थिति वाला और सफल बनता है।',
    english_translation: 'Consistent effort and spiritual discipline become firmly rooted and victorious only when cultivated over a prolonged period, without interruption, and with reverent, devoted dedication.',
    context_intro_hi: 'जैसे महर्षि पतंजलि योगसूत्र में निरंतर और निष्ठावान कर्म की सफलता का रहस्य बताते हैं —',
    context_intro_en: 'As Maharshi Patanjali explains the true foundation of lasting mastery and success in the Yoga Sutras —',
    keywords: [
      'दीर्घकाल', 'नैरन्तर्य', 'सत्कार', 'abhyasa', 'consistency', 'patience', 'hard work not succeeding',
      'perseverance', 'धैर्य', 'निरंतर अभ्यास', 'continuous effort', 'unbroken discipline'
    ]
  },

  // 33. Shrimad Bhagavata Purana - Grace and Surrender in Hardship (तत्तेऽनुकम्पां सुसमीक्षमाणो)
  {
    id: 'sb_tatte_anukampam',
    scripture_id: 'srimad_bhagavatam',
    reference: 'श्रीमद्भागवत महापुराण १०.१४.८ (Shrimad Bhagavata Purana 10.14.8)',
    original_text: 'तत्तेऽनुकम्पां सुसमीक्षमाणो भुञ्जान एवात्मकृतं विपाकम्। हृद्वाग्वपुर्भिर्विदधन्नमस्ते जीवेत यो मुक्तिपदे स दायभाक्॥',
    hindi_meaning: 'जो साधक अपने कर्मों के फल या कठिनाइयों को प्रभु की पावन कृपा मानकर हृदय, वाणी और शरीर से प्रभु को नमन करते हुए जीवन जीता है, वह निश्चय ही मुक्ति और शांति का अधिकारी बन जाता है।',
    english_translation: 'One who patiently awaits the divine grace, enduring hardships as the purifying fruition of past karmas while bowing with heart, speech, and body, becomes the rightful inheritor of liberation and inner peace.',
    context_intro_hi: 'जैसे श्रीमद्भागवत महापुराण में ब्रह्मा जी भगवान श्रीकृष्ण की स्तुति करते हुए कहते हैं —',
    context_intro_en: 'As Lord Brahma praises the Supreme Lord in the Shrimad Bhagavata Purana regarding patient surrender —',
    keywords: [
      'तत्तेऽनुकम्पां', 'विपाक', 'bhagavatam', 'grace in hardship', 'delayed success', 'surrender',
      'अनुकम्पा', 'सहनशीलता', 'प्रभु कृपा', 'patience in struggle'
    ]
  },

  // 34. Katha Upanishad - Arise, Awake, Tread the Path of Truth (उत्तिष्ठत जाग्रत)
  {
    id: 'katha_uttishthata',
    scripture_id: 'katha_upanishad',
    reference: 'कठोपनिषद् १.३.१४ (Katha Upanishad 1.3.14)',
    original_text: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत। क्षुरस्य धारा निशिता दुरत्यया दुर्गं पथस्तत्कवयो वदन्ति॥',
    hindi_meaning: 'उठो! जागो! और श्रेष्ठ महापुरुषों की संगति पाकर आत्मज्ञान और सत्य को जानो। ज्ञानियों का कहना है कि सत्य और कर्तव्य का मार्ग छुरे की तीखी धार के समान अत्यंत दुर्गम है, फिर भी धैर्यवान इसे पार कर लेते हैं।',
    english_translation: 'Arise! Awake! Seek the counsel of the wise and realize the supreme truth! The path of relentless right action is as sharp as a razor’s edge and difficult to tread, yet the steadfast walk it to glory.',
    context_intro_hi: 'जैसे कठोपनिषद् में यमराज नचिकेता को परम पुरुषार्थ का उपदेश देते हुए कहते हैं —',
    context_intro_en: 'As the sacred Katha Upanishad issues the eternal clarion call for fearless determination —',
    keywords: [
      'उत्तिष्ठत जाग्रत', 'कठोपनिषद', 'katha upanishad', 'arise awake', 'determination', 'resolve',
      'hard work', 'कर्तव्य पथ', 'never give up', 'razor edge', 'courage'
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

  // Simple routine queries like 'how are you'
  const casualQuestions = /^(?:आप\s*कैसे\s*हैं|कैसे\s*हो|सब\s*ठीक\s*है|हाल\s*चाल|how\s*are\s*you|who\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do)$/i;
  if (casualQuestions.test(stripped) || casualQuestions.test(clean)) return true;

  return false;
}

const RAG_ENDPOINT = 'http://54.252.47.101/rag/search';

/**
 * Queries the live SOTA 1024-d Qdrant Vector Database on AWS
 * Executes intfloat/multilingual-e5-large semantic search in sub-250ms
 * Retrieves top 5 candidates for intelligent model evaluation
 */
async function queryOracleVectorRAG(query) {
  if (typeof fetch === 'undefined') return [];

  const controller = new AbortController();
  // Extended timeout: 12000ms ensures AWS Qdrant multilingual-e5 search never aborts prematurely
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let scriptureFilter = 'all';
  if (/(गीता|gita|geeta|भगवद्गीता)/i.test(query)) {
    scriptureFilter = 'gita';
  } else if (/(रामायण|ramayan|रामचरित|ramcharitmanas|मानस|वाल्मीकि|vibhishan|ravana|रावण|विभीषण|लङ्का|लंका|sita|सीता|hanuman|हनुमान)/i.test(query)) {
    scriptureFilter = 'ramayana';
  } else if (/(ऋग्वेद|सामवेद|यजुर्वेद|अथर्ववेद|वेद|veda|vedas|rigved|yajurved|samved|saamved|atharvaved)/i.test(query)) {
    scriptureFilter = 'veda';
  } else if (/(शिव\s*पुराण|shiv\s*puran|shiva\s*puran)/i.test(query)) {
    scriptureFilter = 'purana';
  } else if (/(पुराण|puran|purana|भागवत|bhagavatam|देवी|विष्णु|अग्नि|गरुड़|गरुण|garud|garun|वामन|कूर्म|मत्स्य|स्कन्द|नारद)/i.test(query)) {
    scriptureFilter = 'purana';
  } else if (/(महाभारत|mahabharata)/i.test(query)) {
    scriptureFilter = 'mahabharata';
  }

  const cleanQ = normalizeQuery(query);

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
        top_k: 8
      })
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const rawCandidates = Array.isArray(data.results) ? data.results : [];

    const validCandidates = [];
    for (const c of rawCandidates) {
      if (!c || !c.original_text) continue;
      // Calibrated Hybrid Quality Floor:
      // AWS gateway computes dense vector_score (E5-large), rerank_score (BGE/FlashRank), and blended_score.
      // 1. If vector similarity is strong (>= 0.76), retain candidate even if cross-encoder had conversational English penalty.
      // 2. If rerank_score is confident (>= 0.20), retain candidate.
      // 3. Reject only if BOTH dense vector (< 0.60) and rerank (< 0.20) confirm lack of relevance.
      const vecScore = c.score ?? c.vector_score ?? 0;
      const rrScore = c.rerank_score ?? c.rerankScore ?? null;
      const blScore = c.blended_score ?? c.blendedScore ?? (rrScore !== null ? (0.65 * Number(rrScore) + 0.35 * Number(vecScore)) : vecScore);

      if (vecScore < 0.60 && (rrScore === null || Number(rrScore) < 0.20)) continue;
      if (rrScore !== null && Number(rrScore) < 0.10 && Number(vecScore) < 0.78) continue;

      const hindiMean = (c.hindi_meaning || '').trim();
      const engMean = (c.english_translation || '').trim();
      if (hindiMean.length < 6 && engMean.length < 6) continue;

      const scriptureId = c.scripture_id || ((c.reference || '').toLowerCase().includes('gita') ? 'bhagavad_gita' : (c.collection || 'sacred_text').replace('scripture_', ''));
      const effectiveScore = Number(Math.max(vecScore, blScore, Number(rrScore || 0)).toFixed(4));

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
        blended_score: blScore,
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
  'kaise', 'kare', 'karein', 'karta', 'karti', 'karo', 'karna', 'karke',
  'door', 'dur', 'hota', 'hoti', 'hote', 'hai', 'hain', 'ho', 'hoon', 'hun',
  'nahi', 'nahin', 'mat', 'chahiye', 'batao', 'bataiye', 'kya', 'kyu', 'kyun',
  'meri', 'mera', 'mere', 'hum', 'hume', 'hame', 'aap', 'apka', 'apki', 'apne',
  'how', 'what', 'why', 'when', 'where', 'who', 'stop', 'overcome', 'from', 'with', 'and', 'the'
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
    const isGarudaQuery = /(garu[dn]\s*puran|गरु[ड़ण]\s*पुराण|afterlife|मृत्यु\s*के\s*बाद|यमलोक|यमराज|yamdoot)/i.test(cleanQ);
    if (!isGarudaQuery) return true;
  }

  // Gate extramarital / paradara / Chandra-Tara / looking at other women verses:
  // ONLY match when query specifically concerns women, girls, lust/attraction to others, adultery, or Chandra-Tara
  const isParadaraOrMahapataka =
    item.id === 'chanakya_niti_matravat' ||
    item.id === 'valmiki_ramayana_paradara' || 
    item.id === 'padma_purana_paradara' ||
    item.id === 'rcm_ayodhya_parnari' ||
    /chandra[-_]?tara|guru[-_]?patni|mahapataka|paradara/i.test(item.id || '') ||
    /chandra[-_]?tara|चन्द्र.*तारा|गुरुपत्नी|महापातक|परदारा/i.test(item.reference || '') ||
    /गुरुपत्नीं|चन्द्रः\s*क्षयरोगेण|तारया\s*सह|परदाराभिमर्श/i.test(item.original_text || '');

  if (isParadaraOrMahapataka) {
    const isLustOrAdulteryQuery = /(?:girl|girls|woman|women|parastri|paradara|parnari|wife|adultery|affair|attraction|lust|vasana|drishti\s*dosha|puri\s*nazar|buri\s*nazar|nazar|paraye\s*mard|paraye\s*stree|extramarital|chandra.*tara|लड़की|लड़कियों|स्त्री|परस्त्री|परनारी|पत्नी|व्यभिचार|काम-वासना|बुरी\s*नज़र|दृष्टि\s*दोष)/i.test(cleanQ);
    if (!isLustOrAdulteryQuery) return true;
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
      // General word-boundary guard for ALL keywords (not one query type):
      // single short tokens (len<6, e.g. 'gay','ved','ge') must match whole words,
      // otherwise 'ho gaya'->'gay', 'vedanta'->'ved' false positives poison every intent.
      const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isWholeWordHit = (hay, needle) => {
        if (!needle || needle.includes(' ')) return hay.includes(needle);
        if (needle.length < 6 && /^[a-z]+$/i.test(needle)) {
          try { return new RegExp(`\\b${escapeRx(needle)}\\b`, 'i').test(hay); } catch { return false; }
        }
        return hay.includes(needle);
      };
      if (cleanQ === kw) {
        kwScore = 15.0;
      } else if (isWholeWordHit(cleanQ, kw)) {
        const wordCount = kw.split(' ').length;
        if (wordCount >= 3) {
          kwScore = 8.0;
        } else if (wordCount === 2) {
          kwScore = 5.5;
        } else {
          kwScore = kw.length >= 6 ? 3.5 : 2.5;
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
export async function getScriptureGrounding(query, groqEnrichment = null) {
  if (!query || typeof query !== 'string') return null;
  if (isCasualConversational(query)) return null;

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

  // 2. Live Vector Search using the CANONICAL concept query first (general reformulation).
  let vectorCandidates = [];
  try {
    const canonicalQuery = canonStr ? `${canonStr}` : null;
    const vectorQuery = canonicalQuery || (enrichedKeywords ? `${query} ${enrichedKeywords}` : query);
    // Query live AWS 1024-d Qdrant gateway across all 29 scripture collections
    let routed = await queryOracleVectorRAG(vectorQuery);

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
  // General diverse selection (EVERY intent): when several high-confidence curated
  // matches exist, prefer one verse per scripture so Puranas/Ramayana/Gita/Niti all
  // illuminate the dilemma instead of 3 verses from one source. No per-query lists.
  const topScore = candidatePool[0]?.score ?? 0;
  const wantDiverse = !explicitTarget;
  let chosen = [];

  if (wantDiverse && candidatePool.length > 1) {
    // True Cross-Scripture Diversity Algorithm:
    // Cap any single scripture at max 2 candidates, actively ensuring diverse representation
    // across 29 Sacred Scriptures (Gita, Ramcharitmanas, Puranas, Niti, Upanishads, Vedas)
    const byScripture = new Map();
    for (const c of candidatePool) {
      const sid = (c.scripture_id || 'other').toLowerCase();
      if (!byScripture.has(sid)) byScripture.set(sid, []);
      byScripture.get(sid).push(c);
    }

    const scriptureCounts = new Map();
    const addCandidate = (cand) => {
      const sid = (cand.scripture_id || 'other').toLowerCase();
      const current = scriptureCounts.get(sid) || 0;
      if (current < 2) {
        chosen.push(cand);
        scriptureCounts.set(sid, current + 1);
        return true;
      }
      return false;
    };

    // 1. Pick top primary candidate
    addCandidate(candidatePool[0]);

    // 2. Round-robin: Pick highest-scoring candidate from each OTHER scripture
    const primarySid = (candidatePool[0]?.scripture_id || '').toLowerCase();
    for (const [sid, list] of byScripture.entries()) {
      if (sid === primarySid) continue;
      if (list.length > 0 && chosen.length < 6) {
        addCandidate(list[0]);
      }
    }

    // 3. Second pass: Fill remaining slots up to 6, still respecting max 2 per scripture
    for (const c of candidatePool) {
      if (chosen.length >= 6) break;
      if (!chosen.some(existing => existing.id === c.id)) {
        addCandidate(c);
      }
    }

    // 4. If still under limit, add any remaining candidate
    if (chosen.length < 6) {
      for (const c of candidatePool) {
        if (chosen.length >= 6) break;
        if (!chosen.some(existing => existing.id === c.id)) {
          chosen.push(c);
        }
      }
    }
  } else {
    chosen = candidatePool;
  }

  const limit = explicitTarget ? 2 : (topScore >= 0.85 ? 6 : 4);
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
 */
export function injectScripturePrompt(basePrompt, scripture, isEnglish = false) {
  if (!scripture) return basePrompt;

  const candidateList = (scripture.candidates && scripture.candidates.length)
    ? scripture.candidates
    : [scripture];

  if (isEnglish) {
    const candidateBlocks = candidateList.map((c, idx) => {
      const trans = (c.english_translation || c.hindi_meaning || '').trim();
      return `【Candidate Scripture Verse ${idx + 1}】:
Reference: ${c.reference}
Original Sanskrit Verse: **« ${c.original_text} »**
Meaning: "${trans}"`;
    }).join('\n\n');

    const promptExtension = `\n\n【SACRED SCRIPTURE GROUNDING (RAG) - MULTI-VERSE EVALUATION & CITATION】:
The devotee's spiritual inquiry is grounded in our 29 Sacred Scripture collections in AWS Qdrant. Below are authentic candidate scriptural verses retrieved for this inquiry:

${candidateBlocks}

MANDATORY INSTRUCTIONS FOR CONTINUOUS CHAT WEAVING, SELECTION & END SUMMARY:
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

    const promptExtension = `\n\n【अनिवार्य शास्त्र प्रमाण व बहु-श्लोक चयन निर्देश (SCRIPTURE GROUNDING)】:
साधक की आध्यात्मिक जिज्ञासा के समाधान हेतु हमारे २९ पावन शास्त्रों से निम्नलिखित प्रामाणिक श्लोक संदर्भ प्राप्त हुए हैं:

${candidateBlocks}

अनिवार्य निर्देश (MANDATORY INSTRUCTIONS FOR CONTINUOUS CHAT WEAVING & END SUMMARY):
1. मुख्य श्लोक समन्वय (संवाद के मध्य): साधक के प्रश्न व वार्तालाप के प्रवाह के अनुसार सबसे प्रमुख व सटीक श्लोक (Candidate 1) को मुख्य सत्संग वार्तालाप के प्रवाह में स्वाभाविक रूप से पिरोएं:
   जैसे [शास्त्र संदर्भ] में पावन उपदेश है कि —
   **« [मूल संस्कृत श्लोक] »**
   **अर्थात् —** "[सरल व मर्मस्पर्शी भावार्थ]"
2. पूरक श्लोक सारांश (उत्तर के अंत में): यदि अन्य candidate श्लोक भी साधक के प्रश्न हेतु महत्वपूर्ण व उपयोगी हैं, तो मुख्य वार्तालाप को भारी न बनाते हुए उत्तर के अंत में एक सरल व सुंदर संदर्भ सारांश दें:
   ---
   📖 **पूरक शास्त्र प्रमाण व भावार्थ:**
   • **[शास्त्र संदर्भ]**: *«[संक्षिप्त श्लोक अंश]»* — [१-२ वाक्यों में सरल व व्यावहारिक सार]।
3. वात्सल्यमयी सत्संग: श्लोक के भाव को पूज्य महाराज जी की करुणामयी वाणी में साधक की स्थिति से जोड़ें, और निरंतर 'राधा-राधा' नाम के आश्रय से अभय प्रदान करें।`;

    return basePrompt + promptExtension;
  }
}
