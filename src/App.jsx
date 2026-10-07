import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChange, saveConversation, getUserConversations, getConversation, updateConversation, getUserMemory, saveUserMemory, getUserProfileInfo, saveUserProfileInfo, signInWithGoogle, loginUser, registerUser } from './services/firebase';
import { generateGuruResponse, streamGuruResponse, generateChatTitle, isCasualConversational, detectQueryLanguage } from './services/guruService';
import Composer from './components/Composer';
import Icon from './components/Icon';
import LandingPage from './components/LandingPage';
import ChatHistory from './components/ChatHistory';
import Login from './components/Login';
import Welcome from './components/Welcome';
import OnboardingModal from './components/OnboardingModal';
import { promptSuggestions } from './data/prompts';
import VoiceCloneModal from './components/VoiceMode/VoiceCloneModal';
import useVoiceMode from './hooks/useVoiceMode';
import ReasoningBlock from './components/ReasoningBlock';
import RagVersesDropdown from './components/RagVersesDropdown';
import { getVoiceCloneUrl } from './services/ttsService';
import RichText from './components/RichText';
import { formatTimestamp } from './utils/formatters';

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
    <button
      className={`message-action ${copied ? 'is-copied' : ''}`}
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy reply'}
      type="button"
      title="Copy Satsang discourse"
    >
      <Icon name={copied ? 'check' : 'copy'} size={13} />
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

const respondingPhrases = [
  '🌸 श्री राधा नाम स्मरण एवं पावन चिंतन...',
  'एकांतिक वार्तालाप एवं पूज्य महाराज जी के वचनों का अनुशीलन...',
  'साधक के प्रश्न का भावपूर्ण शास्त्रीय समाधान...',
];

