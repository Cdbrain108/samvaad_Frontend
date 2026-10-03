# 🏛️ Samvaad AI — Frontend Architecture & Developer Guide

> **Audience:** Researchers, developers, and reviewers who want to understand the exact mechanics of Samvaad's frontend, how components interact, and how data flows from user input to streaming response.

---

## 📌 1. High-Level Architecture Overview

Samvaad AI's frontend is a single-page React 19 application bundled with **Vite**. It features an authentic sacred aesthetic (day/night temple theme, parchment textures, fluid typography) coupled with an agentic spiritual chat interface.

`mermaid
graph TD
    User([Seeker / User]) -->|Types Question| Composer[Composer.jsx]
    Composer -->|Trigger submit| App[App.jsx]
    
    subgraph Client Services
        App --> QI[queryIntent.js]
        QI -->|Classifies intent| Gating{Is Casual Greeting?}
        Gating -->|Yes| DirectPrompt[Skip Verses]
        Gating -->|No| SS[scriptureService.js]
        SS -->|Lookup| DB[(scriptureDatabase.js)]
        SS -->|Matching Shlokas| PromptAugment[Context Injection]
    end

    subgraph Backend / Cloud LLM
        PromptAugment --> GS[guruService.js]
        GS -->|POST /api/generate| FastAPIServer[FastAPI Backend / Ollama]
        GS -.->|Fallback if server offline| CloudFallback[OpenAI / Groq Fallback]
    end

    subgraph Streaming & UI Rendering
        FastAPIServer -->|Server-Sent Events SSE| GS
        GS -->|Stream chunks| App
        App --> RB[ReasoningBlock.jsx]
        App --> RT[RichText.jsx]
        App --> TTS[ttsService.js]
    end
`

---

## 📂 2. File Organization

`
frontend/src/
├── App.jsx                  # Main application orchestrator & state manager
├── main.jsx                 # React root mounting & strict mode
│
├── components/              # Modular UI components
│   ├── LandingPage.jsx      # Marketing/intro page with hero & sacred aesthetics
│   ├── Composer.jsx         # User input text bar, voice trigger, and action buttons
│   ├── RichText.jsx         # Markdown renderer with typewriter effect & copy controls
│   ├── ReasoningBlock.jsx   # 4-stage spiritual deliberation thinking stepper
│   ├── RagVersesDropdown.jsx# Expandable panel showing retrieved scripture verses
│   ├── ChatHistory.jsx      # Drawer displaying saved conversations (from Firebase)
│   ├── Login.jsx            # User authentication dialog (Google & Email)
│   ├── Sidebar.jsx          # Left drawer menu navigation
│   ├── OnboardingModal.jsx  # Seeker preferences and initial guidance
│   ├── Welcome.jsx          # Greeting and starter conversation prompts
│   ├── TempleNightCanvas.jsx# Canvas animation for night temple stars & oil lamp glow
│   └── VoiceMode/           # Fullscreen 3D Avatar & voice conversation screen
│       └── SadhuAvatar3D.jsx# Three.js 3D character visualization
│
├── services/                # Business logic & external API interfaces
│   ├── guruService.js       # Manages streaming SSE connection to backend & fallback
│   ├── scriptureService.js  # Scripture search algorithm, relevance scoring & gating
│   ├── queryIntent.js       # Classifies user query into spiritual vs emotional vs greeting
│   ├── ttsService.js        # Voice generation (CosyVoice / Web Speech API)
│   └── firebase.js          # Google Firebase Auth & Firestore chat persistence
│
├── data/                    # Static datasets
│   └── scriptureDatabase.js # Curated 150K+ verse knowledge subset for client grounding
│
├── utils/                   # Clean helper functions
│   └── formatters.jsx       # Timestamp formatting, inline chips, text segmentation
│
└── styles/
    ├── styles.css           # Base layout, reset, and scrollbar styling
    ├── samvaad-theme.css    # Sacred day/night palette, typography & glassmorphism
    └── spiritual-v2.css     # Diya glows, parchment cards & golden accents
`

---

## 🧩 3. Key Components Explained

### 1. App.jsx (The Conductor)
- **Role:** Central state container for the application.
- **Key State Variables:**
  - messages: Array of chat turns ({ id, role, content, verses, thinking, timestamp }).
  - ctiveSessionId: Current chat session identifier (synced with Firebase Firestore).
  - isGenerating: Boolean flag indicating whether the LLM is currently streaming tokens.
  - 	heme: Toggle between 'day' (sandalwood/parchment) and 'night' (temple sanctum).
- **Core Loop:**
  1. Accepts user prompt from Composer.jsx.
  2. Runs nalyzeQuery from queryIntent.js to inspect user state.
  3. Uses scriptureService.js to pull grounded verses.
  4. Calls guruService.generateGuruStream(...) to receive SSE stream chunks.
  5. Updates UI progressively as each token arrives.

### 2. RichText.jsx (Smart Typography & Typewriter)
- **Role:** Renders assistant messages with syntax-highlighted markdown, Sanskrit verse boxes, and typewriter effects during live streaming.
- **Why It Matters:** Raw markdown from LLMs can look messy. RichText converts **bold**, Sanskrit transliterations, and verse citations into illuminated devotional cards.

### 3. ReasoningBlock.jsx (Thinking Stepper)
- **Role:** Displays the inner contemplation of the AI before it speaks:
  1. *Analyzing Seeker Intent*
  2. *Retrieving Grounded Verses*
  3. *Deliberating Maharaj Ji's Satsang Counsel*
  4. *Harmonizing Sacred Verses with Solace*
- Gives seekers transparency into *why* a particular verse was recommended.

### 4. Composer.jsx (Input Bar)
- **Role:** Sticky bottom input bar.
- Supports multiline auto-expanding textarea, Enter-to-send, voice mode launch button, and quick suggestion chips.

---

## ⚙️ 4. Services Explained

### 1. guruService.js (LLM Connector)
Sends requests to the backend server (POST /api/generate) with Server-Sent Events (SSE).
- Handles keep-alives, connection retries, and timeout fallbacks.
- If the local backend or Oracle VM is unreachable, gracefully switches to a backup API provider without interrupting the user.

### 2. scriptureService.js & scriptureDatabase.js (Client Grounding)
- Decoupled into a clean data file (scriptureDatabase.js) and a scoring engine (scriptureService.js).
- Uses multilingual query normalization, n-gram matching, and topic mapping across Gita, Ramcharitmanas, Bhagavatam, and Radha Sudha Nidhi.

### 3. 	tsService.js (Voice Synthesis)
- Converts generated spiritual discourse into spoken audio.
- Integrates neural voice models with browser Web Speech API fallbacks for low-latency playback.

### 4. irebase.js (Authentication & Persistence)
- Provides Google sign-in and email authentication.
- Automatically saves chat histories to Cloud Firestore so seekers can resume previous satsang conversations across devices.

---

## 🚀 5. How to Run & Build

### Development Mode:
`powershell
cd frontend
npm install
npm run dev
`
Open http://localhost:5173 in your browser.

### Production Build:
`powershell
npm run build
`
Creates an optimized, minified bundle in rontend/dist/.

---

## 🔗 6. How Frontend Connects to Backend

In rontend/src/services/guruService.js, the default API URL is configured via environment variables:
`javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
`
When running locally:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API calls go to: http://localhost:8000/api/generate
