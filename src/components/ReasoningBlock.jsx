import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Claude-Inspired Spiritual Deliberation & RAG Showcase Window
 * - Positioned cleanly at the top of the assistant message.
 * - Shimmering RAG status pill: '✨ Searching 24 Scriptures...' -> '📜 RAG Verified · {Reference}'.
 * - Character-by-character typewriter stream for internal deliberation steps.
 * - Sleek left-border accent (#8b5cf6 / amber), glowing timer badge ('Thinking (12.4s)...').
 * - Expandable full deliberation and scripture preview drawer.
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
  const streamRef = useRef(null);

  const isEnglishView = Boolean(isEnglish) || (thought && /^(?:🔍\s*Query Intent|Contemplating|Searching|Analyzing)/i.test(thought));
  const [displayedThought, setDisplayedThought] = useState(thought || '');

  useEffect(() => {
    let interval = null;
    if (isThinking) {
      setIsOpen(true);
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsed(Math.max(0.1, (Date.now() - startTime) / 1000));
      }, 100);
    } else {
      if (duration > 0) {
        setElapsed(duration);
      }
      setIsOpen(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinking, duration]);

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

    // Steady, readable typing pace so the deliberation visibly animates character-by-character
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

  const displayTime = duration > 0 ? duration.toFixed(1) : elapsed.toFixed(1);

  if (!thought && !isThinking && !scripture) return null;

  const hasLongThought = (thought || '').length > 130;

  return (
    <div className={`reasoning-container claude-reasoning-container ${isThinking ? 'thinking-active' : 'thinking-done'}`}>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
