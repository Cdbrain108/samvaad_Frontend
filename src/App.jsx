import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChange, saveConversation, getUserConversations, getConversation, updateConversation, getUserMemory, saveUserMemory, getUserProfileInfo, saveUserProfileInfo, signInWithGoogle } from './services/firebase';
import { generateGuruResponse, streamGuruResponse, generateChatTitle, isCasualConversational } from './services/guruService';
import Composer from './components/Composer';
import Icon from './components/Icon';
import LandingPage from './components/LandingPage';
import ChatHistory from './components/ChatHistory';
import Login from './components/Login';
import Welcome from './components/Welcome';
import OnboardingModal from './components/OnboardingModal';
import { promptSuggestions } from './data/prompts';
import VoiceMode from './components/VoiceMode/VoiceMode';
import VoiceCloneModal from './components/VoiceMode/VoiceCloneModal';
import useVoiceMode from './hooks/useVoiceMode';
import ReasoningBlock from './components/ReasoningBlock';
import { getVoiceCloneUrl } from './services/ttsService';

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

/* Light markdown with smooth sequential typewriter stream */
function RichText({ content, streaming = false }) {
  const [displayedText, setDisplayedText] = useState(content || '');

  useEffect(() => {
    if (!content) {
      setDisplayedText('');
      return;
    }

    // If displayedText has caught up with content, we're done typing
    if (displayedText === content) return;

    const diff = content.length - displayedText.length;
    if (diff < 0) {
      setDisplayedText(content);
      return;
    }

    // If not streaming and large jump (> 100 chars, e.g. switching chats), snap immediately
    if (!streaming && diff > 100) {
      setDisplayedText(content);
      return;
    }

    // Steady, readable typing pace so newly released sentences visibly type out sequentially
    const step = diff > 120 ? 3 : diff > 40 ? 2 : 1;
    const speed = diff > 120 ? 12 : diff > 40 ? 16 : 20;

    const timer = setTimeout(() => {
      setDisplayedText(content.slice(0, displayedText.length + step));
    }, speed);

    return () => clearTimeout(timer);
  }, [content, displayedText, streaming]);

  const activeText = streaming || displayedText.length < (content || '').length ? displayedText : content;
  const lines = (activeText || '').split('\n');
  const isActivelyTyping = streaming && displayedText.length < (content || '').length;

  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const isLast = index === lines.length - 1;
        const cursor = isActivelyTyping && isLast ? <span className="stream-cursor chat-cursor" aria-hidden="true" /> : null;

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
        const isArthat = /^(?:\*\*|\*|\b)?(?:अर्थात्|भावार्थ|अर्थ|meaning)\b/i.test(trimmed);
        const isShlok = !isArthat && (
          (trimmed.includes('«') && trimmed.includes('»')) ||
          (trimmed.includes('॥') && (trimmed.startsWith('**') || trimmed.endsWith('**') || trimmed.startsWith('«'))) ||
          (/^[«\*]+[\u0900-\u097F\s,।'॥\-]+[»\*]+$/.test(trimmed) && trimmed.length > 20)
        );

        const lineClasses = ['rich-line'];
        if (isShlok) lineClasses.push('rich-shlok-line');
        if (isArthat) lineClasses.push('rich-arthat-line');

        return (
          <span className={lineClasses.join(' ')} key={`p-${index}`}>
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

// ─── Guest Login Modal ──────────────────────────────────────────────────────
function GuestLoginModal({ onLogin, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        onLogin(result.user);
      }
    } catch {
      setError('Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-login-overlay" role="dialog" aria-modal="true" aria-label="Sign in required">
      <motion.div
        className="guest-login-modal"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <div className="guest-login-icon" aria-hidden="true">ॐ</div>
        <h2 className="guest-login-title">Continue Your Journey</h2>
        <p className="guest-login-desc">
          You've experienced a glimpse of Samvaad. Sign in with Google to unlock unlimited conversations, persistent memory, and your full spiritual journey.
        </p>

        {error && (
          <div className="guest-login-error" role="alert">{error}</div>
        )}

        <motion.button
          type="button"
          className="guest-google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
        </motion.button>

        <div className="guest-login-features">
          <span>✨ Unlimited questions</span>
          <span>🧠 Persistent memory</span>
          <span>📜 Chat history</span>
        </div>

        <button className="guest-login-dismiss" onClick={onClose} type="button" aria-label="Continue as guest">
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}

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
  // Guest user: track how many questions they've asked (limit = 1)
  // Use sessionStorage so the count survives Firebase auth re-fires (e.g. logout) within the same tab session
  const [guestMessageCount, setGuestMessageCount] = useState(() => {
    try { return parseInt(sessionStorage.getItem('samvaad_guest_q_count') || '0', 10); } catch { return 0; }
  });
  const [showGuestLoginModal, setShowGuestLoginModal] = useState(false);
  const [inferenceMode, setInferenceMode] = useState(() => {
    try {
      const explicit = localStorage.getItem('samvaad_user_mode_explicit');
      if (explicit) {
        return localStorage.getItem('samvaad_inference_mode') || 'deep';
      }
      // Always default to deep mode as intended
      localStorage.setItem('samvaad_inference_mode', 'deep');
      return 'deep';
    } catch {
      return 'deep';
    }
  });
  const [modeNotification, setModeNotification] = useState(null);
  const modeNotificationTimerRef = useRef(null);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [voiceCloneModalOpen, setVoiceCloneModalOpen] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try {
      return localStorage.getItem('samvaad_auto_speak') === 'true';
    } catch {
      return false;
    }
  });

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('samvaad_auto_speak', String(next));
      } catch {}
      return next;
    });
  }, []);

  const messagesEndRef = useRef(null);
  const contentAreaRef = useRef(null);
  const voice = useVoiceMode();


  const handleModeChange = useCallback((newMode) => {
    setInferenceMode(newMode);
    try {
      localStorage.setItem('samvaad_inference_mode', newMode);
      localStorage.setItem('samvaad_user_mode_explicit', 'true');
    } catch {
      /* ignore storage errors */
    }
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
  const scrollRafRef = useRef(null); // throttle lock — prevents scroll layout thrashing during streaming

  // Track user scroll position so streaming never locks the page or overrides manual scrolling
  const handleContentScroll = useCallback(() => {
    if (!contentAreaRef.current) return;
    const el = contentAreaRef.current;
    // If distance from bottom exceeds 80px, devotee has deliberately scrolled up to read/interact
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 80;
  }, []);

  // Auto-scroll to bottom — throttled via rAF to prevent visual shake during rapid streaming updates
  useEffect(() => {
    if (!contentAreaRef.current) return;
    if (userScrolledUpRef.current) return;

    // Cancel any pending scroll frame first (prevents back-to-back layout thrashes)
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);

    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!contentAreaRef.current || userScrolledUpRef.current) return;
      contentAreaRef.current.scrollTop = contentAreaRef.current.scrollHeight;
    });

    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
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
        // Clear any accumulated guest history — guests get session-only, no persistence
        try {
          localStorage.removeItem('samvad_chats_devotee_local');
        } catch (e) { }
        setConversations([]);
        setMessages([]);
        setCurrentConversationId(null);
        // NOTE: Do NOT reset guestMessageCount here — it lives in sessionStorage
        // and must survive logout so the 1-question limit stays enforced for the whole tab session.
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

    // Guest users get exactly 1 free question.
    // Double-check sessionStorage directly to guard against stale React closure state.
    const rawGuestCount = (() => {
      try { return parseInt(sessionStorage.getItem('samvaad_guest_q_count') || '0', 10); } catch { return guestMessageCount; }
    })();
    if (activeUser.uid === 'devotee_local' && (guestMessageCount >= 1 || rawGuestCount >= 1)) {
      setShowGuestLoginModal(true);
      return;
    }

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

    // Automatically play default opening audio blessing ("राधे राधे बच्चा...") when operation starts generation
    try {
      voice.playDefaultGreeting();
    } catch (e) {
      console.warn('[Audio] Failed to trigger opening blessing:', e);
    }

    try {
      const memoryContext = userMemory ? [
        `Summary: ${userMemory.summary || 'Devotee seeking spiritual guidance.'}`,
        userMemory.topics_explored?.length ? `Topics Explored: ${userMemory.topics_explored.join(', ')}` : '',
        userMemory.preferences?.length ? `Preferences: ${userMemory.preferences.join(', ')}` : ''
      ].filter(Boolean).join('\n') : '';

      const isCasual = isCasualConversational(message);
      const assistantMsg = {
        role: 'assistant',
        content: '',
        initialContent: '',
        subsequentContent: '',
        thought: (!isCasual && inferenceMode === 'deep') ? '🔍 जिज्ञासा व अंतर्मन की स्थिति: साधक के प्रश्न का शास्त्रीय विश्लेषण...' : '',
        isThinking: !isCasual && inferenceMode === 'deep',
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
          const hasVisiblePayload = typeof update === 'string'
            ? Boolean(update.trim())
            : Boolean(update?.content?.trim() || update?.thought?.trim() || update?.isThinking);

          if (hasVisiblePayload && !receivedAnyChunk) {
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
              thinkingDuration: update.thinkingDuration || 0,
              scripture: update.scripture || null
            }]);
          }
        }
      );

      setIsResponding(false);
      setIsStreaming(false);

      const finalCleanContent = (typeof streamResult === 'string' ? streamResult : streamResult?.content) || 'राधे राधे';
      const finalThought = typeof streamResult === 'object' ? (streamResult.thought || '') : '';
      const finalDuration = typeof streamResult === 'object' ? (streamResult.thinkingDuration || 0) : 0;
      const finalScripture = typeof streamResult === 'object' ? (streamResult.scripture || null) : null;

      const finalizedAssistantMsg = {
        role: 'assistant',
        content: finalCleanContent,
        initialContent: '',
        subsequentContent: '',
        thought: finalThought,
        isThinking: false,
        thinkingDuration: finalDuration,
        scripture: finalScripture,
        timestamp: new Date(),
        mode: inferenceMode
      };
      setMessages([...updatedMessagesWithUser, finalizedAssistantMsg]);

      if ((speakResponse || autoSpeak) && finalCleanContent) {
        voice.speak(finalCleanContent);
      }


      // Guest users: no persistence — session only, increment their question counter
      if (activeUser.uid === 'devotee_local') {
        setGuestMessageCount(prev => {
          const next = prev + 1;
          try { sessionStorage.setItem('samvaad_guest_q_count', String(next)); } catch {}
          return next;
        });
        // Don't save to localStorage or Firestore for guests
      } else {
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
      }
    } catch (err) {
      console.error('Error handling message:', err);
      const fallbackContent = 'राधे राधे बच्चा! मन को शांत रखिए और भगवन्नाम (राधा नाम) का आश्रय लीजिए। प्रभु सब मंगल करेंगे।';
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
    // Clear all in-memory state immediately
    setUser(null);
    setUserProfile(null);
    setConversations([]);
    setMessages([]);
    setCurrentConversationId(null);
    setUserMemory(null);
    setGuestMessageCount(0);
    setShowGuestLoginModal(false);
    setShowOnboarding(false);
    setView('landing');
    // Clear the session counter so a re-authenticated real user doesn’t inherit guest quota
    try { sessionStorage.removeItem('samvaad_guest_q_count'); } catch {}
  };

  // Handle successful sign-in from the guest modal — stay on chat page
  const handleGuestLoginSuccess = async (signedInUser) => {
    setShowGuestLoginModal(false);
    setUser(signedInUser);
    setGuestMessageCount(0);
    // Clear sessionStorage counter so this real user gets a clean slate
    try { sessionStorage.removeItem('samvaad_guest_q_count'); } catch {}
    // Load their Firestore conversations
    try {
      const result = await getUserConversations(signedInUser.uid, 50);
      if (!result.error && result.conversations.length > 0) {
        setConversations(result.conversations);
        try {
          localStorage.setItem(`samvad_chats_${signedInUser.uid}`, JSON.stringify(result.conversations));
        } catch (e) { }
      }
      const memResult = await getUserMemory(signedInUser.uid);
      if (!memResult.error) setUserMemory(memResult.memory);
      const profileRes = await getUserProfileInfo(signedInUser.uid);
      if (profileRes.profile && profileRes.profile.fullName) {
        setUserProfile(profileRes.profile);
      } else {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error('Error loading user data after guest login:', e);
    }
  };

  // QA bypass param guard — skip if QALandingWrapper is not defined
  const qaParams = new URLSearchParams(window.location.search);
  if (qaParams.get('qa') === 'landing') {
    // No-op: QALandingWrapper is not available in production build
    // Just fall through to normal rendering
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
        onLogout={handleLogout}
        onGuestSignIn={() => { setSidebarOpen(false); setShowGuestLoginModal(true); }}
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
              className={`icon-button ${autoSpeak ? 'auto-speak-active' : ''}`}
              aria-label={autoSpeak ? 'Auto-Voice Enabled: Maharaj Ji speaks replies automatically' : 'Auto-Voice Disabled'}
              title={autoSpeak ? '🔊 Auto-Voice ON: Maharaj Ji speaks every answer automatically' : '🔇 Auto-Voice OFF: Click to hear Maharaj Ji speak every answer automatically'}
              onClick={toggleAutoSpeak}
              style={autoSpeak ? { color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.6)', background: 'rgba(245, 158, 11, 0.15)' } : {}}
            >
              <Icon name={autoSpeak ? 'volume' : 'volume-x'} />
            </button>
            <button
              className={`icon-button ${getVoiceCloneUrl() ? 'voice-clone-active' : ''}`}
              aria-label="Pujya Maharaj Ji Voice Clone Setup"
              title={getVoiceCloneUrl() ? '🟢 Maharaj Ji Cloned Voice Active (Oracle 24/7)' : '⚙️ Connect Maharaj Ji Cloned Voice (Oracle Server)'}
              onClick={() => setVoiceCloneModalOpen(true)}
              style={getVoiceCloneUrl() ? { color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' } : {}}
            >
              <Icon name="settings" />
            </button>
            <button
              className={`icon-button ${voiceModeOpen ? 'voice-toggle-active' : ''}`}
              aria-label={voiceModeOpen ? 'Close Voice Mode' : 'Open Voice Mode'}
              aria-pressed={voiceModeOpen}
              onClick={() => setVoiceModeOpen((current) => !current)}
            >
              <Icon name="mic" />
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
                          <div className="engine-tags-wrapper">
                            <span className={`engine-tag ${message.mode === 'deep' ? 'tag-deep' : 'tag-fast'}`}>
                              {message.mode === 'deep' ? '🧘 Oracle Q8_0' : '⚡ Fast LPU'}
                            </span>
                            {message.scripture && (
                              <span className="rag-verified-badge" title={`Scripture Grounded: ${message.scripture.reference || ''}`}>
                                📜 RAG Grounded
                              </span>
                            )}
                          </div>
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
                              scripture={message.scripture}
                              isEnglish={index > 0 && messages[index - 1] ? !/[\u0900-\u097F]/.test(messages[index - 1].content || '') : false}
                            />
                          )}

                          {/* The entire response flows together in one unbroken, beautiful stream below the reasoning box */}
                          {message.content && (
                            <div className="rich-text">
                              <RichText content={message.content} streaming={isLastAssistant && (isStreaming || message.isThinking)} />
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
                        {message.role === 'assistant' && message.content && !isStreaming && (() => {
                          const isThisActive = voice.activeSpeech === message.content;
                          const isPreparing = isThisActive && voice.state === 'preparing';
                          const isSpeaking = isThisActive && voice.state === 'speaking';
                          const isPaused = isThisActive && voice.state === 'paused';

                          return (
                            <>
                              <CopyButton text={message.content} />
                              <button
                                className={`message-action ${isThisActive ? 'is-speaking-action' : ''}`}
                                onClick={() => {
                                  if (isSpeaking || isPaused) {
                                    voice.togglePause();
                                  } else if (isPreparing) {
                                    voice.stop();
                                  } else {
                                    voice.speak(message.content);
                                  }
                                }}
                                aria-label="Listen to Maharaj Ji Vani"
                                type="button"
                                title="पूज्य महाराज जी की प्रामाणिक आवाज़ (24/7 Cloned Voice)"
                                style={isThisActive ? { color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' } : {}}
                              >
                                <Icon name={isSpeaking ? 'pause' : 'volume'} size={14} />
                                {isPreparing ? '⏳ वाणी तैयार हो रही है...' : isSpeaking ? '⏸️ वाणी रोकें' : isPaused ? '▶️ वाणी सुनें' : '🌸 महाराज जी वाणी'}
                              </button>
                            </>
                          );
                        })()}

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

        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={submitMessage}
          guestLimitReached={user?.uid === 'devotee_local' && guestMessageCount >= 1}
          onGuestLimitClick={() => setShowGuestLoginModal(true)}
        />
      </main>

      <OnboardingModal isOpen={showOnboarding} onSubmit={handleOnboardingSubmit} />
      <VoiceCloneModal isOpen={voiceCloneModalOpen} onClose={() => setVoiceCloneModalOpen(false)} />

      {/* Guest login modal — overlays the chat page, no navigation */}
      <AnimatePresence>
        {showGuestLoginModal && (
          <GuestLoginModal
            onLogin={handleGuestLoginSuccess}
            onClose={() => setShowGuestLoginModal(false)}
          />
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
