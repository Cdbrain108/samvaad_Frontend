# Samvaad Frontend

### React + Firebase + Voice - The Spiritual Chat Interface

Part of the monorepo AI_Guru. See root README and ARCHITECTURE.md for full system, RAG architecture, and deployment.

Live demo: https://cdbrain108.github.io/samvaad_Frontend/

---

## Features

- Auth and Sync: Firebase Email/Password, Google Sign-In, Firestore users/{uid}/conversations with cross-device persistence
- Satsang Chat: Bilingual Hindi/English, real-time SSE streaming, condensed history to avoid context bloat
- Shastra Mode: Renders scripture verses with clear formatting, grounded by Tier-1 citation router plus hybrid RAG
- Dual Inference: Fast mode (~1.2s via Groq LPU) and Deep mode (Oracle Gemma2-9B Q8_0, ~6-8s streaming)
- Voice Trinity: Chatterbox voice clone, then Edge hi-IN-MadhurNeural, then Web Speech fallback
- Theme: Dark and Light via CSS variables, no UI library
- Deploy: Static dist folder to GitHub Pages, no secrets in browser

---

## Quick Start

```bash
git clone https://github.com/Cdbrain108/samvaad_Frontend.git
cd samvaad_Frontend
npm install

# Configure backend endpoint
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
# Optional voice clone endpoint
# VITE_VOICE_CLONE_URL=http://localhost:8008
# Firebase config
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...

npm run dev
npm run build
```

See root README.md for full stack and API docs.

---

## API Contract

Frontend calls your backend:

```js
// POST ${VITE_API_BASE_URL}/api/generate
{ messages: [{ role: "user", content: "Radhe Radhe?" }], mode: "deep" }
// returns { content: "...", scripture: {...} }

// POST ${VITE_API_BASE_URL}/api/generate/stream
// streams SSE events: data: {"scripture": {...}} then data: {"token": "..."}
```

---

## Project Structure

```text
src/
  App.jsx                 Main chat state, auth, streaming
  components/
    ChatHistory.jsx       Sidebar with Firestore conversations
    Composer.jsx          Chat input with quick-prompt toolbar
    Welcome.jsx           Empty state with suggestions
    VoiceMode/            Voice recording and playback UI
  services/
    firebase.js           Auth and Firestore
    guruService.js        Backend API calls
    ttsService.js         3-layer voice pipeline
  styles.css              Base theme
  samvaad-theme.css       Brand overrides and mobile fixes
```

---

## Deploy

```bash
npm run build
npm i -D gh-pages
npm run deploy
```

Then enable GitHub Pages from the gh-pages branch in Settings Pages.

---

Full docs: root README.md, ARCHITECTURE.md, docs folder.
