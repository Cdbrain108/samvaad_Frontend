import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES_HI = [
  { id: 'intent', label: 'साधक भाव व अंतर्मन अध्ययन', icon: '🔍' },
  { id: 'rag', label: '२४ पावन शास्त्रों व गीता में अनुसंधान', icon: '📜' },
  { id: 'deliberation', label: 'पूज्य महाराज जी की सत्संग वाणी अनुशीलन', icon: '🧘' },
  { id: 'synthesis', label: 'प्रामाणिक श्लोक व वात्सल्य समन्वय', icon: '🌸' }
];

const STAGES_EN = [
  { id: 'intent', label: 'Analyzing Seeker Intent & Dilemma', icon: '🔍' },
  { id: 'rag', label: 'Searching 24 Scriptures on AWS Qdrant', icon: '📜' },
  { id: 'deliberation', label: 'Deliberating Maharaj Ji’s Satsang Counsel', icon: '🧘' },
  { id: 'synthesis', label: 'Harmonizing Sacred Verses & Divine Solace', icon: '🌸' }
];

const WISDOM_PEARLS_HI = [
  "ठाकुर जी शरीर की बनावट या लौकिक रूप नहीं, केवल अंतःकरण का निष्काम प्रेम देखते हैं।",
  "हर श्वास में 'राधा-राधा' नाम का सुमिरन ही चित्त के समस्त संशयों को शांत करता है।",
  "संसार का कोई भी भय या तिरस्कार प्रभु के अहैतुक वात्सल्य से बड़ा नहीं हो सकता।",
  "अपने दैनिक कर्तव्य को प्रभु की पूजा मानकर, अहंकार त्यागकर प्रेम से जीवन बिताएं।",
  "पुरुष नपुंसक नारि वा जीव चराचर कोइ — जो कपट त्यागकर भजता है, वह प्रभु को परम प्रिय है।"
];

const WISDOM_PEARLS_EN = [
  "The Divine does not judge physical form or labels, but cherishes only sincere purity of heart.",
  "Every breath anchored in the Holy Name 'Radha Radha' brings unshakeable inner peace.",
  "No worldly judgment or anxiety can ever overcome Thakur Ji's unconditional shelter.",
  "Perform your daily duties honestly as sacred seva, surrendering all fruits to God.",
  "Whoever surrenders deceit and loves with an open heart is eternally dear to the Supreme."
];

/**
 * Claude-Inspired Spiritual Deliberation & RAG Showcase Window
 * - Positioned cleanly at the top of the assistant message.
 * - Shimmering RAG status pill: '✨ Searching 24 Scriptures...' -> '📜 RAG Verified · {Reference}'.
 * - Character-by-character typewriter stream for internal deliberation steps.
 * - Dynamic 4-Stage Spiritual Stepper showing live progress.
 * - Contemplative Wisdom Pearls carousel during active thinking.
 * - Animated Audio Wave Equalizer & Glowing Energy Ribbon.
 */
