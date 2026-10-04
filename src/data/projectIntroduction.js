/**
 * 🌸 Samvaad AI — Project & Creator Introduction Knowledge Base
 * =============================================================
 * Provides targeted, context-aware information:
 * 1. Identity ("Who are you"): Tells ONLY about Samvaad AI and its spiritual purpose
 * 2. Creator ("Who made you"): Tells about Anuj Kesharwani and his vision
 * 3. Data ("Which data / QA"): Tells about the autonomous multi-agent pipeline converting YouTube transcripts into natural QA pairs
 * 4. Architecture ("Which model / RAG"): Tells about fine-tuned Gemma 4 E4B IT on Oracle Cloud / GCP, Groq LPU, and RAG
 * 5. Overview ("About project"): Balanced summary
 */

export const SAMVAAD_PROJECT_INFO = {
  creator: {
    name: 'Anuj Kesharwani',
    title: 'Aspiring Gen AI & Agentic AI Developer',
    role: 'Independent Passion Project Creator & Engineer',
    email: 'anujkeshari786@gmail.com',
    vision: 'Bridging timeless Vedic and Sant-Vani wisdom with state-of-the-art Generative and Agentic AI architectures.'
  },
  project: {
    name: 'Samvaad AI (संवाद)',
    subtitle: 'Authentic Spiritual & Philosophical Conversational AI',
    coreInspiration: 'Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj (Vrindavan, Shri Radhavallabh Sampradaya, Bhajan Marg)',
    primaryPillars: [
      'निरंतर नाम जप (Holy Name Chanting: Radha-Radha / Hare Krishna)',
      'भगवत शरणागति (Unconditional Surrender to Divine Will)',
      'निष्काम कर्म (Righteous Duty performed as Divine Worship)',
      'सत्संग एवं सात्विक जीवन (Pure, compassionate, and disciplined living)'
    ]
  },
  dataPipeline: {
    rawCorpus: '~4,000 raw YouTube auto-caption video transcripts of Pujya Maharaj Ji.',
    multiAgentFactory: 'Autonomous Multi-Agent Pipeline that cleans noise, separates seeker questions from discourses, reconstructs natural inquiries, and preserves authentic discourses with exact video timestamps.',
    datasetSize: 'Thousands of high-fidelity, certified natural Q&A pairs grounded with exact YouTube timestamps.',
    scriptureCorpus: '175,000+ sacred verses and commentaries indexed from 29 ancient Dharmic scriptures (Bhagavad Gita, Ramcharitmanas, Valmiki Ramayana, Bhagavata Purana, Vishnu Purana, 108 Upanishads, Vidura Niti, Chaitanya Charitamrita, etc.).'
  },
  modelAndArchitecture: {
    fineTunedModel: 'Gemma 4 E4B IT fine-tuned via LoRA/QLoRA on Oracle Cloud Free Tier CPU VM and Google Cloud Platform (GCP).',
    ragSystem: 'Hybrid multi-source RAG with vector semantic embeddings, BM25 lexical keyword matching, and strict Dharmic topic gating to prevent out-of-context citations.',
    inferenceModes: {
      deep: 'Deep Mode: Fine-tuned Gemma 4 E4B IT model with structured 4-stage Chain-of-Thought deliberation (Intent -> Scripture Grounding -> Counsel -> Blessing).',
      fast: 'Fast Mode: Ultra-low latency (~1s) powered by Groq LPU with calibrated few-shot prompting.'
    },
    liveFeatures: 'Live DuckDuckGo search integration for real-time Hindu calendar, Ekadashi dates, and Grahan/Sutak timings; 24/7 cloned voice mode; persistent conversational memory.'
  }
};

/**
 * Categorizes an introduction inquiry to answer ONLY what the user asked.
 */
