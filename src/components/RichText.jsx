import React, { useState, useEffect } from 'react';
import { renderInline, intelligentSegmentResponse } from '../utils/formatters';

/**
 * RichText Component:
 * Renders spiritual discourse with smooth sequential typewriter stream,
 * bold styling, Sanskrit shloka formatting, and bullet points.
 */
export default function RichText({ content, streaming = false }) {
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

    // If not streaming and large jump (> 80 chars, e.g. switching chats), snap immediately
    if (!streaming && diff > 80) {
      setDisplayedText(content);
      return;
    }

    // Steady, readable typing pace so newly released sentences visibly type out sequentially
    const step = diff > 100 ? 4 : diff > 30 ? 3 : diff > 10 ? 2 : 1;
    const speed = diff > 100 ? 10 : diff > 30 ? 14 : 18;

    let targetIdx = Math.min(displayedText.length + step, content.length);
    // Unicode safety: do not split Devanagari combining marks (matras, virama, anusvara)
    while (targetIdx < content.length && /[\u0901-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963]/.test(content[targetIdx])) {
      targetIdx++;
    }

    const timer = setTimeout(() => {
      setDisplayedText(content.slice(0, targetIdx));
    }, speed);

    return () => clearTimeout(timer);
  }, [content, displayedText, streaming]);

  const activeRaw = streaming || displayedText.length < (content || '').length ? displayedText : content;
  const segmentedText = intelligentSegmentResponse(activeRaw || '');
  const lines = (segmentedText || '').split('\n');
  const isActivelyTyping = streaming || displayedText.length < (content || '').length;

  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const isLast = index === lines.length - 1;
        const cursor = isActivelyTyping && isLast ? <span className="stream-cursor chat-cursor" aria-hidden="true" /> : null;

        if (!trimmed) {
          return <span className="rich-paragraph-spacer" key={`br-${index}`} aria-hidden="true" />;
        }

        // Horizontal divider (---)
        if (/^(?:---|───|\*\*\*)$/.test(trimmed)) {
          return <hr className="rich-divider" key={`hr-${index}`} />;
        }

        // Supporting Scriptural References Header
        if (/^📖\s*(?:\*\*)?(?:Supporting Scriptural References|पूरक शास्त्र प्रमाण)/i.test(trimmed)) {
          const titleText = trimmed.replace(/^[📖*_\s]+/, '').replace(/[*_\s]+$/, '');
          return (
            <div className="rich-supporting-header" key={`supp-hdr-${index}`}>
              <span className="rich-supporting-icon">📖</span>
              <span className="rich-supporting-title">{titleText}</span>
              {cursor}
            </div>
          );
        }

        if (/^[-•*]\s+/.test(trimmed)) {
          const rawBullet = trimmed.replace(/^[-•*]\s+/, '');
          const isSupportingCard = rawBullet.includes('«') || rawBullet.includes('॥') || /^(?:\*\*|\*)[^\*]+(?:\*\*|\*)\s*:\s*\*/.test(rawBullet);
          if (isSupportingCard) {
            return (
              <div className="rich-supporting-card" key={`supp-card-${index}`}>
                <span className="rich-bullet-content">
                  {renderInline(rawBullet, `supp${index}`)}{cursor}
                </span>
              </div>
            );
          }
          return (
            <span className="rich-bullet" key={`li-${index}`}>
              <i aria-hidden="true" />
              <span className="rich-bullet-content">
                {renderInline(rawBullet, `li${index}`)}{cursor}
              </span>
            </span>
          );
        }

        if (/^\d+[.)]\s+/.test(trimmed)) {
          const number = trimmed.match(/^\d+[.)]/)[0];
          return (
            <span className="rich-bullet numbered" key={`nli-${index}`}>
              <i aria-hidden="true">{number.replace(/[.)]/, '')}</i>
              <span className="rich-bullet-content">
                {renderInline(trimmed.replace(/^\d+[.)]\s+/, ''), `nli${index}`)}{cursor}
              </span>
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
