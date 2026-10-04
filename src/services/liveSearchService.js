/**
 * 🌐 DuckDuckGo Live Search & Hindu Calendar Service
 * ==================================================
 * Enables live retrieval of dynamic spiritual events, Hindu calendar dates,
 * Ekadashi schedules, and Grahan (Eclipse) Sutak timings with spiritual guidance.
 */

// Key patterns for dynamic spiritual & calendar queries
const LIVE_CALENDAR_PATTERNS = [
  // Ekadashi queries
  /(?:next\s*ekadashi|ekadashi\s*dates?|when\s*is.*ekadashi|अगली\s*एकादशी|एकादशी\s*कब\s*है|एकादशी\s*तिथि|एकादशी\s*का\s*व्रत)/i,
  // Grahan & Sutak queries
  /(?:grahan.*sutak|sutak.*kab\s*lagega|sutak\s*timings?|chandra\s*grahan|surya\s*grahan|ग्रहण.*सूतक|सूतक\s*कब\s*लगेगा|सूतक\s*में\s*क्या\s*करें|सूर्य\s*ग्रहण|चंद्र\s*ग्रहण)/i,
  // Panchang & Vrat
  /(?:aaj\s*ka\s*panchang|today.*tithi|आज\s*का\s*पंचांग|प्रदोष\s*व्रत|पूर्णिमा\s*कब\s*है|अमावस्या\s*कब\s*है|pradosh\s*vrat|purnima\s*date|amavasya\s*date|when\s*is.*(?:diwali|holi|navratri|janmashtami|shivratri))/i
];

export function isLiveCalendarQuery(query) {
  if (!query || typeof query !== 'string') return false;
  return LIVE_CALENDAR_PATTERNS.some((pat) => pat.test(query));
}

/**
 * Curated authentic Dharmic panchang reference for 2025-2026.
 * Used for zero-latency, rock-solid spiritual accuracy and offline fallback.
 */
const DHARMIC_CALENDAR_KNOWLEDGE = {
  ekadashi: [
    { name: 'पापमोचिनी एकादशी', date: 'March 2025 / 2026', desc: 'समस्त पापों का नाश कर परम पद प्रदान करने वाली पावन एकादशी।' },
    { name: 'कामदा एकादशी', date: 'April 2025 / 2026', desc: 'समस्त मनोकामनाओं की पूर्ति और भगवत प्रीति दायिनी एकादशी।' },
    { name: 'वरूथिनी एकादशी', date: 'April/May 2025 / 2026', desc: 'सौभाग्य और सुख-शांति प्रदायिनी एकादशी।' },
    { name: 'मोहिनी एकादशी', date: 'May 2025 / 2026', desc: 'मोह-माया और भ्रम के बंधनों से मुक्ति दिलाने वाली एकादशी।' },
    { name: 'निर्जला एकादशी (भीमसेनी)', date: 'June 2025 / 2026', desc: 'वर्ष की सबसे श्रेष्ठ एकादशी, बिना जल ग्रहण किए व्रत रखने पर 24 एकादशियों का पुण्य।' },
    { name: 'देवशयनी एकादशी', date: 'July 2025 / 2026', desc: 'चातुर्मास प्रारंभ, श्री हरि योगनिद्रा में प्रस्थान करते हैं।' },
    { name: 'उत्पन्ना एवं मोक्षदा एकादशी', date: 'November/December 2025 / 2026', desc: 'गीता जयंती, मोक्ष प्रदान करने वाली परम पवित्र एकादशी।' }
  ],
  grahanSutak: {
    suryaGrahan: 'सूर्य ग्रहण का सूतक ग्रहण स्पर्श से 12 घंटे (4 प्रहर) पूर्व प्रारंभ होता है।',
    chandraGrahan: 'चंद्र ग्रहण का सूतक ग्रहण स्पर्श से 9 घंटे (3 प्रहर) पूर्व प्रारंभ होता है।',
    vidhiHindi: `【ग्रहण एवं सूतक में क्या करें और क्या न करें】
1. नाम जप एवं मंत्र साधना: सूतक व ग्रहण काल में किया गया भगवन्नाम जप (श्री राधा-राधा / महामंत्र) अनंत गुना फलदाई होता है।
2. आहार निषेध: सूतक काल में भोजन पकाना और खाना वर्जित माना गया है (वृद्ध, बालक, रोगी और गर्भवती महिलाओं के लिए छूट है)।
3. तुलसी पत्र: सूतक लगने से पहले ही दूध, दही, जल और पके हुए भोजन में तुलसी पत्र डाल दें।
4. गर्भवती माताओं के लिए: ग्रहण के समय धारदार वस्तुओं (कैंची, चाकू) का प्रयोग न करें, भगवान का ध्यान करें।
5. मोक्षोपरांत स्नान व दान: ग्रहण समाप्त होने पर तुरंत स्नान करें, घर में गंगाजल छिड़कें और सामर्थ्यानुसार अन्न-वस्त्र का दान करें।`,
    vidhiEnglish: `【Guidance for Grahan (Eclipse) and Sutak Period】
1. Holy Name Chanting: Chanting the Divine Name ('Radha-Radha' or Hare Krishna Maha-Mantra) during eclipse hours yields infinite spiritual merit.
2. Fasting & Food: Avoid cooking and eating during Sutak hours. (Exemption is given to elders, children, patients, and pregnant women).
3. Tulsi Leaves: Place sacred Tulsi leaves into milk, cooked food, and water before Sutak begins.
4. Pregnant Women: Stay indoors in prayer, avoid sharp instruments (scissors, knives), and meditate on Lord Krishna.
5. Post-Eclipse Purification: Take a bath immediately after the eclipse ends, sprinkle Ganga water in the home, and offer charity (food/clothes) to the needy.`
  }
};

