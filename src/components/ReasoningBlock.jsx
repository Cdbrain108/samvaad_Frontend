import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modern AI Reasoning Window (चिंतन व आत्म-मंथन)
 * - Positioned cleanly at the top of the assistant message.
 * - Visible for only 3-4 lines during active thinking to prevent taking over the screen.
 * - Auto-scrolls to the latest generated thoughts.
 * - Continuation toggle allows the user to expand and inspect the full deliberation.
 * - Auto-collapses upon completion into a sleek badge: '✓ चिंतन संपन्न (Thought) [timer]s ▼'.
 */
export default function ReasoningBlock({
  thought = '',
  isThinking = false,
  duration = 0,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const streamRef = useRef(null);

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
        // Auto-collapse completed thinking so devotee reads the pristine discourse undisturbed
        setIsOpen(false);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThinking, duration]);

  // Auto-scroll stream to bottom as thoughts are typed (when in compact mode)
  useEffect(() => {
    if (streamRef.current && isThinking && !isExpanded) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [thought, isThinking, isExpanded]);

  const displayTime = duration > 0 ? duration.toFixed(1) : elapsed.toFixed(1);

  if (!thought && !isThinking) return null;

  const hasLongThought = (thought || '').length > 130;

  return (
    <div className={`reasoning-container ${isThinking ? 'thinking-active' : 'thinking-done'}`}>
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
              <span className="reasoning-sparkle-pulse" aria-hidden="true">✨</span>
            ) : (
              <span className="reasoning-check-mark" aria-hidden="true">✓</span>
            )}
          </span>
          <span className="reasoning-title-text">
            {isThinking ? 'चिंतन प्रक्रिया (Spiritual Deliberation)' : 'चिंतन संपन्न (Thought)'}
          </span>
          <span className="reasoning-timer-badge">
            {isThinking ? `${displayTime}s...` : `${displayTime}s`}
          </span>
        </div>

        <div className="reasoning-toggle-icon">
          <span className={`reasoning-chevron ${isOpen ? 'open' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="reasoning-body-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="reasoning-content-box">
              <div
                className={`reasoning-text-stream ${isExpanded ? 'stream-expanded' : 'stream-compact'}`}
                ref={streamRef}
              >
                {thought}
                {isThinking && <span className="reasoning-blinking-cursor" aria-hidden="true" />}
              </div>

              {/* Continuation toggle: visible for 3-4 lines only unless devotee expands */}
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
