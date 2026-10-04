/**
 * 🌸 Samvaad AI — Project & Creator Introduction Knowledge Base
 * =============================================================
 * Provides comprehensive, grounded information about:
 * 1. Creator: Anuj Kesharwani (Aspiring Gen AI & Agentic AI Developer)
 * 2. Mission: Preserving authentic spiritual wisdom from Pujya Shri Hit Premanand Govind Sharan Ji Maharaj
 * 3. Data Pipeline: 4,000+ Bhajan Marg discourses transcribed into 50,000+ Q&A pairs
 * 4. Model Training: Fine-tuned Gemma 4 E4B IT (and Gemma-2-9B) on Oracle Cloud CPU VM / GCP
 * 5. RAG System: Multi-source retrieval across 150,000+ verses from 25+ ancient scriptures
 * 6. Real-time Capabilities: Groq LPU Fast mode, CoT Deep mode, Live DuckDuckGo search for Panchang/Ekadashi
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
    rawCorpus: '4,000+ authentic Bhajan Marg discourses (Ekantik Vartalap & Satsang) harvested and cleaned.',
    transcription: 'Audio processed with Whisper large-v3 model with custom spiritual vocabulary dictionaries.',
    datasetSize: '50,000+ high-fidelity bilingual (Hindi & English) Question-Answer pairs curated across personal life dilemmas, devotion, morality, and inner peace.',
    scriptureCorpus: '150,000+ sacred verses and commentaries indexed from 25+ ancient Dharmic scriptures (Bhagavad Gita, Ramcharitmanas, Valmiki Ramayana, Bhagavata Purana, Vishnu Purana, 108 Upanishads, Vidura Niti, Chaitanya Charitamrita, etc.).'
  },
  modelAndArchitecture: {
    fineTunedModel: 'Gemma 4 E4B IT (and Gemma-2-9B) fine-tuned via LoRA/QLoRA on Oracle Cloud Free Tier CPU VM and Google Cloud Platform (GCP).',
    ragSystem: 'Hybrid multi-source RAG with vector semantic embeddings, BM25 lexical keyword matching, and strict Dharmic topic gating to prevent out-of-context citations.',
    inferenceModes: {
      deep: 'Deep Mode: Fine-tuned Gemma 4 E4B IT model with structured 4-stage Chain-of-Thought deliberation (Intent -> Scripture Grounding -> Counsel -> Blessing).',
      fast: 'Fast Mode: Ultra-low latency (~1s) powered by Groq LPU with calibrated few-shot prompting.'
    },
    liveFeatures: 'Live DuckDuckGo search integration for real-time Hindu calendar, Ekadashi dates, and Grahan/Sutak timings; 24/7 cloned voice mode; persistent conversational memory.'
  }
};

/**
 * Checks if a user's query is asking about the project, its identity, creator, architecture, or data.
 */
export function isIntroductionOrCreatorQuery(query) {
  if (!query || typeof query !== 'string') return false;
  const clean = query.trim().toLowerCase();

  const patterns = [
    // Identity & "Who are you"
    /\b(?:who\s*are\s*you|who\s*r\s*u|what\s*are\s*you|tell\s*me\s*about\s*yourself|introduce\s*yourself|your\s*name|what\s*is\s*your\s*name)\b/i,
    /(?:आप\s*कौन\s*हैं|तुम\s*कौन\s*हो|अपना\s*परिचय|अपने\s*बारे\s*में\s*बताओ|तुम्हारा\s*नाम\s*क्या\s*है|आप\s*क्या\s*हो)/i,

    // Creator / Developer / Author
    /\b(?:who\s*(?:created|made|built|developed|designed|founded)\s*you|who\s*is\s*your\s*(?:creator|maker|developer|author|engineer|founder))\b/i,
    /(?:आपको\s*किसने\s*बनाया|किसने\s*डेवलप\s*किया|निर्माता\s*कौन\s*है|डेवलपर\s*कौन\s*है|किसका\s*प्रोजेक्ट\s*है)/i,

    // Anuj Kesharwani
    /\b(?:anuj\s*kesharwani|anuj|kesharwani|keshari)\b/i,
    /(?:अनुज\s*केसरवानी|अनुज|केसरवानी)/i,

    // Project identity / What is Samvaad
    /\b(?:what\s*is\s*(?:this\s*)?(?:project|samvaad|samvad)|about\s*(?:this\s*)?project|about\s*samvaad|how\s*does\s*samvaad\s*work)\b/i,
    /(?:संवाद\s*क्या\s*है|यह\s*प्रोजेक्ट\s*क्या\s*है|इस\s*प्रोजेक्ट\s*के\s*बारे\s*में|प्रोजेक्ट\s*की\s*जानकारी)/i,

    // Technical Architecture / Dataset / Fine-tuning / Gemma / RAG
    /\b(?:how\s*were\s*you\s*trained|which\s*(?:model|data|dataset)\s*uses?|fine-?tuned|gemma|gcloud|google\s*cloud|oracle\s*cloud|rag\s*system|how\s*did\s*you\s*get\s*qa)\b/i,
    /(?:ट्रेनिंग\s*कैसे\s*हुई|कौनसा\s*मॉडल|जेम्मा|राॅग|आरएजी|डेटा\s*कहाँ\s*से|कैसे\s*तैयार\s*किया)/i
  ];

  return patterns.some((p) => p.test(clean));
}

