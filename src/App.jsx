import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChange, saveConversation, getUserConversations, getConversation, updateConversation, getUserMemory, saveUserMemory, getUserProfileInfo, saveUserProfileInfo } from './services/firebase';
import { generateGuruResponse, streamGuruResponse, generateChatTitle } from './services/guruService';
import Composer from './components/Composer';
import Icon from './components/Icon';
import LandingPage from './components/LandingPage';
import ChatHistory from './components/ChatHistory';
import Login from './components/Login';
import Welcome from './components/Welcome';
import OnboardingModal from './components/OnboardingModal';
import { promptSuggestions } from './data/prompts';
import VoiceMode from './components/VoiceMode/VoiceMode';
import useVoiceMode from './hooks/useVoiceMode';
import ReasoningBlock from './components/ReasoningBlock';

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* Renders inline **bold** and `code` inside a line of guru text */
function renderInline(text, keyPrefix) {
  const nodes = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, index) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      nodes.push(<strong key={`${keyPrefix}-b${index}`}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      nodes.push(<code key={`${keyPrefix}-c${index}`} className="inline-code">{part.slice(1, -1)}</code>);
    } else {
      nodes.push(part);
    }
  });
  return nodes;
}

/* Light markdown: paragraphs, bullet & numbered lines, bold, inline code */
function RichText({ content, streaming = false }) {
  const lines = (content || '').split('\n');
  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const isLast = index === lines.length - 1;
        const cursor = streaming && isLast ? <span className="stream-cursor chat-cursor" aria-hidden="true" /> : null;

        if (!trimmed) {
          return <span className="rich-paragraph-spacer" key={`br-${index}`} aria-hidden="true" />;
        }
        if (/^[-•*]\s+/.test(trimmed)) {
          return (
            <span className="rich-bullet" key={`li-${index}`}>
              <i aria-hidden="true" />{renderInline(trimmed.replace(/^[-•*]\s+/, ''), `li${index}`)}{cursor}
            </span>
          );
        }
        if (/^\d+[.)]\s+/.test(trimmed)) {
          const number = trimmed.match(/^\d+[.)]/)[0];
          return (
            <span className="rich-bullet numbered" key={`nli-${index}`}>
              <i aria-hidden="true">{number.replace(/[.)]/, '')}</i>{renderInline(trimmed.replace(/^\d+[.)]\s+/, ''), `nli${index}`)}{cursor}
            </span>
          );
        }
        return (
          <span className="rich-line" key={`p-${index}`}>
            {renderInline(trimmed, `p${index}`)}{cursor}
          </span>
        );
      })}
    </>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) { /* clipboard unavailable */ }
  };

  return (
    <button className="message-action" onClick={copy} aria-label={copied ? 'Copied' : 'Copy reply'} type="button">
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const respondingPhrases = [
  'Reflecting on scriptures and remembered context',
  'Searching related Bhajan Marg teachings',
  'Composing a calm, pleasant reply',
];

function RespondingIndicator({ isDeep = false }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = isDeep ? [
    'Deep Mode: Oracle Cloud 24/7 GGUF server reflecting…',
    'Contemplating Ekantik Vartalap teachings…',
    'Polishing discourse with Maharaj Ji’s serene grace…',
  ] : respondingPhrases;

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length);
    }, 2100);
    return () => clearInterval(cycle);
  }, [phrases.length]);

  return (
    <p className="typing-text">
      <AnimatePresence mode="wait">
        <motion.em
          key={phraseIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {phrases[phraseIndex]}
        </motion.em>
      </AnimatePresence>
      <span className="chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
    </p>
  );
}