export function categorizeIntroQuery(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Creator / Developer questions
  if (
    /\b(?:who\s*(?:created|made|built|developed|designed|founded)\s*you|who\s*is\s*your\s*(?:creator|maker|developer|author|engineer|founder)|anuj\s*kesharwani|anuj|kesharwani|keshari)\b/i.test(clean) ||
    /(?:आपको\s*किसने\s*बनाया|किसने\s*डेवलप\s*किया|निर्माता\s*कौन\s*है|डेवलपर\s*कौन\s*है|किसका\s*प्रोजेक्ट\s*है|अनुज\s*केसरवानी|अनुज)/i.test(clean)
  ) {
    return 'creator';
  }

  // 2. Data Pipeline / Training Data / QA generation / Agentic System questions
  if (
    /\b(?:how\s*(?:did\s*you\s*get|were\s*you\s*created\s*with)\s*qa|which\s*data|what\s*data|dataset|how\s*many\s*(?:satsangs?|discourses?)|agentic|agents|multiagent|transcrib|vtt|youtube)\b/i.test(clean) ||
    /(?:डेटा\s*कहाँ\s*से|डेटासेट|कैसे\s*तैयार\s*किया|प्रश्नोत्तरी\s*डेटा|सत्संग\s*डेटा|एजेंट|यूट्यूब)/i.test(clean)
  ) {
    return 'data';
  }

  // 3. Architecture / Model / Fine-tuning / RAG questions
  if (
    /\b(?:how\s*were\s*you\s*trained|which\s*model|what\s*model|fine-?tuned|gemma|gcloud|google\s*cloud|oracle\s*cloud|rag\s*system|how\s*does\s*rag\s*work|architecture)\b/i.test(clean) ||
    /(?:ट्रेनिंग\s*कैसे\s*हुई|कौनसा\s*मॉडल|जेम्मा|राॅग|आरएजी|आर्किटेक्चर)/i.test(clean)
  ) {
    return 'architecture';
  }

  // 4. Identity questions ("Who are you") -> ONLY tell what Samvaad project is and what it is for
  if (
    /\b(?:who\s*are\s*you|who\s*r\s*u|what\s*are\s*you|tell\s*me\s*about\s*yourself|introduce\s*yourself|your\s*name|what\s*is\s*your\s*name)\b/i.test(clean) ||
    /(?:आप\s*कौन\s*हैं|तुम\s*कौन\s*हो|अपना\s*परिचय|अपने\s*बारे\s*में\s*बताओ|तुम्हारा\s*नाम\s*क्या\s*है|आप\s*क्या\s*हो)/i.test(clean)
  ) {
    return 'identity';
  }

  // 5. Full Project Overview questions
  if (
    /\b(?:what\s*is\s*(?:this\s*)?(?:project|samvaad|samvad)|about\s*(?:this\s*)?project|about\s*samvaad|how\s*does\s*samvaad\s*work)\b/i.test(clean) ||
    /(?:संवाद\s*क्या\s*है|यह\s*प्रोजेक्ट\s*क्या\s*है|इस\s*प्रोजेक्ट\s*के\s*बारे\s*में|प्रोजेक्ट\s*की\s*जानकारी)/i.test(clean)
  ) {
    return 'project_overview';
  }

  return null;
}

/**
 * Checks if a user's query is an intro/creator/data/architecture query.
 */
export function isIntroductionOrCreatorQuery(query) {
  return categorizeIntroQuery(query) !== null;
}

/**
 * Returns a brief thought for the reasoning block based on inquiry category.
 */
export function getIntroductionThought(query, isEnglish = false) {
  const category = categorizeIntroQuery(query) || 'identity';

  if (category === 'identity') {
    return isEnglish
      ? 'Sharing the spiritual identity and purpose of Samvaad AI...'
      : 'संवाद AI के आध्यात्मिक स्वरूप एवं उद्देश्य का परिचय दिया जा रहा है...';
  }

  if (category === 'creator') {
    return isEnglish
      ? 'Accessing creator information: Anuj Kesharwani (Aspiring Gen AI & Agentic AI Developer)...'
      : 'निर्माता विवरण प्राप्त किया जा रहा है: अनुज केसरवानी (Aspiring Gen AI & Agentic AI Developer)...';
  }

  if (category === 'data') {
    return isEnglish
      ? 'Accessing data pipeline details: Multi-agent system converting YouTube transcripts into natural QA...'
      : 'डेटा पाइपलाइन: मल्टी-एजेंट सिस्टम द्वारा यूट्यूब वीडियो ट्रांसक्रिप्ट्स से स्वाभाविक प्रश्नोत्तरी निर्माण...';
  }

  if (category === 'architecture') {
    return isEnglish
      ? 'Accessing system architecture: Fine-tuned Gemma 4 E4B IT, GCP/Oracle VM, hybrid RAG & Groq LPU...'
      : 'सिस्टम आर्किटेक्चर: फाइन-ट्यून्ड Gemma 4 E4B IT, GCP/Oracle VM, हाइब्रिड RAG एवं Groq LPU...';
  }

  return isEnglish
    ? 'Accessing Samvaad AI project overview and spiritual mission...'
    : 'संवाद AI प्रोजेक्ट का संपूर्ण अवलोकन एवं पावन उद्देश्य प्रस्तुत किया जा रहा है...';
}