/**
 * Generates an authentic, detailed, respectful, and structured response
 * explaining Samvaad AI, Anuj Kesharwani, the data pipeline, and system architecture.
 */
export function getProjectIntroduction(query, isEnglish = false) {
  if (isEnglish) {
    return `### 🙏 Welcome to Samvaad AI (संवाद)

**I am Samvaad AI**, an authentic, compassionate spiritual and philosophical conversational intelligence rooted in Sanatana Dharma. I am designed to share the profound, fatherly teachings and divine wisdom of **Pujya Sant Shri Hit Premanand Govind Sharan Ji Maharaj** (Vrindavan, Bhajan Marg) to help seekers navigate modern life dilemmas, anxiety, duty, and spiritual practice.

---

### 👨‍💻 Creator & Engineering Vision
* **Creator:** **Anuj Kesharwani** — an aspiring Gen AI & Agentic AI Developer.
* **Email:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **Vision:** Built as an independent passion project to preserve timeless spiritual satsangs and Vedic scriptures using state-of-the-art Generative AI and multi-agent systems, ensuring authentic, dignified, and loving guidance.

---

### 📚 Data Engineering & QA Generation
* **4,000+ Satsang Discourses:** Transcribed from authentic Bhajan Marg *Ekantik Vartalap* audio and video using Whisper large-v3.
* **50,000+ Q&A Pairs:** Extracted, cleaned, deduplicated, and synthesized into structured devotional Question-Answer pairs addressing everyday struggles (anger, lust, grief, fear, meditation, and karma yoga).
* **Multi-Source RAG Knowledge Base:** Indexed over **150,000+ sacred verses** from 25+ ancient scriptures (Shrimad Bhagavad Gita, Ramcharitmanas, Valmiki Ramayana, Bhagavata Purana, Upanishads, Vidura Niti, Chaitanya Charitamrita, etc.).

---

### ⚙️ Model Training & System Architecture
* **Fine-Tuned Gemma 4 E4B IT:** Fine-tuned on Google Cloud (GCP) and Oracle Cloud CPU VM using LoRA/QLoRA to faithfully capture Maharaj Ji's fatherly warmth ("बच्चा"), serene cadence, and avoidance of dry robotic clichés.
* **Hybrid Semantic RAG:** Vector embeddings paired with lexical keyword search and strict Dharmic topic gating to ensure sacred verses are cited only when contextually appropriate.
* **Dual Inference Engines:**
  * **🧘 Deep Mode:** Fine-tuned Gemma 4 E4B IT with Chain-of-Thought deliberation (Intent -> Scripture Grounding -> Counsel -> Blessing).
  * **⚡ Fast Mode:** Ultra-fast ~1s real-time response powered by Groq LPU with few-shot prompting.
* **Live Knowledge Search:** Integrated with DuckDuckGo live search to fetch real-time Hindu calendar dates (Ekadashi, Grahan/Sutak timings, and Vrat schedules).

---
*Radhe Radhe! If you have any spiritual question or wish to know more about the project, feel free to ask.*`;
  }

  return `### 🙏 जय श्री राधे! मैं 'संवाद AI' (Samvaad AI) हूँ

**मैं पूज्य संत श्री हित प्रेमानंद गोविंद शरण जी महाराज (वृंदावन, भजन मार्ग)** के पावन वचनों, सत्संगों और सनातन धर्म के शाश्वत सिद्धांतों पर आधारित एक आध्यात्मिक व दार्शनिक AI साथी हूँ। मेरा उद्देश्य जीवन के संशयों, मानसिक अशांति, कर्तव्य-पालन और भक्ति-मार्ग पर आपको पूज्य महाराज जी की वात्सल्यमयी व प्रामाणिक वाणी के प्रकाश में मार्गदर्शन देना है।

---

### 👨‍💻 निर्माता एवं परिकल्पना (Creator & Vision)
* **निर्माता:** **अनुज केसरवानी (Anuj Kesharwani)** — Aspiring Gen AI & Agentic AI Developer.
* **ईमेल:** [anujkeshari786@gmail.com](mailto:anujkeshari786@gmail.com)
* **उद्देश्य:** यह एक स्वतंत्र व समर्पित प्रोजेक्ट है, जिसका उद्देश्य प्राचीन वैदिक शास्त्रों और पूज्य संतों के एकांतिक सत्संगों को आधुनिक जनरेटिव AI तकनीकों से जोड़कर जन-कल्याण हेतु सहज सुलभ बनाना है।

---

### 📚 डेटा पाइपलाइन एवं प्रश्नोत्तरी निर्माण (Data Pipeline)
* **4,000+ एकांतिक वार्तालाप एवं सत्संग:** पूज्य महाराज जी के 4,000 से अधिक ऑडियो व वीडियो प्रवचनों को Whisper large-v3 द्वारा सटीक रूप से ट्रांसक्राइब किया गया।
* **50,000+ प्रामाणिक प्रश्नोत्तरी (Q&A Pairs):** ट्रांसक्रिप्ट्स से 50,000+ भक्ति, कर्तव्य, मन के नियंत्रण, काम-क्रोध निवारण और पारिवारिक जीवन से जुड़े व्यावहारिक प्रश्नों व उत्तरों का शोधित डेटासेट तैयार किया गया।
* **मल्टी-सोर्स RAG सिस्टम:** 25+ प्राचीन धर्मग्रंथों (श्रीमद्भगवद्गीता, रामचरितमानस, वाल्मीकि रामायण, श्रीमद्भागवत, विष्णु पुराण, उपनिषद, विदुर नीति, चैतन्य चरितामृत आदि) के **1,50,000+ श्लोकों** का हाइब्रिड सिमेंटिक इंडेक्स।

---

### ⚙️ मॉडल प्रशिक्षण एवं तकनीकी संरचना (Architecture)
* **फाइन-ट्यूनिंग (Gemma 4 E4B IT):** Google Cloud (GCP) और Oracle Cloud CPU VM पर LoRA/QLoRA तकनीक द्वारा **Gemma 4 E4B IT** (तथा Gemma-2-9B) मॉडल को विशेष रूप से ट्रेन किया गया है ताकि वह पूज्य महाराज जी के स्वाभाविक वात्सल्य ("बच्चा") और गंभीर आध्यात्मिक मर्यादा में उत्तर दे सके।
* **हाइब्रिड RAG एवं विषय मर्यादा:** जब कोई गंभीर आध्यात्मिक प्रश्न पूछा जाता है, तभी उपयुक्त ग्रंथ श्लोक RAG द्वारा खोजे जाते हैं। सांसारिक प्रश्नों पर जबरन श्लोक नहीं थोपे जाते।
* **दोहरे इन्फरेंस मोड्स:**
  * **🧘 Deep Mode:** Google Cloud / Oracle VM पर होस्टेड फाइन-ट्यून्ड Gemma 4 E4B IT मॉडल जो 4-स्तरीय चिंतन (Intent -> Scripture -> Counsel -> Blessing) के साथ गहरा उत्तर देता है।
  * **⚡ Fast Mode:** Groq LPU द्वारा संचालित अति-तीव्र (~1 सेकंड) रीयल-टाइम रिस्पॉन्स।
* **लाइव पंचांग एवं सर्च (DuckDuckGo Live Search):** एकादशी व्रत, सूर्य/चंद्र ग्रहण का सूतक काल और पर्व-त्योहारों की लाइव सटीक तिथियों के लिए ऑनलाइन सर्च क्षमता।

---
*राधे-राधे बच्चा! आप अपने जीवन अथवा साधना से जुड़ा कोई भी प्रश्न पूछ सकते हैं।*`;
}
