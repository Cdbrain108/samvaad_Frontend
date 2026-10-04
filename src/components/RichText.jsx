import React, { useMemo } from 'react';
import { renderInline, intelligentSegmentResponse } from '../utils/formatters';

/**
 * RichText Component:
 * Renders spiritual discourse cleanly and instantaneously with 0 lag.
 * Uses intelligent segmentation for bullet points, shlokas, and bold styling.
 */
export default function RichText({ content, streaming = false }) {
  const lines = useMemo(() => {
    if (!content) return [];
    const segmentedText = intelligentSegmentResponse(content);
    return (segmentedText || '').split('\n');
  }, [content]);

  if (!content) return null;

  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const isLast = index === lines.length - 1;
        const cursor = streaming && isLast ? <span className="stream-cursor chat-cursor" aria-hidden="true" /> : null;

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
