import React, { useMemo } from 'react';
import { renderInline, intelligentSegmentResponse } from '../utils/formatters';

/**
 * RichText Component:
 * Renders spiritual discourse cleanly and instantaneously with 0 lag.
 * Uses intelligent segmentation and multi-line verse grouping.
 */
export default function RichText({ content, streaming = false }) {
  const blocks = useMemo(() => {
    if (!content) return [];
    const segmentedText = intelligentSegmentResponse(content);
    const rawLines = (segmentedText || '').split('\n');

    const grouped = [];
    let currentShlok = null;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentShlok) {
          grouped.push(currentShlok);
          currentShlok = null;
        }
        grouped.push({ type: 'spacer' });
        continue;
      }

      // Defensive 1: Mid-line or leading shloka with other text (e.g. « ... » followed by अर्थ:)
      const midShlokMatch = trimmed.match(/^([\s\S]*?)([*_\s]*«[^»]+»[*_\s]*)([\s\S]*)$/u);
      if (midShlokMatch && (midShlokMatch[1].trim() || midShlokMatch[3].trim())) {
        const parts = [];
        if (midShlokMatch[1].trim()) parts.push(midShlokMatch[1].trim());
        parts.push(midShlokMatch[2].trim());
        if (midShlokMatch[3].trim()) parts.push(midShlokMatch[3].trim());
        rawLines.splice(i, 1, ...parts);
        i--;
        continue;
      }

      // Defensive 2: Arthat line followed by discourse transition (e.g. इसलिए, इस श्लोक, अतः, याद रखो)
      const isArthatCandidate = /^(?:["“'«»\s]|\*\*|\*|__)*(?:अर्थात्|भावार्थ|अर्थ|meaning)(?:\*\*|\*|__)?(?:\s*[:—\-–,]\s*|\s+)/iu.test(trimmed);
      if (isArthatCandidate) {
        const arthatTransitionMatch = trimmed.match(/^((?:["“'«»\s]|\*\*|\*|__)*(?:अर्थात्|भावार्थ|अर्थ|meaning)[^]+?[।!?]["”»]?)\s+((?:देखो\s*बच्चा|सुनो\s*बच्चा|बेटा|वत्स|प्रिय\s*बच्चा|इसलिए|इस\s*प्रकार|अतः|याद\s*रखो|इस\s*श्लोक|यह\s*श्लोक|Remember,\s*child|My\s*child|Therefore)[\sA-Za-z\u0900-\u097F][^]*)$/u);
        if (arthatTransitionMatch) {
          rawLines.splice(i, 1, arthatTransitionMatch[1].trim(), arthatTransitionMatch[2].trim());
          i--;
          continue;
        }
      }

      const isArthat = isArthatCandidate;

      // Check if line is shlok
      const isShlok = !isArthat && (
        (trimmed.includes('«') && trimmed.includes('»')) ||
        (trimmed.includes('॥') && (trimmed.startsWith('**') || trimmed.endsWith('**') || trimmed.startsWith('«') || trimmed.startsWith('"') || trimmed.startsWith('“'))) ||
        (/^[«\*]+[\u0900-\u097F\s,।'॥\-]+[»\*]+$/.test(trimmed) && trimmed.length > 20) ||
        (currentShlok !== null && (trimmed.includes('॥') || trimmed.endsWith('»**') || trimmed.endsWith('»') || trimmed.endsWith('**')))
      );

      if (isShlok) {
        if (!currentShlok) {
          currentShlok = { type: 'shlok', lines: [trimmed] };
        } else {
          currentShlok.lines.push(trimmed);
        }
        // If this line closes the shloka, flush currentShlok immediately
        if (trimmed.includes('»') || trimmed.endsWith('॥') || trimmed.endsWith('»**')) {
          grouped.push(currentShlok);
          currentShlok = null;
        }
        continue;
      }

      if (currentShlok) {
        grouped.push(currentShlok);
        currentShlok = null;
      }

      // Horizontal divider
      if (/^(?:---|───|\*\*\*)$/.test(trimmed)) {
        grouped.push({ type: 'divider' });
        continue;
      }

      // Markdown Headings (#, ##, ###, ####)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].trim();
        grouped.push({ type: 'heading', level, text: headingText });
        continue;
      }

      // Supporting Scriptural References Header
      if (/^📖\s*(?:\*\*)?(?:Supporting Scriptural References|पूरक शास्त्र प्रमाण)/i.test(trimmed)) {
        const titleText = trimmed.replace(/^[📖*_\s]+/, '').replace(/[*_\s]+$/, '');
        grouped.push({ type: 'supporting-header', titleText });
        continue;
      }

      // Bullet points
      if (/^[-•*]\s+/.test(trimmed)) {
        const rawBullet = trimmed.replace(/^[-•*]\s+/, '');
        const isSupportingCard = rawBullet.includes('«') || rawBullet.includes('॥') || /^(?:\*\*|\*)[^\*]+(?:\*\*|\*)\s*:\s*\*/.test(rawBullet);
        grouped.push({ type: 'bullet', rawBullet, isSupportingCard });
        continue;
      }

      // Numbered points
      if (/^\d+[.)]\s+/.test(trimmed)) {
        const number = trimmed.match(/^\d+[.)]/)[0];
        const text = trimmed.replace(/^\d+[.)]\s+/, '');
        grouped.push({ type: 'numbered', number: number.replace(/[.)]/, ''), text });
        continue;
      }

      // Arthat block
      if (isArthat) {
        grouped.push({ type: 'arthat', text: trimmed });
        continue;
      }

      // Standard paragraph
      grouped.push({ type: 'paragraph', text: trimmed });
    }

    if (currentShlok) {
      grouped.push(currentShlok);
    }

    return grouped;
  }, [content]);

  if (!content) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const isLast = index === blocks.length - 1;
        const cursor = streaming && isLast ? <span className="stream-cursor chat-cursor" aria-hidden="true" /> : null;

        if (block.type === 'spacer') {
          return <span className="rich-paragraph-spacer" key={`br-${index}`} aria-hidden="true" />;
        }

        if (block.type === 'divider') {
          return <hr className="rich-divider" key={`hr-${index}`} />;
        }

        if (block.type === 'heading') {
          return (
            <div className={`rich-heading rich-h${block.level}`} key={`h-${index}`}>
              {renderInline(block.text, `h${index}`)}{cursor}
            </div>
          );
        }

        if (block.type === 'supporting-header') {
          return (
            <div className="rich-supporting-header" key={`supp-hdr-${index}`}>
              <span className="rich-supporting-icon">📖</span>
              <span className="rich-supporting-title">{block.titleText}</span>
              {cursor}
            </div>
          );
        }

        if (block.type === 'bullet') {
          if (block.isSupportingCard) {
            return (
              <div className="rich-supporting-card" key={`supp-card-${index}`}>
                <span className="rich-bullet-content">
                  {renderInline(block.rawBullet, `supp${index}`)}{cursor}
                </span>
              </div>
            );
          }
          return (
            <span className="rich-bullet" key={`li-${index}`}>
              <i aria-hidden="true" />
              <span className="rich-bullet-content">
                {renderInline(block.rawBullet, `li${index}`)}{cursor}
              </span>
            </span>
          );
        }

        if (block.type === 'numbered') {
          return (
            <span className="rich-bullet numbered" key={`nli-${index}`}>
              <i aria-hidden="true">{block.number}</i>
              <span className="rich-bullet-content">
                {renderInline(block.text, `nli${index}`)}{cursor}
              </span>
            </span>
          );
        }

        if (block.type === 'shlok') {
          // Strip outer ** markers, « », and loose asterisks so verse is 100% clean
          const cleanedVerses = block.lines
            .map((l) =>
              l
                .replace(/^\*\*«?\s*/g, '')
                .replace(/\s*»?\*\*$/g, '')
                .replace(/^«\s*/g, '')
                .replace(/\s*»$/g, '')
                .replace(/^\*\*\s*/g, '')
                .replace(/\s*\*\*$/g, '')
                .trim()
            )
            .filter(Boolean);

          return (
            <div className="rich-shlok-line" key={`shlok-${index}`}>
              {cleanedVerses.map((verseLine, vIdx) => (
                <div className="rich-shlok-verse-row" key={`vl-${vIdx}`}>
                  {renderInline(verseLine, `shlok-${index}-${vIdx}`)}
                </div>
              ))}
              {cursor}
            </div>
          );
        }

        if (block.type === 'arthat') {
          // Normalize arthat text so markdown asterisks are always clean and balanced
          let cleanArthat = block.text.trim();
          const asterisks = (cleanArthat.match(/\*\*/g) || []).length;
          if (asterisks % 2 !== 0) {
            cleanArthat = cleanArthat.replace(/\*\*/g, '');
          }
          if (!cleanArthat.startsWith('**')) {
            cleanArthat = cleanArthat.replace(
              /^([«*"“'_\s]*)(अर्थात्|भावार्थ|अर्थ|meaning)(\s*[:—\-–]\s*|\s+)(["“]?[^]*)$/iu,
              '**$2 —** $4'
            );
          }

          return (
            <div className="rich-arthat-line" key={`arthat-${index}`}>
              <div className="rich-arthat-content">
                {renderInline(cleanArthat, `arthat-${index}`)}
              </div>
              {cursor}
            </div>
          );
        }

        return (
          <span className="rich-line" key={`p-${index}`}>
            {renderInline(block.text, `p${index}`)}{cursor}
          </span>
        );
      })}
    </>
  );
}
