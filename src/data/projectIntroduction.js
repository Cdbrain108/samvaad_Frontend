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
export function categorizeIntroQuery(query, conversationHistory = []) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Creator / Developer questions
  // Matches: "who is the creator of that project", "who made this project", "who is your creator", "who created it", "who am i", etc.
  if (
    /\b(?:who\s*(?:created|made|built|developed|designed|founded)\s*(?:you|this|that|it|(?:this|that|the)\s*(?:project|app|website|system|bot|model))|who\s*is\s*(?:your|(?:the|this|that)\s*(?:project'?s?|app'?s?|bot'?s?))\s*(?:creator|maker|developer|author|engineer|founder|architect)|who\s*is\s*(?:the\s*)?(?:creator|maker|developer|author|founder|architect)\s*(?:of\s*(?:you|this|that|it|(?:this|that|the)\s*(?:project|app|system|bot|website)))?|anuj\s*kesharwani|anuj|kesharwani|keshari|who\s*(?:am\s*i|are\s*you\s*talking\s*to)|do\s*you\s*know\s*me)\b/i.test(clean) ||
    /(?:आपको\s*किसने\s*बनाया|किसने\s*बनाया|किसने\s*डेवलप\s*किया|निर्माता\s*कौन\s*है|डेवलपर\s*कौन\s*है|किसका\s*प्रोजेक्ट\s*है|इस\s*प्रोजेक्ट\s*(?:का|के)\s*(?:निर्माता|डेवलपर|क्रिएटर)|अनुज\s*केसरवानी|अनुज|मैं\s*कौन\s*हूँ|मुझे\s*जानते\s*हो)/i.test(clean)
  ) {
    return 'creator';
  }

  // Follow-up context check: If previous message was identity/project intro and user asks "who made it", "creator kaun hai", etc.
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const lastBotMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant')?.content || '';
    if (lastBotMsg.includes('Samvaad AI') || lastBotMsg.includes('संवाद AI')) {
      if (/\b(?:creator|maker|developer|who\s*made|who\s*built|who\s*created|founder)\b/i.test(clean) || /(?:निर्माता|डेवलपर|किसने\s*बनाया)/i.test(clean)) {
        return 'creator';
      }
    }
  }

  // 2. Data Pipeline / Training Data / QA generation / Agentic System questions
  if (
    /\b(?:how\s*(?:did\s*you\s*get|were\s*you\s*created\s*with)\s*qa|which\s*data|what\s*data|dataset|how\s*many\s*(?:satsangs?|discourses?)|agentic|agents|multiagent|transcrib|vtt|youtube)\b/i.test(clean) ||
    /(?:डेटा\s*कहाँ\s*से|डेटासेट|कैसे\s*तैयार\s*किया|प्रश्नोत्तरी\s*डेटा|सत्संग\s*डेटा|एजेंट|यूट्यूब)/i.test(clean)
  ) {
    return 'data';
  }

  // 3. Architecture / Model / Fine-tuning / RAG & LLM Knowledge questions
  if (
    /\b(?:how\s*were\s*you\s*trained|which\s*model|what\s*model|fine-?tuned|gemma|gcloud|google\s*cloud|oracle\s*cloud|rag\s*(?:system|knowledge|corpus)?|how\s*does\s*rag\s*work|architecture|what\s*(?:kinda|kind\s*of)?\s*(?:rag|llm|knowledge)|(?:rag|llm)\s*knowledge|knowledge\s*base)\b/i.test(clean) ||
    /(?:ट्रेनिंग\s*कैसे\s*हुई|कौनसा\s*मॉडल|जेम्मा|राॅग|आरएजी|आर्किटेक्चर|नॉलेज|ज्ञान\s*स्रोत|क्या\s*ज्ञान\s*है|आरएजी\s*और\s*एलएलएम)/i.test(clean)
  ) {
    return 'architecture';
  }

  // 4. Identity questions ("Who are you") -> ONLY tell what Samvaad project is and what it is for
  if (
    /\b(?:who\s*(?:are|r)\s*(?:you|u)|what\s*(?:are|r)\s*(?:you|u)|who\s*you\s*are|who\s*are\s*u|who\s*u\s*are|who\s*is\s*this|who\s*am\s*i\s*talking\s*to|who\s*is\s*speaking|are\s*you\s*(?:an?\s*)?(?:ai|bot|premanand|guru|maharaj)|tell\s*me\s*about\s*(?:yourself|you)|introduce\s*yourself|your\s*name|what\s*is\s*your\s*name|who\s*you\b)/i.test(clean) ||
    /(?:आप\s*कौन\s*(?:हैं|हो)?|तुम\s*कौन\s*(?:हो|हैं)?|तू\s*कौन\s*है|कौन\s*हो\s*तुम|कौन\s*हैं\s*आप|कौन\s*हो\s*भाई|अपना\s*परिचय|अपने\s*बारे\s*में\s*बताओ|तुम्हारा\s*नाम|आपका\s*नाम|आप\s*क्या\s*हो|क्या\s*नाम\s*है)/i.test(clean) ||
    /\b(?:aap\s*k[ao]n\s*h[ao]|ap\s*k[ao]n\s*h[ao]|k[ao]n\s*h[ao]\s*aap|k[ao]n\s*h[ao]\s*tum|tum\s*k[ao]n\s*h[ao]|apna\s*parichay|aap\s*kya\s*ho|ap\s*kya\s*ho|naam\s*kya\s*hai|kya\s*naam\s*hai)\b/i.test(clean)
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
export function isIntroductionOrCreatorQuery(query, conversationHistory = []) {
  return categorizeIntroQuery(query, conversationHistory) !== null;
}

/**
 * Returns a brief thought for the reasoning block based on inquiry category.
 */
export function getIntroductionThought(query, isEnglish = false, conversationHistory = []) {
  const category = categorizeIntroQuery(query, conversationHistory) || 'identity';

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
export function getProjectIntroduction(query, isEnglish = false, seekerName = '', conversationHistory = []) {
  const category = categorizeIntroQuery(query, conversationHistory) || 'identity';
  const clean = (query || '').toLowerCase();
  const isAnuj = (seekerName && /anuj|kesharwani|keshari/i.test(seekerName)) ||
                 /\b(?:who\s*am\s*i|do\s*you\s*know\s*me)\b/i.test(clean) ||
                 /(?:मैं\s*कौन\s*हूँ|मुझे\s*जानते\s*हो)/i.test(clean);

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
      if (isAnuj) {
        return `### 👨‍💻 Creator & Engineering Vision

**You, Anuj Kesharwani, are the creator and developer of Samvaad AI (संवाद)!**

* **Creator:** **Anuj Kesharwani**
* **Role:** Aspiring Gen AI & Agentic AI Developer
* **Email:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **Vision:** You envisioned and built Samvaad AI as an independent passion project to bridge timeless Vedic wisdom and revered Sant-Vani (specifically Pujya Premanand Ji Maharaj's Bhajan Marg teachings) with modern Generative & Agentic AI architectures.

You engineered the complete platform: architecting the **multi-agent data pipeline** that turned ~4,000 raw YouTube transcripts into authentic Q&A pairs, fine-tuning the **Gemma 4 E4B IT** model on Google Cloud (GCP) and Oracle Cloud, and designing the hybrid multi-source RAG system across 175,000+ sacred verses.`;
      }

      return `### 👨‍💻 Creator & Engineering Vision

**Samvaad AI was envisioned and built by Anuj Kesharwani**, an aspiring Gen AI & Agentic AI Developer.

* **Creator:** **Anuj Kesharwani**
* **Email:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **Vision:** Built as an independent passion project to bridge timeless Vedic wisdom and revered Sant-Vani (specifically Pujya Premanand Ji Maharaj's Bhajan Marg teachings) with modern Generative & Agentic AI architectures.

Anuj engineered the complete system: architecting the **multi-agent data pipeline** that turned ~4,000 raw YouTube transcripts into authentic Q&A pairs, fine-tuning the **Gemma 4 E4B IT** model on Google Cloud (GCP) and Oracle Cloud, and designing the hybrid multi-source RAG system across 175,000+ sacred verses.`;
    }

    if (isAnuj) {
      return `### 👨‍💻 निर्माता एवं परिकल्पना (Creator & Developer)

**'संवाद AI' के निर्माता और डेवलपर आप स्वयं—अनुज केसरवानी (Anuj Kesharwani) हैं!**

* **निर्माता:** **अनुज केसरवानी**
* **पद/भूमिका:** Aspiring Gen AI & Agentic AI Developer
* **ईमेल:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **दृष्टिकोण:** आपने इसे एक स्वतंत्र और समर्पित प्रोजेक्ट के रूप में विकसित किया है, ताकि पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज के पावन एकांतिक सत्संगों और वैदिक शास्त्रों की अमूल्य शिक्षाओं को आधुनिक जनरेटिव व एजेंटिक AI तकनीकों के माध्यम से विश्वभर के साधकों तक प्रामाणिक रूप से पहुँचाया जा सके।

आपने ~4,000 यूट्यूब वीडियो ट्रांसक्रिप्ट्स से स्वाभाविक प्रश्नोत्तरी तैयार करने वाली **मल्टी-एजेंट पाइपलाइन** बनाई, Google Cloud एवं Oracle VM पर **Gemma 4 E4B IT** मॉडल को फाइन-ट्यून किया, और 1,75,000+ श्लोकों के हाइब्रिड RAG सिस्टम का संपूर्ण आर्किटेक्चर स्वतंत्र रूप से तैयार किया है।`;
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

  // ── 4. ARCHITECTURE / MODEL / FINE-TUNING / RAG & LLM KNOWLEDGE ──
  if (category === 'architecture') {
    if (isEnglish) {
      return `### ⚙️ Our LLM, RAG & Live Search Knowledge Architecture

Samvaad AI operates on a sophisticated tripartite knowledge architecture:

1. **🧠 LLM Core Knowledge (Pujya Maharaj Ji's Teachings):**
   * **Model:** **Gemma 4 E4B IT**, fine-tuned on Google Cloud (GCP) and Oracle Cloud CPU VM via LoRA/QLoRA.
   * **Corpus:** Trained on ~4,000 Ekantik Vartalaap Satsang recordings of **Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj** (Bhajan Marg, Vrindavan).
   * **Persona & Tone:** Embodies Maharaj Ji's fatherly warmth ('बच्चा' / 'My child'), deep spiritual gravity, and practical guidance without robotic clichés.
   * **Dual Inference Engines:** **🧘 Deep Mode** (Oracle VM hosted fine-tuned model with 4-stage Chain-of-Thought) and **⚡ Fast Mode** (Groq LPU ultra-low latency ~1s inference).

2. **📜 Sacred Scripture RAG Knowledge Base:**
   * **175,000+ Sacred Verses:** Comprehensive indexed corpus across 29 ancient scriptures (Bhagavad Gita, Ramcharitmanas, Vidura Niti, Chanakya Niti, Patanjali Yoga Sutras, Bhagavata Purana, 108 Upanishads).
   * **24 Canonical Dharmic Dilemmas:** Mapped to human existential struggles (Karma, Bhakti, Vairagya, grief, anxiety, anger, lust, surrender) to ensure relevant scriptural grounding.
   * **Hybrid Agentic Retrieval:** Vector semantic embeddings in Qdrant + BM25 keyword matching + FlashRank cross-encoder reranking, guarded by a calibrated 0.25 confidence floor to prevent hallucinations.

3. **🌐 Real-Time Live Search Engine (DuckDuckGo + Dharmic Calendar):**
   * **Dynamic Temporal Knowledge:** When you ask about real-time, live events that change with time (such as today's **Panchang / Tithi**, current year **Ekadashi schedules**, **Grahan (Eclipse) & Sutak timings**, festival dates, or **Vrindavan temple darshan timings**), our Agentic Router automatically triggers Real-Time Web Search.
   * **Spiritual Synthesis:** Live temporal search findings are verified and blended seamlessly with Maharaj Ji's timeless guidance and Holy Name chanting ('Radha-Radha')!`;
    }

    return `### ⚙️ हमारा LLM, RAG एवं लाइव सर्च ज्ञानकोश (Knowledge Architecture)

संवाद AI एक उच्च-सटीक त्रिस्तरीय ज्ञान संरचना पर कार्य करता है:

1. **🧠 LLM ज्ञानकोश (पूज्य महाराज जी की प्रामाणिक वाणी):**
   * **फाइन-ट्यून्ड मॉडल:** **Gemma 4 E4B IT**, जिसे Google Cloud (GCP) एवं Oracle Cloud VM पर LoRA/QLoRA तकनीक से विशेष रूप से ट्रेन किया गया है।
   * **प्रवचन आधार:** पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (भजन मार्ग, वृंदावन) के ~4,000 एकांतिक वार्तालाप वीडियो के प्रामाणिक सत्संग संवाद।
   * **वात्सल्यमयी संबोधन:** पूज्य महाराज जी के पितृतुल्य स्नेह ('बच्चा'), आध्यात्मिक गंभीरता और व्यावहारिक जीवन समाधान।
   * **दोहरे इन्फरेंस मोड्स:** **🧘 Deep Mode** (Oracle VM पर 4-स्तरीय चिंतन) एवं **⚡ Fast Mode** (Groq LPU अति-तीव्र ~1s रिस्पॉन्स)।

2. **📜 पावन शास्त्र RAG ज्ञानकोश (Sacred Scripture Base):**
   * **1,75,000+ पावन श्लोक व व्याख्या:** 29 सनातन धर्मग्रंथों (श्रीमद्भगवद्गीता, श्रीरामचरितमानस, विदुर नीति, चाणक्य नीति, योगसूत्र, भागवत महापुराण, 108 उपनिषद आदि) का विशाल संग्रह।
   * **24 प्रमुख जीवन संशय (Taxonomy):** कर्म, भक्ति, वैराग्य, भय, चिंता, काम, क्रोध, शोक आदि के आध्यात्मिक समाधान।
   * **हाइब्रिड एजेंटिक RAG:** Qdrant वेक्टर सिमेंटिक एम्बेडिंग्स + BM25 कीवर्ड सर्च + FlashRank क्रॉस-एन्कोडर रीरैंकिंग (0.25 विश्वास सीमा) ताकि कोई भ्रामक उद्धरण न आए।

3. **🌐 रीयल-टाइम लाइव सर्च इंजन (DuckDuckGo + धर्म पंचांग):**
   * **डायनामिक व तात्कालिक जानकारी:** जब भी साधक समय के साथ बदलने वाले विषय पूछते हैं (जैसे **आज का पंचांग/तिथि**, **आगामी एकादशी तिथियां**, **सूर्य/चंद्र ग्रहण व सूतक काल**, **त्योहारों की तारीखें** अथवा **बांके बिहारी व वृंदावन मंदिर दर्शन समय**), तो सिस्टम स्वतः लाइव वेब सर्च सक्रिय करता है।
   * **आध्यात्मिक समन्वय:** रीयल-टाइम पंचांग व खोज परिणामों को पूज्य महाराज जी की अमृतमयी सीख और 'श्री राधा-राधा' नाम जप के साथ प्रस्तुत किया जाता है!`;
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