export default function ReasoningBlock({
  thought = '',
  isThinking = false,
  duration = 0,
  scripture = null,
  isEnglish = false,
}) {
  const [isOpen, setIsOpen] = useState(Boolean(isThinking));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScriptureOpen, setIsScriptureOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [pearlIndex, setPearlIndex] = useState(0);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);

  const isEnglishView = Boolean(isEnglish) || (thought && /^(?:🔍\s*Query Intent|Contemplating|Searching|Analyzing)/i.test(thought));
  const [displayedThought, setDisplayedThought] = useState(thought || '');

  const stages = isEnglishView ? STAGES_EN : STAGES_HI;
  const pearls = isEnglishView ? WISDOM_PEARLS_EN : WISDOM_PEARLS_HI;
  const currentPearl = pearls[pearlIndex % pearls.length];

  // Rotate wisdom pearls every 4 seconds during active thinking
  useEffect(() => {
    if (!isThinking) return;
    const interval = setInterval(() => {
      setPearlIndex((prev) => (prev + 1) % pearls.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isThinking, pearls.length]);

  // Live ticking timer
  useEffect(() => {
    let interval = null;
    if (isThinking) {
      setIsOpen(true);
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsed(Math.max(0.1, (Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
    } else {
      if (duration > 0) {
        setElapsed(duration);
      }
      startTimeRef.current = null;
      setIsOpen(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinking]);

  // Progressive typewriter effect for thought stream
  useEffect(() => {
    if (!thought) {
      setDisplayedThought('');
      return;
    }

    if (displayedThought === thought) return;

    const diff = thought.length - displayedThought.length;
    if (diff < 0) {
      setDisplayedThought(thought);
      return;
    }

    const step = diff > 80 ? 3 : diff > 30 ? 2 : 1;
    const speed = diff > 80 ? 12 : diff > 30 ? 18 : 25;

    const timer = setTimeout(() => {
      setDisplayedThought(thought.slice(0, displayedThought.length + step));
    }, speed);

    return () => clearTimeout(timer);
  }, [thought, displayedThought]);

  // Auto-scroll stream to bottom as thoughts are typed
  useEffect(() => {
    if (streamRef.current && isThinking && !isExpanded) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [displayedThought, isThinking, isExpanded]);

  const displayTime = isThinking
    ? elapsed.toFixed(1)
    : (duration > 0 ? duration : elapsed).toFixed(1);

  if (!thought && !isThinking && !scripture) return null;

  const hasLongThought = (thought || '').length > 130;

  // Active step index based on elapsed time
  const currentStageIdx = !isThinking
    ? 4
    : elapsed < 2.5
      ? 0
      : elapsed < 6.5
        ? 1
        : elapsed < 13.0
          ? 2
          : 3;

  return (
    <div className={`reasoning-container claude-reasoning-container ${isThinking ? 'thinking-active' : 'thinking-done'}`}>
      {/* Divine Shimmering Energy Ribbon during active thinking */}
      {isThinking && <div className="deliberation-energy-ribbon" aria-hidden="true" />}

      {/* Header Bar */}
      <div className="reasoning-header-bar">
        <button
          type="button"
          className="reasoning-header-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle spiritual deliberation thoughts"
        >
          <div className="reasoning-status-row">
            <span className="reasoning-indicator">
              {isThinking ? (
                <span className="claude-sparkle-glow" aria-hidden="true">✨</span>
              ) : (
                <span className="claude-check-mark" aria-hidden="true">✓</span>
              )}
            </span>

            <span className="reasoning-title-text">
              {isThinking ? 'चिंतन प्रक्रिया (Spiritual Deliberation)' : 'चिंतन संपन्न (Thought Process)'}
            </span>

            {/* Equalizer animation while thinking */}
            {isThinking && (
              <div className="claude-equalizer" title="Deliberating in deep mode" aria-hidden="true">
                <span className="eq-bar eq-1" />
                <span className="eq-bar eq-2" />
                <span className="eq-bar eq-3" />
                <span className="eq-bar eq-4" />
              </div>
            )}

            <span className="claude-timer-badge">
              {isThinking ? `${displayTime}s...` : `${displayTime}s`}
            </span>
          </div>

          <div className="reasoning-toggle-icon">
            <span className={`reasoning-chevron ${isOpen ? 'open' : ''}`}>▼</span>
          </div>
        </button>

        {/* Claude-Style RAG Pill */}
        {scripture ? (
          <button
            type="button"
            className="claude-rag-pill-btn"
            onClick={() => setIsScriptureOpen((prev) => !prev)}
            title="Click to view scripture citation and score"
          >
            <span className="claude-rag-pill-icon">📜</span>
            <span className="claude-rag-pill-text">{scripture.reference}</span>
            {scripture.score && (
              <span className="claude-rag-pill-score">{(scripture.score * 100).toFixed(0)}%</span>
            )}
            <span className={`claude-rag-pill-chevron ${isScriptureOpen ? 'open' : ''}`}>▾</span>
          </button>
        ) : isThinking ? (
          <div className="claude-rag-searching-pill">
            <span className="claude-shimmer-dot" />
            <span className="claude-shimmer-text">Searching 24 Scriptures on AWS...</span>
          </div>
        ) : null}
      </div>

      {/* Expandable Scripture Detail Drawer */}
      <AnimatePresence>
        {isScriptureOpen && scripture && (
          <motion.div
            className="claude-scripture-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="claude-scripture-box">
              <div className="claude-scripture-header">
                <span className="claude-scripture-meta-title">
                  {isEnglishView ? 'Sacred Citation (शास्त्र प्रमाण)' : 'शास्त्र प्रमाण (Sacred Citation)'}
                </span>
                <span className="claude-scripture-ref">{scripture.reference}</span>
              </div>
              {scripture.original_text && (
                <div className="claude-scripture-shlok">
                  « {scripture.original_text} »
                </div>
              )}
              {(scripture.hindi_meaning || scripture.english_translation) && (
                <div className="claude-scripture-meaning">
                  <strong>{isEnglishView ? 'Meaning:' : 'अर्थ:'}</strong>{' '}
                  {isEnglishView
                    ? (scripture.english_translation || scripture.hindi_meaning)
                    : (scripture.hindi_meaning || scripture.english_translation)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking Deliberation Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="reasoning-body-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Dynamic Spiritual Deliberation Stepper */}
            <div className="deliberation-stepper">
              {stages.map((st, idx) => {
                const isPast = !isThinking || idx < currentStageIdx;
                const isCurrent = isThinking && idx === currentStageIdx;
                return (
                  <div
                    key={st.id}
                    className={`stepper-step ${isPast ? 'step-completed' : ''} ${isCurrent ? 'step-active' : ''}`}
                  >
                    <span className="stepper-icon-pill">
                      {isPast ? (
                        <span className="stepper-check">✓</span>
                      ) : isCurrent ? (
                        <span className="stepper-current-dot" />
                      ) : (
                        <span className="stepper-pending-dot" />
                      )}
                    </span>
                    <span className="stepper-label">
                      <span className="stepper-emoji">{st.icon}</span> {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="reasoning-content-box claude-thinking-box">
              <div
                className={`reasoning-text-stream claude-thought-stream ${isExpanded ? 'stream-expanded' : 'stream-compact'}`}
                ref={streamRef}
              >
                {displayedThought}
                {(isThinking || displayedThought.length < (thought || '').length) && (
                  <span className="claude-block-cursor" aria-hidden="true">▋</span>
                )}
              </div>

              {hasLongThought && (
                <div className="reasoning-expand-bar">
                  <button
                    type="button"
                    className="reasoning-expand-toggle-btn"
                    onClick={() => setIsExpanded((prev) => !prev)}
                  >
                    {isExpanded ? (
                      <span>संक्षेप में देखें (Show less) ▲</span>
                    ) : (
                      <span>विस्तार से चिंतन देखें (Continue reading reasoning) ▼</span>
                    )}
                  </button>
                </div>
              )}

              {/* Contemplative Wisdom Pearl Card (Rotates during thinking) */}
              {isThinking && elapsed >= 2.0 && (
                <motion.div
                  className="deliberation-pearl-card"
                  key={pearlIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="pearl-header">
                    <span className="pearl-lotus">🪷</span>
                    <span className="pearl-title">
                      {isEnglishView ? 'Contemplative Wisdom · Pujya Maharaj Ji' : 'चिंतन का पावन सूत्र · पूज्य महाराज जी'}
                    </span>
                  </div>
                  <p className="pearl-text">"{currentPearl}"</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