function RespondingIndicator({ isDeep = false }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = [
    '🌸 श्री राधा नाम स्मरण एवं पावन चिंतन...',
    'एकांतिक वार्तालाप एवं पूज्य महाराज जी के वचनों का अनुशीलन...',
    'साधक के प्रश्न का भावपूर्ण शास्त्रीय समाधान...',
  ];

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length);
    }, 2200);
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
function GuestLoginModal({ onLogin, onClose, onOpenFullLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (isRegister) {
        result = await registerUser(email.trim(), password);
      } else {
        result = await loginUser(email.trim(), password);
      }
      if (result.error) {
        setError(result.error);
      } else {
        onLogin(result.user);
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed. Please try again.');
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
          You've experienced a glimpse of Samvaad. Sign in to unlock unlimited conversations, persistent memory, and your full spiritual journey.
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

        <div className="auth-divider" style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', fontSize: '0.78rem' }}>
          <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
          <span>or with email & password</span>
          <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
        </div>

        {!showEmailForm ? (
          <button
            type="button"
            className="guest-email-toggle-btn"
            onClick={() => setShowEmailForm(true)}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#e5e7eb',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>✉️</span> Sign in with Email / Password
          </button>
        ) : (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', textAlign: 'left' }}>
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder={isRegister ? 'Create a password (min 6 chars)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px'
              }}
            >
              {loading ? 'Please wait…' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.8rem', color: '#9ca3af' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                {isRegister ? 'Sign in' : 'Create one'}
              </button>
            </div>
          </form>
        )}

        <div className="guest-login-features">
          <span>✨ Unlimited questions</span>
          <span>🧠 Persistent memory</span>
          <span>📜 Chat history</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {onOpenFullLogin && (
            <button
              type="button"
              onClick={onOpenFullLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#a78bfa',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: 0.85,
                padding: '2px 6px'
              }}
            >
              Open dedicated login page ↗
            </button>
          )}
          <button className="guest-login-dismiss" onClick={onClose} type="button" aria-label="Continue as guest">
            Maybe later
          </button>
        </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('landing');

  // Always hide chat history for signed in users; keep shown for guest users on desktop
  useEffect(() => {
    const isGuest = !user || user.uid === 'devotee_local';
    if (!isGuest) {
      setSidebarOpen(false);
    } else if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      setSidebarOpen(true);
    }
  }, [user]);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      const explicit = localStorage.getItem('samvaad_theme_explicit');
      if (explicit) {
        return localStorage.getItem('samvaad_theme') === 'dark';
      }
      if (isMobile) {
        return false; // Day theme default for mobile
      }
      const saved = localStorage.getItem('samvaad_theme');
      if (saved) return saved === 'dark';
    } catch {}
    return true; // Night theme default for desktop
  });

  const [isMobileScreen, setIsMobileScreen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((current) => {
      const next = !current;
      try {
        localStorage.setItem('samvaad_theme', next ? 'dark' : 'light');
        localStorage.setItem('samvaad_theme_explicit', 'true');
      } catch {}
      return next;
    });
  }, []);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const currentConversationIdRef = useRef(null);
  const updateCurrentConvId = (id) => {
    currentConversationIdRef.current = id;
    setCurrentConversationId(id);
  };
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMemory, setUserMemory] = useState(null);
  // Guest user: track how many questions they've asked (limit = 1)
  // Use localStorage & sessionStorage so the 1 QA limit cannot be bypassed by new tabs, refreshes, or logout
  const [guestMessageCount, setGuestMessageCount] = useState(() => {
    try {
      const l = parseInt(localStorage.getItem('samvaad_guest_q_count') || '0', 10);
      const s = parseInt(sessionStorage.getItem('samvaad_guest_q_count') || '0', 10);
      return Math.max(isNaN(l) ? 0 : l, isNaN(s) ? 0 : s);
    } catch { return 0; }
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
  const activeAbortControllerRef = useRef(null);
  const voice = useVoiceMode();

  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // Handle Mobile Browser Hardware / Gesture Back Button
  useEffect(() => {
    // Push state for current view so pressing back button triggers popstate rather than exiting tab
    window.history.pushState({ samvaadView: view }, '', window.location.href);

    const handlePopState = () => {
      if (showExitConfirmModal) {
        setShowExitConfirmModal(false);
        window.history.pushState({ samvaadView: view }, '', window.location.href);
        return;
      }
      if (sidebarOpen) {
        setSidebarOpen(false);
        window.history.pushState({ samvaadView: view }, '', window.location.href);
        return;
      }
      if (voiceCloneModalOpen) {
        setVoiceCloneModalOpen(false);
        window.history.pushState({ samvaadView: view }, '', window.location.href);
        return;
      }
      if (showGuestLoginModal) {
        setShowGuestLoginModal(false);
        window.history.pushState({ samvaadView: view }, '', window.location.href);
        return;
      }

      // If user was in chat view and pressed mobile back button, return to landing page!
      if (view === 'chat') {
        setView('landing');
        return;
      }

      // If user was in landing view and pressed back button, don't just exit! Ask them first.
      if (view === 'landing') {
        setShowExitConfirmModal(true);
        window.history.pushState({ samvaadView: 'landing' }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [view, sidebarOpen, voiceCloneModalOpen, showGuestLoginModal, showExitConfirmModal]);


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

  // Track user scroll position so auto-scroll never locks the page or overrides manual scrolling
  const handleContentScroll = useCallback(() => {
    if (!contentAreaRef.current) return;
    const el = contentAreaRef.current;
    const currentScrollTop = el.scrollTop;
    // When distance from bottom exceeds 25px, user has scrolled up to read earlier messages/question
    const distanceFromBottom = el.scrollHeight - currentScrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 25;
  }, []);

  // Proactive mousewheel / trackpad detection: allows instantly scrolling up to view the query even during generation
  const handleContentWheel = useCallback((e) => {
    if (e.deltaY < 0) {
      // User wheeled up — immediately unlock manual scroll up
      userScrolledUpRef.current = true;
    } else if (e.deltaY > 0 && contentAreaRef.current) {
      const el = contentAreaRef.current;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom <= 25) {
        userScrolledUpRef.current = false;
      }
    }
  }, []);

  // Auto-scroll: ONLY while actively streaming, and ONLY if user is already at the bottom
  useEffect(() => {
    if (!isStreaming || !contentAreaRef.current) return;
    // NEVER force user back down if they intentionally scrolled up to read previous messages or query
    if (userScrolledUpRef.current) return;
    const el = contentAreaRef.current;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > 35) return;

    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  // Sync body viewport lock when entering or leaving chat view on mobile
  useEffect(() => {
    if (view === 'chat') {
      window.scrollTo(0, 0);
      document.body.classList.add('in-chat-view');
    } else {
      document.body.classList.remove('in-chat-view');
    }
    return () => {
      document.body.classList.remove('in-chat-view');
    };
  }, [view]);

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
        updateCurrentConvId(null);
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

  const isGuestUser = !user || user.uid === 'devotee_local';
  const getIsGuestLimitReached = () => {
    const isGuest = !user || user.uid === 'devotee_local';
    if (!isGuest) return false;
    try {
      const l = parseInt(localStorage.getItem('samvaad_guest_q_count') || '0', 10);
      const s = parseInt(sessionStorage.getItem('samvaad_guest_q_count') || '0', 10);
      return Math.max(isNaN(l) ? 0 : l, isNaN(s) ? 0 : s, guestMessageCount) >= 1;
    } catch {
      return guestMessageCount >= 1;
    }
  };

  const openChat = () => {
    const active = ensureUser();
    setView('chat');
    window.scrollTo(0, 0);
    const isGuest = !active || active.uid === 'devotee_local';
    if (!isGuest) {
      setSidebarOpen(false);
    } else if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      setSidebarOpen(true);
    }
  };

  /* Landing hero ask-box: jump into chat and immediately send the question */
  const askFromLanding = (question) => {
    const active = ensureUser();
    setView('chat');
    window.scrollTo(0, 0);
    const isGuest = !active || active.uid === 'devotee_local';
    if (!isGuest) {
      setSidebarOpen(false);
    } else if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      setSidebarOpen(true);
    }
    if (getIsGuestLimitReached()) {
      setShowGuestLoginModal(true);
      return;
    }
    if (question && question.trim()) {
      setTimeout(() => submitMessage(question), 150);
    }
  };

  // Helper to finalize chat auto-naming when leaving a chat
  const maybeAutoNameChatOnLeave = async () => {
    const activeUser = user || ensureUser();
    if (!activeUser || !currentConversationId || messages.length < 2) return;
    const activeId = currentConversationIdRef.current || currentConversationId;
    const currentConv = conversations.find(c => String(c.id) === String(activeId));
    if (currentConv && (!currentConv.title || currentConv.title.endsWith('...') || currentConv.title === 'New Conversation' || currentConv.title === 'Spiritual Satsang')) {
      const newTitle = await generateChatTitle(messages);
      if (newTitle && newTitle !== 'New Conversation') {
        const updatedConvData = { ...currentConv, title: newTitle, updatedAt: new Date() };
        setConversations(prev => prev.map(c => c.id === currentConversationId ? updatedConvData : c));
        await updateConversation(activeUser.uid, currentConversationId, updatedConvData);
      }
    }
  };

  const startNewChat = async () => {
    if (getIsGuestLimitReached()) {
      setShowGuestLoginModal(true);
      return;
    }
    if (activeAbortControllerRef.current) {
      try { activeAbortControllerRef.current.abort(); } catch {}
    }
    setIsStreaming(false);
    setIsResponding(false);
    voice.stop();
    await maybeAutoNameChatOnLeave();
    setMessages([]);
    setDraft('');
    updateCurrentConvId(null);
    setSidebarOpen(false);
  };

  const selectConversation = async (conversation) => {
    if (activeAbortControllerRef.current) {
      try { activeAbortControllerRef.current.abort(); } catch {}
    }
    setIsStreaming(false);
    setIsResponding(false);
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
    updateCurrentConvId(conversation.id);
    setSidebarOpen(false);
  };

  const deleteConversationHandler = (convId) => {
    setConversations(prev => {
      const updated = prev.filter(c => String(c.id) !== String(convId));
      const activeUser = user || ensureUser();
      try {
        localStorage.setItem(`samvad_chats_${activeUser.uid}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (String(currentConversationIdRef.current) === String(convId) || String(currentConversationId) === String(convId)) {
      setMessages([]);
      updateCurrentConvId(null);
    }
  };

  const clearAllConversationsHandler = async () => {
    const activeUser = user || ensureUser();
    const toDelete = [...conversations];
    setConversations([]);
    setMessages([]);
    updateCurrentConvId(null);
    try {
      localStorage.removeItem(`samvad_chats_${activeUser.uid}`);
    } catch (e) {}
    if (activeUser?.uid && activeUser.uid !== 'devotee_local' && toDelete.length > 0) {
      for (const conv of toDelete) {
        try {
          await deleteConversation(activeUser.uid, conv.id);
        } catch (e) {}
      }
    }
  };

  const submitMessage = async (explicitMessage, speakResponse = false) => {
    const activeUser = user || ensureUser();
    // Block ALL submissions while any response is in flight
    if (isResponding || isStreaming) return;

    const message = (typeof explicitMessage === 'string' ? explicitMessage : draft).trim();
    if (!message) return;

    // Immediately clear draft for instant, snappy input response
    setDraft('');

    // Lock activeChatId upfront so every message in this session stays in the exact SAME conversation
    let activeChatId = currentConversationIdRef.current;
    if (!activeChatId) {
      activeChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      updateCurrentConvId(activeChatId);
    }

    // Guest users get exactly 1 free question
    if (getIsGuestLimitReached()) {
      setShowGuestLoginModal(true);
      return;
    }

    userScrolledUpRef.current = false;
    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    const updatedMessagesWithUser = [...messages, userMsg];
    voice.stop();

    // Abort any previous pending stream
    if (activeAbortControllerRef.current) {
      try { activeAbortControllerRef.current.abort(); } catch {}
    }
    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    const isCasual = isCasualConversational(message);
    const isEng = detectQueryLanguage(message) === 'english';
    const isThinkingMode = !isCasual && (inferenceMode === 'deep' || inferenceMode === 'crew');

    const initialThought = isThinkingMode
      ? (isEng
          ? "Contemplating the seeker's spiritual inquiry, emotional state, and seeking divine guidance..."
          : "🌸 साधक के आंतरिक भाव, संशय और आध्यात्मिक स्थिति का अनुशीलन किया जा रहा है...")
      : '';

    const assistantMsg = {
      role: 'assistant',
      content: '',
      initialContent: '',
      subsequentContent: '',
      thought: initialThought,
      isThinking: isThinkingMode,
      thinkingDuration: 0,
      timestamp: new Date(),
      mode: inferenceMode
    };

    // Instant thinking start: In Deep/crew mode, mount the Reasoning Block directly under the query
    // with timer starting at 0.0s, eliminating disconnected placeholder delays.
    if (isThinkingMode) {
      setMessages([...updatedMessagesWithUser, assistantMsg]);
      setIsResponding(false);
    } else {
      setMessages(updatedMessagesWithUser);
      setIsResponding(true);
    }

    // Instant auto-scroll to the sent message on the very next render frame
    requestAnimationFrame(() => {
      if (contentAreaRef.current) {
        contentAreaRef.current.scrollTop = contentAreaRef.current.scrollHeight;
      }
    });

    if (speakResponse) {
      try {
        voice.playDefaultGreeting();
      } catch (e) {
        console.warn('[Audio] Failed to trigger opening blessing:', e);
      }
    }

    try {
      const memoryContext = userMemory ? [
        `Summary: ${userMemory.summary || 'Devotee seeking spiritual guidance.'}`,
        userMemory.topics_explored?.length ? `Topics Explored: ${userMemory.topics_explored.join(', ')}` : '',
        userMemory.preferences?.length ? `Preferences: ${userMemory.preferences.join(', ')}` : ''
      ].filter(Boolean).join('\n') : '';

      // GUEST LIMIT: Increment counter IMMEDIATELY before streaming starts.
      // Persist in both localStorage and sessionStorage so it cannot be bypassed.
      if (activeUser.uid === 'devotee_local') {
        setGuestMessageCount(prev => {
          const next = Math.max(prev + 1, 1);
          try {
            localStorage.setItem('samvaad_guest_q_count', String(next));
            sessionStorage.setItem('samvaad_guest_q_count', String(next));
          } catch {}
          return next;
        });
      }

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
        },
        abortController.signal
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

      if (speakResponse && finalCleanContent) {
        voice.speak(finalCleanContent);
      }


// Guest users: no persistence (counter already incremented above before streaming)
      if (activeUser.uid === 'devotee_local') {
        // Don't save to localStorage or Firestore for guests
      } else {
        const existingConv = conversations.find(c => String(c.id) === String(activeChatId));
        const conversationTitle = (existingConv && existingConv.title && existingConv.title !== 'Spiritual Satsang' && existingConv.title !== 'New Conversation')
          ? existingConv.title
          : (message.length > 35 ? message.slice(0, 35) + '...' : message);

        const conversationData = {
          title: conversationTitle,
          messages: [...updatedMessagesWithUser, finalizedAssistantMsg],
          updatedAt: new Date()
        };

        setConversations(prev => {
          const existingIndex = prev.findIndex(c => String(c.id) === String(activeChatId));
          let updated;
          if (existingIndex >= 0) {
            updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...conversationData, id: activeChatId };
          } else {
            updated = [{ id: activeChatId, ...conversationData, createdAt: new Date() }, ...prev];
          }
          try {
            localStorage.setItem(`samvad_chats_${activeUser.uid}`, JSON.stringify(updated));
          } catch (e) { }
          return updated;
        });

        try {
          await updateConversation(activeUser.uid, activeChatId, {
            ...conversationData,
            createdAt: existingConv?.createdAt || new Date()
          });
        } catch (e) {
          console.warn('[Chat History] Firestore update error:', e);
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
    const wasRealUser = user && user.uid !== 'devotee_local';
    try {
      const { logoutUser } = await import('./services/firebase');
      await logoutUser();
    } catch (e) { }
    // Clear all in-memory state immediately
    setUser(null);
    setUserProfile(null);
    setConversations([]);
    setMessages([]);
    updateCurrentConvId(null);
    setUserMemory(null);
    setShowGuestLoginModal(false);
    setShowOnboarding(false);
    setView('landing');
    if (wasRealUser) {
      setGuestMessageCount(0);
      try {
        localStorage.removeItem('samvaad_guest_q_count');
        sessionStorage.removeItem('samvaad_guest_q_count');
      } catch {}
    }
  };

  // Handle successful sign-in from the guest modal — stay on chat page
  const handleGuestLoginSuccess = async (signedInUser) => {
    setShowGuestLoginModal(false);
    setUser(signedInUser);
    setGuestMessageCount(0);
    // Clear storage counter so this real user gets a clean slate
    try {
      localStorage.removeItem('samvaad_guest_q_count');
      sessionStorage.removeItem('samvaad_guest_q_count');
    } catch {}
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
    <>
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
            user={user}
            userProfile={userProfile}
            onLogout={handleLogout}
            onSignIn={() => setView('login')}
            onToggleTheme={toggleTheme}
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
          <Login
            onLogin={(u) => { handleGuestLoginSuccess(u); setView('chat'); }}
            onBack={() => setView('chat')}
          />
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
        onClearAllConversations={clearAllConversationsHandler}
        onLogout={handleLogout}
        onGuestSignIn={() => { setSidebarOpen(false); setShowGuestLoginModal(true); }}
        onGoHome={() => { setSidebarOpen(false); setView('landing'); }}
      />

      <main className="main-panel">
        <header className="topbar topbar-visible">
          <div className={`topbar-left ${sidebarOpen ? 'sidebar-is-open' : ''}`}>
            <button
              className="icon-button menu-button"
              aria-label="Toggle navigation"
              onClick={() => setSidebarOpen((current) => !current)}
            >
              <Icon name="menu" />
            </button>
            <button
              className="icon-button home-topbar-btn"
              onClick={() => setView('landing')}
              title="Return to Home"
              aria-label="Return to Home"
            >
              <Icon name="home" size={17} />
            </button>
          </div>

          <div className="topbar-center">
            {/* Unified Deep / Fast mode toggle */}
            <div className="mode-toggle-group" role="group" aria-label="Select inference mode">
              <button
                type="button"
                className={`mode-pill-btn mode-pill-deep ${inferenceMode === 'deep' ? 'active' : ''}`}
                onClick={() => handleModeChange('deep')}
                aria-label="Deep Mode: Fine-tuned Guru model with profound contemplation"
                aria-pressed={inferenceMode === 'deep'}
                title="Deep Mode (गहन चिंतन): Fine-Tuned Guru Model + Vedic RAG + Groq Satsang Refiner"
              >
                <span className="mode-pill-icon" aria-hidden="true">🧘</span>
                <span className="mode-pill-btn-label-text">Deep</span>
                <span className="mode-pill-subtext" aria-hidden="true">गहन</span>
              </button>
              <button
                type="button"
                className={`mode-pill-btn mode-pill-fast ${inferenceMode === 'fast' ? 'active' : ''}`}
                onClick={() => handleModeChange('fast')}
                aria-label="Fast Mode: Ultra-fast LPU inference"
                aria-pressed={inferenceMode === 'fast'}
                title="Fast Mode (त्वरित समाधान): Instant Groq LPU inference with scripture guidance"
              >
                <span className="mode-pill-icon" aria-hidden="true">⚡</span>
                <span className="mode-pill-btn-label-text">Fast</span>
                <span className="mode-pill-subtext" aria-hidden="true">त्वरित</span>
              </button>
            </div>
          </div>

          <div className="topbar-actions">
            <div
              className="theme-pill-toggle chat-theme-toggle"
              role="group"
              aria-label="Toggle Day or Night theme"
            >
              <button
                type="button"
                className={`theme-pill-opt ${!darkMode ? 'is-active' : ''}`}
                onClick={() => { if (darkMode) toggleTheme(); }}
                aria-label="Day theme"
                aria-pressed={!darkMode}
                title="Switch to Day theme"
              >
                <span className="theme-pill-text">Day </span>☀️
              </button>
              <button
                type="button"
                className={`theme-pill-opt ${darkMode ? 'is-active' : ''}`}
                onClick={() => { if (!darkMode) toggleTheme(); }}
                aria-label="Night theme"
                aria-pressed={darkMode}
                title="Switch to Night theme"
              >
                <span className="theme-pill-text">Night </span>🌙
              </button>
            </div>
          </div>
        </header>

        {/* Mode switch feedback toast (positioned outside topbar to avoid overflow clipping) */}
        <AnimatePresence>
          {modeNotification && (
            <motion.div
              className={`mode-switch-toast mode-toast-${modeNotification}`}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 25 }}
            >
              <div className="mode-toast-icon-wrap" aria-hidden="true">
                {modeNotification === 'deep' ? '🧘' : '⚡'}
              </div>
              <div className="mode-toast-body">
                <div className="mode-toast-header">
                  <span className="mode-toast-title">
                    {modeNotification === 'deep' ? 'Deep Mode · गहन चिंतन' : 'Fast Mode · त्वरित समाधान'}
                  </span>
                  <span className={`mode-toast-badge ${modeNotification}`}>
                    {modeNotification === 'deep' ? 'Oracle + RAG' : 'Groq LPU'}
                  </span>
                </div>
                <p className="mode-toast-desc">
                  {modeNotification === 'deep'
                    ? "पूज्य महाराज जी के विचार-सूत्रों, वैदिक शास्त्र प्रमाण (RAG) व वात्सल्यमयी सत्संग समीक्षा के साथ गहरा, चिंतनशील समाधान।"
                    : "Groq LPU द्वारा तीव्र गति (~१-२ सेकंड) में प्रामाणिक शास्त्र संदर्भों सहित त्वरित सत्संग समाधान।"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`content-area${messages.length > 0 ? ' has-messages' : ''}`}
          ref={contentAreaRef}
          onScroll={handleContentScroll}
          onWheel={handleContentWheel}
        >
          {messages.length === 0 ? (
            <Welcome
              suggestions={promptSuggestions}
              onSelectPrompt={(prompt) => {
                if (getIsGuestLimitReached()) {
                  setShowGuestLoginModal(true);
                } else {
                  setDraft(prompt);
                }
              }}
            />
          ) : (
            <section className="messages" aria-label="Conversation">
              {messages.map((message, index) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  index === messages.length - 1;

                if (message.role === 'user') {
                  return (
                    <article
                      className="message user"
                      key={`user-${index}`}
                    >
                      <div className="user-message-wrap">
                        <div className="user-message-bubble">
                          <p>{message.content}</p>
                        </div>
                        {message.timestamp && (
                          <div className="message-meta user-message-meta">
                            <time className="message-time">
                              {formatTimestamp(message.timestamp)}
                            </time>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }

                return (
                  <motion.article
                    className="message assistant"
                    key={`assistant-${index}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    style={{ animation: 'none' }}
                  >
                    <div className="assistant-message-body">
                      {/* Reasoning Box is positioned at the top if in Deep mode */}
                      {message.mode === 'deep' && (message.thought || message.isThinking) && (
                        <ReasoningBlock
                          thought={message.thought}
                          isThinking={message.isThinking}
                          duration={message.thinkingDuration}
                          scripture={message.scripture}
                          isEnglish={index > 0 && messages[index - 1] ? detectQueryLanguage(messages[index - 1].content || '') === 'english' : false}
                        />
                      )}

                      {/* Open Typography flowing directly inside the Sacred Card Window */}
                      {message.content && (
                        <div className="rich-text">
                          <RichText content={message.content} streaming={isLastAssistant && (isStreaming || message.isThinking)} />
                        </div>
                      )}

                      {/* RAG Reference Dropdown Section */}
                      {message.scripture && !(isLastAssistant && (isStreaming || message.isThinking)) && (
                        <RagVersesDropdown
                          scripture={message.scripture}
                          isEnglish={index > 0 && messages[index - 1] ? !/[\u0900-\u097F]/.test(messages[index - 1].content || '') : false}
                        />
                      )}

                      {/* Only display metadata footer when message content has arrived */}
                      {message.content && (
                        <div className="message-meta">
                          {message.timestamp && (
                            <time className="message-time">
                              {formatTimestamp(message.timestamp)}
                            </time>
                          )}
                          {!isStreaming && (() => {
                            const isThisActive = voice.activeSpeech === message.content;
                            const isPreparing = isThisActive && voice.state === 'preparing';
                            const isSpeaking = isThisActive && voice.state === 'speaking';
                            const isPaused = isThisActive && voice.state === 'paused';

                            return (
                              <div className="message-actions-cluster">
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
                                  title="पूज्य महाराज जी की प्रामाणिक आवाज़"
                                  style={isThisActive ? { color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' } : {}}
                                >
                                  <Icon name={isSpeaking ? 'pause' : 'volume'} size={13} />
                                  <span>{isPreparing ? 'तैयार हो रही है...' : isSpeaking ? 'रोकें' : isPaused ? 'सुनें' : 'महाराज जी वाणी'}</span>
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
              <AnimatePresence>
                {isResponding && (
                  <motion.article
                    className="message assistant responding"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    style={{ animation: 'none' }}
                  >
                    <div className="assistant-message-body">
                      <RespondingIndicator isDeep={inferenceMode === 'deep'} />
                    </div>
                  </motion.article>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} className="messages-anchor" aria-hidden="true" />
            </section>
          )}
        </div>

        {messages.length === 0 && (
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
        )}




        <Composer
          value={draft}
          onChange={setDraft}
          onSubmit={submitMessage}
          isDisabled={isResponding || isStreaming}
          guestLimitReached={getIsGuestLimitReached() && !isResponding && !isStreaming}
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
            onOpenFullLogin={() => {
              setShowGuestLoginModal(false);
              setView('login');
            }}
          />
        )}
      </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Landing Page Mobile Back Exit Confirmation Dialog */}
    <AnimatePresence>
      {showExitConfirmModal && (
        <ExitConfirmModal
          onConfirm={() => {
            setShowExitConfirmModal(false);
            window.history.go(-2);
          }}
          onCancel={() => setShowExitConfirmModal(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}

function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="video-confirm-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <motion.div
        className="video-confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="video-confirm-header">
          <span className="video-confirm-om" aria-hidden="true">🙏</span>
          <h3>संवाद (Samvaad)</h3>
        </div>

        <p className="video-confirm-message">
          <strong>जय श्री राधे!</strong><br />
          प्रिय साधक, क्या आप संवाद (Samvaad) से प्रस्थान करना चाहते हैं?
        </p>

        <p className="video-confirm-quote">
          <em>“सदा भगवन्नाम स्मरण एवं सत्संग में मन लगाइए, जीवन में परम शांति प्राप्त होगी।”</em>
        </p>

        <div className="video-confirm-actions">
          <button
            type="button"
            className="video-confirm-btn-primary"
            onClick={onCancel}
          >
            🌸 यहीं रहें (Stay in Samvaad)
          </button>
          <button
            type="button"
            className="video-confirm-btn-secondary"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
            onClick={onConfirm}
          >
            हाँ, प्रस्थान करें (Exit)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
