# 🕉️ Samvaad Frontend — AI Guru Samvaad UI

### *Spiritual Learning Companion — React + Firebase + Voice*

[![Live Demo](https://img.shields.io/badge/Live-cdbrain108.github.io%2Fsamvaad__Frontend-2ea44f?style=for-the-badge&logo=github)](https://cdbrain108.github.io/samvaad_Frontend/)
[![Backend](https://img.shields.io/badge/Backend-ngrok%20%7C%20Cloudflare%20%7C%20HF-009688?style=for-the-badge&logo=fastapi)](https://immature-zen-earthen.ngrok-free.dev/health)
[![Voice](https://img.shields.io/badge/Voice-Chatterbox%20%7C%20Edge-9c27b0?style=for-the-badge&logo=microsoft)](https://immature-zen-earthen.ngrok-free.dev)
[![React](https://img.shields.io/badge/React-18%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)](https://vitejs.dev)

**Live:** **https://cdbrain108.github.io/samvaad_Frontend/** · **API:** **https://immature-zen-earthen.ngrok-free.dev**

![Demo](../docs/screenshots/demo.gif)
*30 sec: Fast vs Deep, Shastra, Voice — see `docs/screenshots/README.md` to replace placeholder*

The beautiful, responsive frontend for **AI Guru Samvaad** — where seekers chat with a Guru-styled AI (Premanand Maharaj), grounded in Shastra, with memory, streaming, and triple-voice.

> Part of the monorepo **[AI_Guru](../README.md)** — see root `README.md` + `ARCHITECTURE.md` + `docs/` for full system (Oracle A1, GGUF Q8_0, RAG, fine-tune).

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Auth & Sync** | Firebase Email/Password, Firestore `users/{uid}/conversations`, cross-device |
| **Satsang Chat** | Bilingual Hindi/English, streaming `SSE` `data: {token}` + `data: {scripture}`, 2-line history condense |
| **Shastra Mode** | Renders `**« श्लोक »**` + `**अर्थात् —**` with narrative intro |
| **Voice Trinity** | `getVoiceCloneUrl()` → Chatterbox `8008` (25s) → Edge `hi-IN-MadhurNeural` (-13%) → `speechSynthesis` |
| **Theme** | Dark/Light via CSS variables, no UI lib |
| **Deploy** | Static `dist/` → GitHub Pages (no secrets in browser) |

---

## 🚀 Quick Start

```bash
git clone https://github.com/Cdbrain108/samvaad_Frontend.git
cd samvaad_Frontend
npm install

# .env.local
echo "VITE_API_BASE_URL=https://immature-zen-earthen.ngrok-free.dev" > .env.local
echo "VITE_VOICE_CLONE_URL=https://female-richmond-myself-idle.trycloudflare.com" >> .env.local
# Firebase
# VITE_FIREBASE_API_KEY=...
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

See root `README.md` for full stack, API, and permanent tunnel docs.

---

## 🔌 API

Frontend calls **your** backend:

```js
// POST ${VITE_API_BASE_URL}/api/generate
{ messages: [{role:"user",content:"Radhe Radhe?"}], mode:"deep" }
// → { content: "देखो बच्चा... **« ... »**\n**अर्थात् —** ..." }
```

---

## 🌐 Permanent Tunnel

Old `trycloudflare.com` died. Now `ngrok` primary `https://immature-zen-earthen.ngrok-free.dev` + Cloudflare fallback `https://samvaad-ai-guru-cf.is-a.dev` + HF last. See `../docs/TUNNEL.md`.

---

## 🚀 Deploy

```bash
npm run build
npm i -D gh-pages
npm run deploy # → gh-pages branch → Settings → Pages
```

---

*Full docs → `../README.md`, `../ARCHITECTURE.md`, `../docs/`*