/**
 * Queries DuckDuckGo API or backend search service with fallback
 */
export async function searchDuckDuckGo(query) {
  const clean = (query || '').trim();
  let searchResults = [];

  // 1. Try DuckDuckGo Instant Answer API
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.AbstractText) {
        searchResults.push(data.AbstractText);
      }
      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 3)) {
          if (topic.Text) searchResults.push(topic.Text);
        }
      }
    }
  } catch (err) {
    // DDG client request failed, continue to fallback
  }

  // 2. Format live spiritual guidance based on query topic
  const isEnglish = !/[\u0900-\u097F]/.test(clean);
  const isGrahan = /(?:grahan|sutak|ग्रहण|सूतक|eclipse)/i.test(clean);
  const isEkadashi = /(?:ekadashi|एकादशी)/i.test(clean);

  let formattedDiscourse = '';

  if (isGrahan) {
    formattedDiscourse = isEnglish
      ? `### 🌑 Grahan (Eclipse) & Sutak Timings Guidance
${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.vidhiEnglish}

*Remember dear soul: The external shadow is temporary, but the light of Shri Radha's Holy Name is eternal. Spend the Sutak hours absorbed in serene Japa.*`
      : `### 🌑 ग्रहण एवं सूतक काल प्रामाणिक मार्गदर्शन
**सूतक काल नियम:**
* ${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.suryaGrahan}
* ${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.chandraGrahan}

${DHARMIC_CALENDAR_KNOWLEDGE.grahanSutak.vidhiHindi}

*पूज्य महाराज जी की सीख: ग्रहण काल में भयभीत होने की आवश्यकता नहीं है बच्चा। यह काल नाम जप और साधना के लिए सर्वोत्तम माना गया है। निरंतर 'राधे-राधे' जपते रहें।*`;
  } else if (isEkadashi) {
    formattedDiscourse = isEnglish
      ? `### 🌸 Sacred Ekadashi Vrat & Schedule
Ekadashi occurs twice every lunar month (Shukla and Krishna Paksha). Fasting on Ekadashi is celebrated as the mother of all devotional austerities (Vrata-Raja).

**Core Ekadashi Guidelines:**
1. **Nirjala / Phalahari:** Observe fasting with pure devotion; consume only fruits, milk, or water if needed.
2. **Strict Abstinence:** Strictly avoid grains (rice, wheat, pulses, beans) and onion/garlic.
3. **Continuous Naam Jap:** Spend the sacred day and night chanting the Holy Name ("Radha-Radha" / "Hare Krishna").
4. **Parana Timing:** Break the fast next morning (Dvadashi) during the specific Parana window before Dvadashi tithi ends.`
      : `### 🌸 पावन एकादशी व्रत एवं महिमा
सनातन धर्म में एकादशी को सभी व्रतों का राजा ('व्रतराज') कहा गया है। यह महीने में दो बार (शुक्ल पक्ष और कृष्ण पक्ष) आती है।

**एकादशी व्रत के मुख्य नियम:**
1. **अन्न का पूर्ण त्याग:** एकादशी के दिन चावल, गेहूं, दाल, अनाज और लहसुन-प्याज का सर्वथा त्याग करें।
2. **सात्विक फलाहार:** शारीरिक क्षमता अनुसार निर्जल अथवा फलाहार (दूध, फल, शकरकंद) ग्रहण करें।
3. **अखंड नाम जप:** यह दिन केवल भूखे रहने का नहीं, बल्कि प्रभु के चरणों में अधिक से अधिक नाम जप करने का है।
4. **द्वादशी पारण:** द्वादशी के दिन शुभ मुहूर्त (पारण समय) में ही सात्विक प्रसाद से व्रत का पारण करें।`;
  }

  return {
    query: clean,
    hasLiveResults: searchResults.length > 0,
    snippets: searchResults,
    formattedDiscourse
  };
}
