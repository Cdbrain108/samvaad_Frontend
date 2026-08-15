import { useEffect, useRef, useState } from 'react';
import { onAuthStateChange, saveConversation, getUserConversations, getConversation, updateConversation, getUserMemory, saveUserMemory, getUserProfileInfo, saveUserProfileInfo } from './services/firebase';
import { generateGuruResponse, generateChatTitle } from './services/guruService';
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
          return <br key={`br-${index}`} />;
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

function RespondingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % respondingPhrases.length);
    }, 2100);
    return () => clearInterval(cycle);
  }, []);

  return (
    <p className="typing-text">
      <em>{respondingPhrases[phraseIndex]}</em>
      <span className="chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
    </p>
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
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState('landing');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userMemory, setUserMemory] = useState(null);
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const voice = useVoiceMode();

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Keep the conversation pinned to the newest message while it grows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isResponding]);

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
        setConversations([]);
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

  const openChat = () => {
    setView('chat');
    window.scrollTo(0, 0);
  };

  /* Landing hero ask-box: jump into chat and immediately send the question */
  const askFromLanding = (question) => {
    setView('chat');
    window.scrollTo(0, 0);
    if (question && question.trim()) submitMessage(question);
  };

  // Helper to finalize chat auto-naming when leaving a chat
  const maybeAutoNameChatOnLeave = async () => {
    if (!user || !currentConversationId || messages.length < 2) return;
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv && (!currentConv.title || currentConv.title.endsWith('...') || currentConv.title === 'New Conversation')) {
      const newTitle = await generateChatTitle(messages);
      if (newTitle && newTitle !== 'New Conversation') {
        const updatedConvData = { ...currentConv, title: newTitle, updatedAt: new Date() };
        setConversations(prev => prev.map(c => c.id === currentConversationId ? updatedConvData : c));
        await updateConversation(user.uid, currentConversationId, updatedConvData);
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
    await maybeAutoNameChatOnLeave();
    if (conversation.messages && conversation.messages.length > 0) {
      setMessages(conversation.messages);
    } else {
      // Load full conversation if messages not in preview
      const result = await getConversation(user.uid, conversation.id);
      if (!result.error && result.conversation && result.conversation.messages) {
        setMessages(result.conversation.messages);
      }
    }
    setCurrentConversationId(conversation.id);
    setSidebarOpen(false);
  };

  const submitMessage = async (explicitMessage, speakResponse = false) => {
    if (!user || isResponding) return;

    const message = (explicitMessage ?? draft).trim();
    if (!message) return;

    const userMsg = { role: 'user', content: message, timestamp: new Date() };
    const updatedMessagesWithUser = [...messages, userMsg];
    voice.stop();
    setMessages(updatedMessagesWithUser);
    setDraft('');
    setIsResponding(true);

    try {
      // Build user memory context string
      const memoryContext = userMemory ? [
        `Summary: ${userMemory.summary || 'New user starting spiritual journey.'}`,
        userMemory.topics_explored?.length ? `Topics Explored: ${userMemory.topics_explored.join(', ')}` : '',
        userMemory.preferences?.length ? `Preferences: ${userMemory.preferences.join(', ')}` : '',
        userMemory.key_traits?.length ? `Traits: ${userMemory.key_traits.join(', ')}` : '',
        userMemory.unresolved_questions?.length ? `Unresolved Questions: ${userMemory.unresolved_questions.join(', ')}` : ''
      ].filter(Boolean).join('\n') : '';

      // Generate authentic Guru response using Groq & Dharma Sahayak persona + userProfile (name & age)
      const fullResponseContent = await generateGuruResponse(message, messages, memoryContext, userProfile);

      setIsResponding(false);

      // Add initial empty assistant message bubble for streaming
      const assistantMsg = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages([...updatedMessagesWithUser, assistantMsg]);

      // Stream words progressively word-by-word step-by-step
      const words = fullResponseContent.split(' ');
      let accumulatedText = '';
      setIsStreaming(true);
      for (let i = 0; i < words.length; i++) {
        accumulatedText += (i === 0 ? '' : ' ') + words[i];
        const streamText = accumulatedText;
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: streamText };
          }
          return updated;
        });
        await new Promise(r => setTimeout(r, 24));
      }
      setIsStreaming(false);
      if (speakResponse) voice.speak(fullResponseContent);

      const finalAssistantMsg = {
        role: 'assistant',
        content: fullResponseContent,
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessagesWithUser, finalAssistantMsg];

      const newConvId = currentConversationId || ('conv-' + Date.now());
      if (!currentConversationId) {
        setCurrentConversationId(newConvId);
      }

      // Existing conversation object or title
      const existingConv = conversations.find(c => c.id === newConvId);
      let convTitle = existingConv?.title || (message.length > 30 ? `${message.slice(0, 30)}...` : message);

      // Auto-naming title generation: Trigger after 2-3 responses (4 to 6 messages) or if untitled
      if (finalMessages.length >= 4 && (!existingConv || existingConv.title.endsWith('...') || existingConv.title === 'New Conversation')) {
        convTitle = await generateChatTitle(finalMessages);
      }

      // Save or update conversation object
      const conversationData = {
        id: newConvId,
        title: convTitle,
        messages: finalMessages,
        updatedAt: new Date()
      };

      // Update local React state & LocalStorage immediately for instant persistence
      setConversations(prev => {
        const updated = [
          conversationData,
          ...prev.filter(c => c.id !== newConvId)
        ].slice(0, 50);
        try {
          localStorage.setItem(`samvad_chats_${user.uid}`, JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });

      if (currentConversationId) {
        // Update existing conversation in Firestore
        await updateConversation(user.uid, currentConversationId, conversationData);
      } else {
        // Create new conversation in Firestore
        const result = await saveConversation(user.uid, {
          ...conversationData,
          createdAt: new Date()
        });
        if (!result.error && result.id) {
          setCurrentConversationId(result.id);
        }
      }
    } catch (err) {
      console.error('Error handling message:', err);
    } finally {
      setIsResponding(false);
      setIsStreaming(false);
    }
  };

  const handleLogout = async () => {
    const { logoutUser } = await import('./services/firebase');
    await logoutUser();
    setView('landing');
  };

  // TEMP QA BYPASS — remove before shipping (headless Chrome has no auth).
  // Checked before the loading gate so a design/QA pass never has to wait
  // on a live Firebase session.
  const qaParams = new URLSearchParams(window.location.search);
  if (qaParams.get('qa') === 'landing') {
    const go = qaParams.get('go');
    if (go) {
      setTimeout(() => {
        document.getElementById(go)?.scrollIntoView({ block: 'start' });
      }, 500);
    }
    return (
      <LandingPage
        darkMode={qaParams.get('night') === '1'}
        onEnter={() => {}}
        onAsk={() => {}}
        onToggleTheme={() => {}}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Login onLogin={setUser} />
    );
  }

  if (view === 'landing') {
    return (
      <LandingPage
        darkMode={darkMode}
        onEnter={openChat}
        onAsk={askFromLanding}
        onToggleTheme={() => setDarkMode((current) => !current)}
      />
    );
  }

  return (
    <div className="app-shell">
      <ChatHistory
        user={user}
        conversations={conversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
      />

      <main className="main-panel">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <div className="topbar-center">
            <button className="home-link" onClick={() => setView('landing')}>Back Home</button>
            <div className="model-badge">
              <span className="status-dot" />
              Samvaad Learning
            </div>
          </div>

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
            <button className="icon-button" onClick={handleLogout} aria-label="Sign out">
              <Icon name="log-out" size={18} />
            </button>
            <div className="user-avatar" onClick={() => setSidebarOpen(true)}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div className={`content-area ${voiceModeOpen ? 'voice-mode-active' : ''}`}>
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
                  <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                    <span className="message-avatar">
                      {message.role === 'user' ? 'You' : 'ॐ'}
                    </span>
                    <div>
                      <strong>{message.role === 'user' ? 'You' : 'Samvaad'}</strong>
                      {message.role === 'assistant' ? (
                        <p className="rich-text">
                          <RichText content={message.content} streaming={isLastAssistant && isStreaming} />
                        </p>
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
                  </article>
                );
              })}
              {isResponding && (
                <article className="message assistant responding">
                  <span className="message-avatar">ॐ</span>
                  <div>
                    <strong>Samvaad Guru</strong>
                    <RespondingIndicator />
                  </div>
                </article>
              )}
              <div ref={messagesEndRef} className="messages-anchor" aria-hidden="true" />
            </section>
          )}
        </div>

        <div className="diya-row" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span className="diya" key={i} style={{ '--flick': `${(i * 0.37).toFixed(2)}s` }} />
          ))}
        </div>

        <Composer value={draft} onChange={setDraft} onSubmit={submitMessage} />
      </main>

      <OnboardingModal isOpen={showOnboarding} onSubmit={handleOnboardingSubmit} />
    </div>
  );
}
