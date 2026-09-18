import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RagVersesDropdown
 * Renders an elegant, collapsible "Preferred References" section immediately beneath
 * the assistant's chat response. Displays all top candidate RAG verses (from AWS Qdrant
 * and curated scripture corpus) as premium styled scripture cards with Sanskrit shlokas,
 * Hindi/English meanings, match scores, role tags, and one-click copy actions.
 */
export default function RagVersesDropdown({ scripture = null, isEnglish = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!scripture || (!scripture.reference && !scripture.candidates?.length)) {
    return null;
  }

  const rawCandidates = Array.isArray(scripture.candidates) && scripture.candidates.length > 0
    ? scripture.candidates
    : [scripture];

  // Deduplicate candidates by reference or original_text
  const seenKeys = new Set();
  const candidates = rawCandidates.filter((c) => {
    if (!c || (!c.reference && !c.original_text)) return false;
    const key = (c.reference || '') + (c.original_text || '').slice(0, 25);
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  if (candidates.length === 0) return null;

  const totalCount = candidates.length;
  const primaryCandidate = candidates[0];

  const handleCopyShloka = (text, index) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const formatScore = (val) => {
    if (val === undefined || val === null) return 88;
    const num = Number(val);
    const pct = num <= 1.0 ? num * 100 : num;
    return Math.min(99, Math.max(50, Math.round(pct)));
  };

  return (
    <div className="rag-verses-dropdown-container">

      {/* ─── Section Header Label (always visible) ─── */}
      <div className="rag-section-header">
        <span className="rag-section-lotus" aria-hidden="true">❧</span>
        <span className="rag-section-label">
          {isEnglish ? 'Preferred Scriptural References' : 'पावन शास्त्र संदर्भ · श्रेष्ठ उद्धरण'}
        </span>
        <span className="rag-section-lotus" aria-hidden="true">❧</span>
      </div>

      {/* ─── Collapsible Trigger Bar ─── */}
      <button
        type="button"
        className={`rag-verses-toggle-btn ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle referenced scripture verses"
      >
        <div className="rag-verses-toggle-left">
          <span className="rag-verses-scroll-icon" aria-hidden="true">📜</span>
          <div className="rag-toggle-text-group">
            <span className="rag-verses-toggle-title">
              {isEnglish
                ? `${totalCount} ${totalCount === 1 ? 'Scripture Verse' : 'Scripture Verses'} Retrieved`
                : `${totalCount} ${totalCount === 1 ? 'शास्त्र प्रमाण' : 'शास्त्र प्रमाण'} उद्धृत`}
            </span>
            <span className="rag-verses-primary-preview">
              {primaryCandidate.reference}
            </span>
          </div>
        </div>

        <div className="rag-verses-toggle-right">
          <span className="rag-verses-score-badge">
            ✦ {formatScore(primaryCandidate.score)}% {isEnglish ? 'Match' : 'सटीकता'}
          </span>
          <span className={`rag-verses-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
            ▾
          </span>
        </div>
      </button>

      {/* ─── Expandable Verse Cards Drawer ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="rag-verses-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rag-verse-cards-list">
              {candidates.map((verse, idx) => {
                const isPrimary = idx === 0 || verse.role === 'primary';
                const scorePct = formatScore(verse.score);
                const isCopied = copiedIndex === idx;

                return (
                  <article
                    key={verse.id || `verse_${idx}`}
                    className={`rag-verse-card ${isPrimary ? 'is-primary' : 'is-supporting'}`}
                  >
                    {/* ── Card Header ── */}
                    <div className="rag-verse-card-header">
                      <span className={`rag-verse-role-pill ${isPrimary ? 'primary-role' : 'supporting-role'}`}>
                        {isPrimary
                          ? (isEnglish ? '✦ Primary Reference' : '✦ मुख्य प्रमाण')
                          : (isEnglish ? '◈ Supporting Insight' : '◈ पूरक संदर्भ')}
                      </span>
                      <span className="rag-verse-card-score" title="Semantic relevance to seeker query">
                        {scorePct}% {isEnglish ? 'Relevance' : 'प्रासंगिकता'}
                      </span>
                    </div>

                    {/* ── Reference Title ── */}
                    <h4 className="rag-verse-card-ref">{verse.reference}</h4>

                    {/* ── Sacred Original Shloka Block ── */}
                    {verse.original_text && (
                      <div className="rag-verse-shlok-box">
                        <div className="rag-shlok-accent-line" aria-hidden="true" />
                        <blockquote className="rag-verse-shlok-text">
                          {verse.original_text}
                        </blockquote>
                      </div>
                    )}

                    {/* ── Meanings / Translations ── */}
                    <div className="rag-verse-meanings">
                      {isEnglish ? (
                        <>
                          {verse.english_translation && (
                            <div className="rag-verse-meaning-row english">
                              <span className="meaning-label">Meaning —</span>
                              <span className="meaning-text">{verse.english_translation}</span>
                            </div>
                          )}
                          {verse.hindi_meaning && verse.hindi_meaning !== verse.english_translation && (
                            <div className="rag-verse-meaning-row hindi-sub">
                              <span className="meaning-label">हिंदी भावार्थ —</span>
                              <span className="meaning-text">{verse.hindi_meaning}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {verse.hindi_meaning && (
                            <div className="rag-verse-meaning-row hindi">
                              <span className="meaning-label">भावार्थ —</span>
                              <span className="meaning-text">{verse.hindi_meaning}</span>
                            </div>
                          )}
                          {verse.english_translation && verse.english_translation !== verse.hindi_meaning && (
                            <div className="rag-verse-meaning-row english-sub">
                              <span className="meaning-label">Meaning —</span>
                              <span className="meaning-text">{verse.english_translation}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* ── Card Footer ── */}
                    <div className="rag-verse-card-footer">
                      <span className="rag-verse-corpus-tag">
                        ◉ {verse.scripture_id ? verse.scripture_id.replace(/_/g, ' ').toUpperCase() : 'SACRED SCRIPTURE'} · AWS 29 COLLECTIONS
                      </span>

                      {verse.original_text && (
                        <button
                          type="button"
                          className={`rag-verse-copy-btn ${isCopied ? 'copied' : ''}`}
                          onClick={() => handleCopyShloka(verse.original_text, idx)}
                          title="Copy original Sanskrit shloka to clipboard"
                        >
                          {isCopied ? (
                            <><span className="copy-icon">✓</span><span>{isEnglish ? 'Copied!' : 'कॉपी हो गया!'}</span></>
                          ) : (
                            <><span className="copy-icon">📋</span><span>{isEnglish ? 'Copy Shloka' : 'श्लोक कॉपी करें'}</span></>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