// QA Landing wrapper removed to allow full live chat interaction

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 900 : false));
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState('landing');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMemory, setUserMemory] = useState(null);
  const [inferenceMode, setInferenceMode] = useState('deep');
  const [modeNotification, setModeNotification] = useState(null);
  const modeNotificationTimerRef = useRef(null);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const contentAreaRef = useRef(null);
  const voice = useVoiceMode();

  const handleModeChange = useCallback((newMode) => {
    setInferenceMode(newMode);
    if (modeNotificationTimerRef.current) {
      clearTimeout(modeNotificationTimerRef.current);
    }
    setModeNotification(newMode);
    modeNotificationTimerRef.current = setTimeout(() => {
      setModeNotification(null);
    }, 2800);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const userScrolledUpRef = useRef(false);

  // Track user scroll position so streaming never locks the page or overrides manual scrolling
  const handleContentScroll = useCallback(() => {
    if (!contentAreaRef.current) return;
    const el = contentAreaRef.current;
    // If distance from bottom exceeds 80px, devotee has deliberately scrolled up to read/interact
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 80;
  }, []);

  // Auto-scroll chat to bottom ONLY if devotee hasn't scrolled up to read/inspect past dialogue
  useEffect(() => {
    if (!contentAreaRef.current) return;
    if (userScrolledUpRef.current) return;

    const el = contentAreaRef.current;
    // Direct container scroll: never interrupts touch/wheel events, never locks mouse clicks, buttons, or page controls
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Check LocalStorage for user profile info first for instant availability
        const localProfile = localStorage.getItem(`samvad_user_profile_${currentUser.uid}`);
        let hasProfile = false;
        if (localProfile) {
          try {
            const parsed = JSON.parse(localProfile);
            if (parsed && parsed.fullName) {
              setUserProfile(parsed);
              setShowOnboarding(false);
              hasProfile = true;
            }
          } catch (e) { }
        }

        // Fetch latest profile from Firestore
        const profileRes = await getUserProfileInfo(currentUser.uid);
        if (profileRes.profile && profileRes.profile.fullName) {
          setUserProfile(profileRes.profile);
          setShowOnboarding(false);
          try {
            localStorage.setItem(`samvad_user_profile_${currentUser.uid}`, JSON.stringify(profileRes.profile));
          } catch (e) { }
        } else if (!hasProfile) {
          setShowOnboarding(true);
        }

        // 2. Load user's conversations from LocalStorage first for instant offline availability
        const localData = localStorage.getItem(`samvad_chats_${currentUser.uid}`);
        if (localData) {
          try {
            setConversations(JSON.parse(localData));
          } catch (e) { }
        }

        // 3. Fetch latest conversations from Firestore
        const result = await getUserConversations(currentUser.uid, 50);
        if (!result.error && result.conversations.length > 0) {
          setConversations(result.conversations);
          try {
            localStorage.setItem(`samvad_chats_${currentUser.uid}`, JSON.stringify(result.conversations));
          } catch (e) { }
        }

        // 4. Load persistent user memory profile
        const memResult = await getUserMemory(currentUser.uid);
        if (!memResult.error) {
          setUserMemory(memResult.memory);
        }
      } else {
        const guestUser = {
          uid: 'devotee_local',
          displayName: 'Devotee',
          email: 'devotee@samvaad.local'
        };
        setUser(guestUser);
        try {
          const localData = localStorage.getItem('samvad_chats_devotee_local');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setConversations(parsed);
            } else {
              setConversations([]);
            }
          } else {
            setConversations([]);
          }
        } catch (e) {
          setConversations([]);
        }
        setMessages([]);
        setCurrentConversationId(null);
        setUserMemory(null);
        setUserProfile(null);
        setShowOnboarding(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingSubmit = async (profileData) => {
    setUserProfile(profileData);
    setShowOnboarding(false);
    if (user) {
      try {
        localStorage.setItem(`samvad_user_profile_${user.uid}`, JSON.stringify(profileData));
      } catch (e) { }
      await saveUserProfileInfo(user.uid, profileData);
    }
  };
  const ensureUser = () => {
    if (!user) {
      const guestUser = {
        uid: 'devotee_local',
        displayName: 'Devotee',
        email: 'devotee@samvaad.local'
      };
      setUser(guestUser);
      return guestUser;
    }
    return user;
  };

  const openChat = () => {
    ensureUser();
    setView('chat');
    window.scrollTo(0, 0);
  };

  /* Landing hero ask-box: jump into chat and immediately send the question */
  const askFromLanding = (question) => {
    ensureUser();
    setView('chat');
    window.scrollTo(0, 0);
    if (question && question.trim()) {
      setTimeout(() => submitMessage(question), 150);
    }
  };

  // Helper to finalize chat auto-naming when leaving a chat
  const maybeAutoNameChatOnLeave = async () => {
    const activeUser = user || ensureUser();
    if (!activeUser || !currentConversationId || messages.length < 2) return;
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv && (!currentConv.title || currentConv.title.endsWith('...') || currentConv.title === 'New Conversation')) {
      const newTitle = await generateChatTitle(messages);
      if (newTitle && newTitle !== 'New Conversation') {
        const updatedConvData = { ...currentConv, title: newTitle, updatedAt: new Date() };
        setConversations(prev => prev.map(c => c.id === currentConversationId ? updatedConvData : c));
        await updateConversation(activeUser.uid, currentConversationId, updatedConvData);
      }
    }
  };

  const startNewChat = async () => {
    voice.stop();
    await maybeAutoNameChatOnLeave();
    setMessages([]);
    setDraft('');
    setCurrentConversationId(null);
    setSidebarOpen(false);
  };

  const selectConversation = async (conversation) => {
    const activeUser = user || ensureUser();
    await maybeAutoNameChatOnLeave();
    if (conversation.messages && conversation.messages.length > 0) {
      setMessages(conversation.messages);
    } else {
      const result = await getConversation(activeUser.uid, conversation.id);
      if (!result.error && result.conversation && result.conversation.messages) {
        setMessages(result.conversation.messages);
      }
    }
    setCurrentConversationId(conversation.id);
    setSidebarOpen(false);
  };

  const deleteConversationHandler = (convId) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId);
      const activeUser = user || ensureUser();
      try {
        localStorage.setItem(`samvad_chats_${activeUser.uid}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (currentConversationId === convId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  };

  const submitMessage = async (explicitMessage, speakResponse = false) => {
    const activeUser = user || ensureUser();
    if (isResponding) return;

    const message = (typeof explicitMessage === 'string' ? explicitMessage : draft).trim();
    if (!message) return;

    userScrolledUpRef.current = false;
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTop = contentAreaRef.current.scrollHeight;
    }

    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    const updatedMessagesWithUser = [...messages, userMsg];
    voice.stop();
    setMessages(updatedMessagesWithUser);
    setDraft('');
    setIsResponding(true);

    try {
      const memoryContext = userMemory ? [
        `Summary: ${userMemory.summary || 'Devotee seeking spiritual guidance.'}`,
        userMemory.topics_explored?.length ? `Topics Explored: ${userMemory.topics_explored.join(', ')}` : '',
        userMemory.preferences?.length ? `Preferences: ${userMemory.preferences.join(', ')}` : ''
      ].filter(Boolean).join('\n') : '';

      const assistantMsg = {
        role: 'assistant',
        content: '',
        initialContent: '',
        subsequentContent: '',
        thought: '',
        isThinking: false, // Model starts directly without reasoning window!
        thinkingDuration: 0,
        timestamp: new Date(),
        mode: inferenceMode
      };

      let receivedAnyChunk = false;
      setIsStreaming(true);

      const streamResult = await streamGuruResponse(
        message,
        messages,
        memoryContext,
        userProfile,
        inferenceMode,
        (update) => {
          if (!receivedAnyChunk) {
            receivedAnyChunk = true;
            setIsResponding(false);
          }
          if (typeof update === 'string') {
            setMessages([...updatedMessagesWithUser, { ...assistantMsg, content: update, isThinking: false }]);
          } else {
            setMessages([...updatedMessagesWithUser, {
              ...assistantMsg,
              content: update.content || '',
              initialContent: update.initialContent || '',
              subsequentContent: update.subsequentContent || '',
              thought: update.thought || '',
              isThinking: Boolean(update.isThinking),
              thinkingDuration: update.thinkingDuration || 0
            }]);
          }
        }
      );

      setIsResponding(false);
      setIsStreaming(false);

      const finalCleanContent = (typeof streamResult === 'string' ? streamResult : streamResult?.content) || 'राधे राधे';
      const finalThought = typeof streamResult === 'object' ? (streamResult.thought || '') : '';
      const finalDuration = typeof streamResult === 'object' ? (streamResult.thinkingDuration || 0) : 0;

      const finalizedAssistantMsg = {
        role: 'assistant',
        content: finalCleanContent,
        initialContent: '',
        subsequentContent: '',
        thought: finalThought,
        isThinking: false,
        thinkingDuration: finalDuration,
        timestamp: new Date(),
        mode: inferenceMode
      };
      setMessages([...updatedMessagesWithUser, finalizedAssistantMsg]);

      if (speakResponse && finalCleanContent) {
        voice.speak(finalCleanContent);
      }

      const conversationData = {
        title: messages.length === 0 ? (message.length > 30 ? message.slice(0, 30) + '...' : message) : (conversations.find(c => c.id === currentConversationId)?.title || 'Spiritual Satsang'),
        messages: [...updatedMessagesWithUser, finalizedAssistantMsg],
        updatedAt: new Date()
      };

      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === currentConversationId);
        let updated;
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...conversationData };
        } else {
          updated = [{ id: currentConversationId || `local_${Date.now()}`, ...conversationData }, ...prev];
        }
        try {
          localStorage.setItem(`samvad_chats_${activeUser.uid}`, JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });

      if (currentConversationId) {
        await updateConversation(activeUser.uid, currentConversationId, conversationData);
      } else {
        const result = await saveConversation(activeUser.uid, {
          ...conversationData,
          createdAt: new Date()
        });
        if (!result.error && result.id) {
          setCurrentConversationId(result.id);
        }
      }
    } catch (err) {
      console.error('Error handling message:', err);
      const fallbackContent = 'राधे राधे भैया! मन को शांत रखिए और भगवन्नाम (राधा नाम) का आश्रय लीजिए। प्रभु सब मंगल करेंगे।';
      setMessages([...updatedMessagesWithUser, { role: 'assistant', content: fallbackContent, timestamp: new Date() }]);
    } finally {
      setIsResponding(false);
      setIsStreaming(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('./services/firebase');
      await logoutUser();
    } catch (e) { }
    setUser(null);
    setView('landing');
  };
  // TEMP QA BYPASS — remove before shipping (headless Chrome has no auth).
  const qaParams = new URLSearchParams(window.location.search);
  if (qaParams.get('qa') === 'landing') {
    return <QALandingWrapper qaParams={qaParams} />;
  }

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading"
          className="app-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
        >
          <span className="om-loading-mark" aria-hidden="true">ॐ</span>
          <p>Preparing your spiritual space…</p>
        </motion.div>
      )}

      {!loading && view === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingPage
            darkMode={darkMode}
            onEnter={openChat}
            onAsk={askFromLanding}
            onToggleTheme={() => setDarkMode((current) => !current)}
          />
        </motion.div>
      )}

      {!loading && view === 'login' && (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <Login onLogin={(u) => { setUser(u); setView('chat'); }} />
        </motion.div>
      )}

      {!loading && view === 'chat' && (
        <motion.div
          key="chat"
          className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
      <ChatHistory
        user={user}
        conversations={conversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversationHandler}
      />

      <main className="main-panel">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Toggle navigation"
            onClick={() => setSidebarOpen((current) => !current)}
          >
            <Icon name="menu" />
          </button>

          <div className="topbar-center">
            <button className="home-link" onClick={() => setView('landing')}>Back Home</button>
            <div className="mode-toggle-group" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '24px', padding: '3px 4px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                className={`mode-pill-btn ${inferenceMode === 'fast' ? 'active' : ''}`}
                onClick={() => handleModeChange('fast')}
                aria-label="Fast Mode: Ultra-fast LPU inference"
                aria-pressed={inferenceMode === 'fast'}
                style={{
                  background: inferenceMode === 'fast' ? 'linear-gradient(135deg, #d97706, #b45309)' : 'transparent',
                  color: inferenceMode === 'fast' ? '#ffffff' : 'var(--text-muted, #9ca3af)',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title="Ultra-fast LPU inference (~1s response)"
              >
                ⚡ <span className="mode-pill-btn-label-text">Fast</span>
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${inferenceMode === 'deep' ? 'active' : ''}`}
                onClick={() => handleModeChange('deep')}
                aria-label="Deep Mode: Fine-tuned Q8 Oracle model"
                aria-pressed={inferenceMode === 'deep'}
                style={{
                  background: inferenceMode === 'deep' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                  color: inferenceMode === 'deep' ? '#ffffff' : 'var(--text-muted, #9ca3af)',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
                title="Dedicated Oracle Cloud Q8 GGUF Server (~12s response)"
              >
                🧘 <span className="mode-pill-btn-label-text">Deep</span>
              </button>
            </div>
          </div>

          {modeNotification && (
            <div
              className="mode-switch-toast"
              role="status"
              aria-live="polite"
              style={{
                position: 'fixed',
                top: '70px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                maxWidth: '92vw',
                width: '580px',
                background: 'rgba(22, 17, 34, 0.96)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: modeNotification === 'deep' ? '1px solid rgba(167, 139, 250, 0.45)' : '1px solid rgba(251, 191, 36, 0.45)',
                boxShadow: modeNotification === 'deep' ? '0 12px 32px rgba(124, 58, 237, 0.35), 0 0 16px rgba(167, 139, 250, 0.2)' : '0 12px 32px rgba(217, 119, 6, 0.35), 0 0 16px rgba(251, 191, 36, 0.2)',
                borderRadius: '16px',
                padding: '12px 18px',
                color: '#f3f4f6',
                fontSize: '0.84rem',
                lineHeight: 1.55,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'modeToastFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              <div style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '1px' }}>
                {modeNotification === 'deep' ? '🧘' : '⚡'}
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: modeNotification === 'deep' ? '#c4b5fd' : '#fde68a',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {modeNotification === 'deep' ? 'Deep Mode' : 'Fast Mode'}
                  {modeNotification === 'deep' && (
                    <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.2)', color: '#ddd6fe' }}>Default</span>
                  )}
                </div>
                <div style={{ color: '#e5e7eb', fontSize: '0.82rem' }}>
                  {modeNotification === 'deep'
                    ? "Deep mode: Our fine tunned llm model with Premanand ji's whole youtube;s available teachings, takes some more time but give you authenthic guruji like response with its wording and knowledge and explaination style."
                    : "Fast mode: Quick response powered by Groq LPU which uses few shots and role bases propmting of guruji's"}
                </div>
              </div>
            </div>
          )}

          <div className="topbar-actions">
            <button
              className={`icon-button ${voiceModeOpen ? 'voice-toggle-active' : ''}`}
              aria-label={voiceModeOpen ? 'Close Voice Mode' : 'Open Voice Mode'}
              aria-pressed={voiceModeOpen}
              onClick={() => setVoiceModeOpen((current) => !current)}
            >
              <Icon name="volume" />
            </button>
            <button
              className="icon-button"
              aria-label={darkMode ? 'Use light theme' : 'Use dark theme'}
              onClick={() => setDarkMode((current) => !current)}
            >
              <Icon name={darkMode ? 'sun' : 'moon'} />
            </button>
            <div
              className="user-avatar"
              role="button"
              tabIndex={0}
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(true)}
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div
          className={`content-area ${voiceModeOpen ? 'voice-mode-active' : ''}`}
          ref={contentAreaRef}
          onScroll={handleContentScroll}
        >
          <VoiceMode
            open={voiceModeOpen}
            onClose={() => setVoiceModeOpen(false)}
            value={draft}
            onChange={setDraft}
            onAsk={() => submitMessage(undefined, true)}
            isResponding={isResponding}
            voice={voice}
          />
          {messages.length === 0 ? (
            <Welcome suggestions={promptSuggestions} onSelectPrompt={setDraft} />
          ) : (
            <section className="messages" aria-label="Conversation">
              {messages.map((message, index) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  index === messages.length - 1;
                return (
                  <motion.article
                    className={`message ${message.role}`}
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    style={{ animation: 'none' }}
                  >
                    <span className="message-avatar">
                      {message.role === 'user' ? 'You' : 'ॐ'}
                    </span>
                    <div>
                      <div className="message-sender-row">
                        <strong>{message.role === 'user' ? 'You' : 'Samvaad'}</strong>
                        {message.role === 'assistant' && (
                          <span className={`engine-tag ${message.mode === 'deep' ? 'tag-deep' : 'tag-fast'}`}>
                            {message.mode === 'deep' ? '🧘 Oracle Q8_0' : '⚡ Fast LPU'}
                          </span>
                        )}
                      </div>
                      {message.role === 'assistant' ? (
                        <div className="assistant-message-body">
                          {/* Reasoning Box is ALWAYS positioned at the top of the message */}
                          {message.mode === 'deep' && (message.thought || message.isThinking) && (
                            <ReasoningBlock
                              thought={message.thought}
                              isThinking={message.isThinking}
                              duration={message.thinkingDuration}
                            />
                          )}

                          {/* The entire response flows together in one unbroken, beautiful stream below the reasoning box */}
                          {message.content && (
                            <div className="rich-text">
                              <RichText content={message.content} streaming={isLastAssistant && isStreaming} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <div className="message-meta">
                        {message.timestamp && (
                          <time className="message-time">
                            {formatTimestamp(message.timestamp)}
                          </time>
                        )}
                        {message.role === 'assistant' && message.content && !isStreaming && (
                          <>
                            <CopyButton text={message.content} />
                            <button className="message-action" onClick={() => voice.speak(message.content)} aria-label="Listen to reply" type="button">
                              <Icon name="volume" size={14} /> Listen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
              <AnimatePresence>
                {isResponding && (
                  <motion.article
                    className="message assistant responding"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    style={{ animation: 'none' }}
                  >
                    <span className="message-avatar">ॐ</span>
                    <div>
                      <strong>Samvaad Guru</strong>
                      <RespondingIndicator isDeep={inferenceMode === 'deep'} />
                    </div>
                  </motion.article>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="messages-anchor" aria-hidden="true" />
            </section>
          )}
        </div>

        <motion.div
          className="diya-row"
          aria-hidden="true"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } } }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              className="diya"
              key={i}
              style={{ '--flick': `${(i * 0.37).toFixed(2)}s` }}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          ))}
        </motion.div>

        <Composer value={draft} onChange={setDraft} onSubmit={submitMessage} />
      </main>

      <OnboardingModal isOpen={showOnboarding} onSubmit={handleOnboardingSubmit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
