# Samvad AI - Spiritual Learning Companion

A React-based spiritual learning companion with authentication and persistent chat history using Firebase.

## Features

- **Email/Password Authentication** - Secure user registration and login
- **Persistent Chat History** - Conversations saved to Firestore database
- **Cross-device Sync** - Access your conversations from any device
- **AI Integration Ready** - Easy to connect with any LLM API
- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Theme** - User preference persistence
- **Voice Mode** - Free browser-native Hindi/English/Hinglish speech playback, custom controls, and optional speech-to-text where supported

## Tech Stack

- React 18 + Vite
- Firebase Authentication & Firestore
- Vanilla CSS with CSS Variables
- No external UI libraries

## Getting Started

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set security rules (see below)
5. Get your config:
   - Go to Project Settings > General
   - Copy the web app config object

### 2. Configure Firebase

Edit `src/services/firebase.js` and replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Set these rules in Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/conversations/{conversationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Configure the Samvaad API

The browser must never contain an LLM or TTS secret. Start the FastAPI service from the repository root and place its provider key only in `AI_Guru/.env`:

```bash
GROQ_API_KEY=your_server_only_groq_key
```

Then configure the frontend (`samvad-ai-ui.preview.emergentagent.com/.env.local`):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Run the backend from `AI_Guru`:

```bash
uvicorn backend.main:app --reload --port 8000
```

The frontend calls `POST /api/generate`. It accepts `{ messages, temperature, max_tokens }` and returns `{ content }`. In production, deploy this FastAPI app separately (for example on a free-tier container service) and set `VITE_API_BASE_URL` to its HTTPS URL before building GitHub Pages.

### 7. Voice Mode

Voice Mode uses the browser's Web Speech API by default: it has no API key, no audio files, and works with the existing static GitHub Pages frontend. Open the speaker button in chat, ask a question from the Voice Mode panel, and use its custom pause, stop, replay, speed, volume, and mute controls. The optional microphone only asks for permission after its button is pressed.

Speech quality, Hindi/Sanskrit pronunciation, and microphone availability depend on voices installed by the browser/operating system. This is the free-tier limitation. `src/services/ttsService.js` is the provider boundary; replace `generateSpeech()` with a secure server TTS request later if consistent cross-platform voices are needed. The UI and avatar-state hooks do not need to change.

### 8. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Authentication form
│   ├── ChatHistory.jsx    # Conversation sidebar
│   ├── Composer.jsx       # Message input
│   ├── Welcome.jsx        # Welcome screen
│   ├── Sidebar.jsx        # Legacy sidebar (unused)
│   ├── LandingPage.jsx    # Marketing landing page
│   ├── Icon.jsx           # SVG icons
│   └── Logo.jsx           # Brand logo
├── services/
│   └── firebase.js        # Firebase auth & database functions
├── data/
│   └── prompts.js         # Suggestion prompts
├── App.jsx                # Main app component
├── main.jsx               # Entry point
└── styles.css             # All styles
```

## Connecting an LLM API

To connect a real AI model, modify the `createReply` function in `App.jsx`:

```javascript
async function createReply(message, conversationHistory) {
  // Example with OpenAI
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message, 
      history: conversationHistory 
    })
  });
  const data = await response.json();
  return data.reply;
}
```

Then update `submitMessage` to pass conversation history:

```javascript
const assistantMessage = { 
  role: 'assistant', 
  content: await createReply(message, messages), 
  timestamp: new Date() 
};
```

## Data Model

### Conversation Document (Firestore)
```javascript
{
  id: "auto-generated",
  title: "Conversation title from first message",
  messages: [
    { role: "user", content: "Hello", timestamp: Timestamp },
    { role: "assistant", content: "Hi there!", timestamp: Timestamp }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables for Firebase config
4. Deploy

### Netlify
Similar process - connect repo, add env vars, deploy.

## Environment Variables

```bash
# Frontend, public URL only — never a provider secret
VITE_API_BASE_URL=https://your-samvaad-api.example.com

# Backend only
GROQ_API_KEY=your_server_only_groq_key
```

Firebase configuration may remain Vite variables:

For production, use environment variables instead of hardcoding Firebase config:

```bash
# .env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then in `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## License

MIT License - Feel free to use for learning and projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request