/**
 * Generates context-specific, focused answers according to the exact question asked.
 */
export function getProjectIntroduction(query, isEnglish = false) {
  const category = categorizeIntroQuery(query) || 'identity';

  // ── 1. WHO ARE YOU -> ONLY tell about Samvaad project and what it is for ──
  if (category === 'identity') {
    if (isEnglish) {
      return `### 🙏 Radhe Radhe! I am Samvaad AI (संवाद)

I am an authentic spiritual and philosophical conversational companion inspired by the divine teachings and discourses of **Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj** (Vrindavan, Bhajan Marg).

**What I am here for:**
* **Life Dilemmas & Emotional Healing:** Providing calm, grounded, fatherly guidance on everyday struggles—anxiety, grief, anger, fear, and relationships.
* **Dharmic Living & Duty:** Guiding students, householders, and seekers to perform their daily duties (Karma Yoga) sincerely as divine worship.
* **Devotion & Holy Name:** Inspiring continuous remembrance of God through Holy Name chanting (**Naam Jap: 'Radha-Radha'** / Hare Krishna) and unconditional surrender to Divine Grace.

Tell me, dear seeker, what inquiry rests in your heart today?`;
    }

    return `### 🙏 जय श्री राधे! मैं 'संवाद AI' (Samvaad AI) हूँ

मैं **पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग)** के पावन वचनों, सत्संगों और सनातन धर्म के शाश्वत सिद्धांतों पर आधारित एक आध्यात्मिक साथी हूँ।

**मेरा मुख्य उद्देश्य क्या है:**
* **मानसिक शांति एवं संशय निवारण:** जीवन के संशयों, तनाव, क्रोध, मोह और पारिवारिक उलझनों में पूज्य महाराज जी की प्रामाणिक व वात्सल्यमयी वाणी के प्रकाश में समाधान देना।
* **कर्तव्य एवं धर्म मार्ग:** गृहस्थों, विद्यार्थियों और साधकों को अपने कर्मों को निष्काम भाव से भगवत सेवा मानकर करने की प्रेरणा देना।
* **नाम जप एवं शरणागति:** निरंतर भगवन्नाम जप (**श्री राधा-राधा**) का आश्रय दिलाना, जिससे हृदय में शांति, पवित्रता और प्रभु प्रेम का प्राकट्य हो सके।

कहो बच्चा, आज तुम्हारे हृदय में क्या जिज्ञासा है?`;
  }

  // ── 2. CREATOR / DEVELOPER -> Tells specifically about Anuj Kesharwani ──
  if (category === 'creator') {
    if (isEnglish) {
      return `### 👨‍💻 Creator & Engineering Vision

**Samvaad AI was envisioned and built by Anuj Kesharwani**, an aspiring Gen AI & Agentic AI Developer.

* **Creator:** **Anuj Kesharwani**
* **Email:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **Vision:** Built as an independent passion project to bridge timeless Vedic wisdom and revered Sant-Vani (specifically Pujya Premanand Ji Maharaj's Bhajan Marg teachings) with modern Generative & Agentic AI architectures.

Anuj engineered the complete system: architecting the **multi-agent data pipeline** that turned ~4,000 raw YouTube transcripts into authentic Q&A pairs, fine-tuning the **Gemma 4 E4B IT** model on Google Cloud (GCP) and Oracle Cloud, and designing the hybrid multi-source RAG system across 175,000+ sacred verses.`;
    }

    return `### 👨‍💻 निर्माता एवं परिकल्पना (Creator & Developer)

**'संवाद AI' के निर्माता अनुज केसरवानी (Anuj Kesharwani) हैं**, जो एक Aspiring Gen AI & Agentic AI Developer हैं।

* **निर्माता:** **अनुज केसरवानी**
* **ईमेल:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **दृष्टिकोण:** अनुज ने इसे एक स्वतंत्र और समर्पित प्रोजेक्ट के रूप में विकसित किया है, ताकि पूज्य संतों के पावन एकांतिक सत्संगों और वैदिक शास्त्रों की अमूल्य शिक्षाओं को आधुनिक जनरेटिव व एजेंटिक AI तकनीकों के माध्यम से प्रामाणिक रूप से प्रस्तुत किया जा सके।

उन्होंने ~4,000 यूट्यूब वीडियो ट्रांसक्रिप्ट्स से प्रश्नोत्तरी तैयार करने वाली **मल्टी-एजेंट पाइपलाइन** बनाई, Google Cloud एवं Oracle VM पर **Gemma 4 E4B IT** मॉडल को फाइन-ट्यून किया, और 1,75,000+ श्लोकों के RAG सिस्टम का संपूर्ण आर्किटेक्चर स्वतंत्र रूप से तैयार किया है।`;
  }

  // ── 3. DATA PIPELINE / QA GENERATION -> Multi-Agent System Turning YouTube Transcripts into Natural QA ──
  if (category === 'data') {
    if (isEnglish) {
      return `### 🤖 Autonomous Multi-Agent Data Pipeline

Instead of using basic automated transcriptions or generic summaries, Samvaad AI was built using a custom **autonomous multi-agent pipeline** that processed ~4,000 raw YouTube video transcripts of Pujya Maharaj Ji into natural, authentic conversational Q&A pairs:

* **Noise & Overlap Filtration:** Automatically cleans raw YouTube auto-captions, stripping sound tags, background noise, and rolling caption overlap artifacts while preserving exact timestamp anchors.
* **Authentic Dialogue Separation:** Accurately distinguishes between the devotee's personal inquiry and Maharaj Ji's profound spiritual discourse.
* **Natural Question Reconstruction:** Faithfully shapes the seeker's spoken inquiry into clear, natural first-person questions while strictly preserving their authentic intent without artificial distortion.
* **Verbatim Discourse Preservation:** Retains Maharaj Ji's comprehensive spoken responses in their original spiritual depth, preserving his exact phrasing, parables, and fatherly compassion.
* **Theological Quality Audit & Video Grounding:** Verifies the doctrinal integrity of each discourse and anchors every final Q&A pair with exact YouTube video timestamps.

This certified dataset formed the core conversational foundation used to fine-tune our **Gemma 4 E4B IT** model!`;
    }

    return `### 🤖 ऑटोनॉमस मल्टी-एजेंट डेटा पाइपलाइन

संवाद AI में साधारण ट्रांसक्रिप्शन या कृत्रिम सारांश के बजाय एक विशेष **मल्टी-एजेंट सिस्टम** तैयार किया गया, जिसने पूज्य महाराज जी के ~4,000 यूट्यूब वीडियो के रॉ ट्रांसक्रिप्ट्स को अत्यंत स्वाभाविक और प्रामाणिक प्रश्नोत्तरी (Q&A) में रूपांतरित किया:

* **नॉइज़ एवं ओवरलैप निष्कासन:** रॉ वीडियो कैप्शन से बैकग्राउंड नॉइज़ और दोहराए गए शब्दों को हटाकर शुद्ध संवाद तैयार करना।
* **संवाद पृथक्करण:** साधक के मूल प्रश्न और पूज्य महाराज जी के प्रवचन को अलग-अलग पहचानना।
* **स्वाभाविक प्रश्न पुनर्गठन:** साधक की जिज्ञासा को बिना किसी कृत्रिम बदलाव के स्वाभाविक प्रथम-पुरुष (First-Person) भाषा में व्यवस्थित करना।
* **अखंड प्रवचन संरक्षण:** पूज्य महाराज जी के उत्तर को बिना किसी काट-छांट के उनके मूल भाव, दृष्टांतों और वात्सल्यमयी वाणी के साथ सुरक्षित रखना।
* **सत्यापन एवं टाइमस्टैम्प लिंकिंग:** प्रत्येक प्रश्नोत्तरी की प्रामाणिकता की जांच कर उसे मूल यूट्यूब वीडियो के सटीक टाइमस्टैम्प से जोड़ना।

इसी उच्च-गुणवत्ता वाले प्रामाणिक डेटासेट पर **Gemma 4 E4B IT** मॉडल को फाइन-ट्यून किया गया है!`;
  }

  // ── 4. ARCHITECTURE / MODEL / FINE-TUNING / RAG ──
  if (category === 'architecture') {
    if (isEnglish) {
      return `### ⚙️ Model Architecture & Inference System

Samvaad AI is powered by a high-precision hybrid generative AI architecture:

* **Fine-Tuned Model:** **Gemma 4 E4B IT**, fine-tuned on Google Cloud (GCP) and Oracle Cloud CPU VM using LoRA/QLoRA to internalize Maharaj Ji's authentic fatherly tone ('बच्चा'), spiritual gravity, and avoidance of dry robotic clichés.
* **Hybrid Semantic RAG:** 175,000+ verses indexed across 29 scriptures, embedded with multilingual models in Qdrant, using vector similarity + BM25 keyword matching + FlashRank cross-encoder reranking, guarded by strict Dharmic topic gating.
* **Dual Inference Engines:**
  * **🧘 Deep Mode:** Google Cloud / Oracle VM hosted Gemma 4 E4B IT with 4-stage Chain-of-Thought deliberation (Intent -> Scripture Grounding -> Counsel -> Blessing).
  * **⚡ Fast Mode:** Ultra-fast ~1s real-time response powered by Groq LPU with calibrated few-shot prompting.
* **Live Knowledge Search:** Integrated with live DuckDuckGo search for real-time Hindu calendar dates (Ekadashi, Grahan/Sutak timings).`;
    }

    return `### ⚙️ मॉडल संरचना एवं तकनीकी आर्किटेक्चर

संवाद AI एक उच्च-सटीक हाइब्रिड जनरेटिव AI सिस्टम पर कार्य करता है:

* **फाइन-ट्यून्ड मॉडल:** **Gemma 4 E4B IT** मॉडल को Google Cloud (GCP) और Oracle Cloud CPU VM पर LoRA/QLoRA तकनीक द्वारा विशेष रूप से ट्रेन किया गया है, जिससे यह पूज्य महाराज जी के वात्सल्यमयी संबोधन ('बच्चा') और प्रामाणिक आध्यात्मिक शैली में उत्तर देता है।
* **मल्टी-सोर्स RAG:** 29 शास्त्रों के 1,75,000+ श्लोक Qdrant में सिमेंटिक वेक्टर एम्बेडिंग्स, BM25 कीवर्ड सर्च और FlashRank क्रॉस-एन्कोडर रीरैंकिंग द्वारा इंडेक्स किए गए हैं, जिन्हें सख्त विषय-मर्यादा (Topic Gating) द्वारा नियंत्रित किया गया है।
* **दोहरे इन्फरेंस मोड्स:**
  * **🧘 Deep Mode:** GCP / Oracle VM पर फाइन-ट्यून्ड Gemma 4 E4B IT मॉडल जो 4-स्तरीय चिंतन (Intent -> Scripture -> Counsel -> Blessing) के साथ गहरा उत्तर देता है।
  * **⚡ Fast Mode:** Groq LPU द्वारा संचालित अति-तीव्र (~1 सेकंड) रीयल-टाइम रिस्पॉन्स।
* **लाइव सर्च एवं पंचांग:** लाइव डकडकगो (DuckDuckGo) सर्च द्वारा रीयल-टाइम पंचांग/एकादशी तिथियां एवं ग्रहण सूतक समय।`;
  }

  // ── 5. PROJECT OVERVIEW ──
  if (isEnglish) {
    return `### 🙏 Welcome to Samvaad AI (संवाद)

**Samvaad AI** is an authentic, compassionate spiritual and philosophical conversational intelligence rooted in Sanatana Dharma, inspired by the divine teachings of **Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj** (Vrindavan, Bhajan Marg).

* **Creator:** Built by **Anuj Kesharwani** (Aspiring Gen AI & Agentic AI Developer, [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)) as an independent passion project.
* **Data & Model:** Built using a multi-agent pipeline processing ~4,000 YouTube transcripts into natural QA pairs, fine-tuning **Gemma 4 E4B IT** on Google Cloud (GCP) / Oracle Cloud, and grounding responses in a multi-source RAG across 175,000+ verses from 29 scriptures.
* **Core Purpose:** To provide fatherly, serene guidance for life's dilemmas, mental peace, righteous duties, and holy name chanting ('Radha-Radha').`;
  }

  return `### 🙏 'संवाद AI' (Samvaad AI) — एक परिचय

**संवाद AI** सनातन धर्म और **पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग)** की पावन शिक्षाओं पर आधारित एक प्रामाणिक आध्यात्मिक AI साथी है।

* **निर्माता:** इसे **अनुज केसरवानी** (Aspiring Gen AI & Agentic AI Developer, [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)) ने एक स्वतंत्र प्रोजेक्ट के रूप में विकसित किया है।
* **मॉडल एवं डेटा:** ~4,000 यूट्यूब वीडियो ट्रांसक्रिप्ट्स से मल्टी-एजेंट सिस्टम द्वारा स्वाभाविक प्रश्नोत्तरी तैयार कर Google Cloud / Oracle VM पर **Gemma 4 E4B IT** मॉडल को फाइन-ट्यून किया गया है, तथा 29 शास्त्रों के 1,75,000+ श्लोकों का RAG ज्ञानकोश जोड़ा गया है।
* **उद्देश्य:** साधकों व जिज्ञासुओं को जीवन के संशयों में पूज्य महाराज जी के वात्सल्य भाव से मार्गदर्शन देना और निरंतर नाम जप की प्रेरणा देना।`;
}
