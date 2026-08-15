import { useEffect, useRef, useState } from 'react'

const verses = [
  {
    source: 'Bhagavad Gita · 2.47',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
    meaning: 'You have the right to act, never to the fruits of the action.',
  },
  {
    source: 'Bhagavad Gita · 6.5',
    devanagari: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',
    meaning: 'Lift yourself by your own heart; never let yourself sink.',
  },
  {
    source: 'Bhagavad Gita · 12.13',
    devanagari: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।',
    meaning: 'One who holds no ill-will, and stays friendly and kind to all beings.',
  },
  {
    source: 'Hanuman Chalisa',
    devanagari: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।',
    meaning: 'Polish the mirror of your mind with the dust of the Guru\u2019s feet.',
  },
  {
    source: 'Bhagavad Gita · 18.66',
    devanagari: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',
    meaning: 'Let go of every burden and take refuge in the Divine alone.',
  },
]

/**
 * A CSS-3D pothi (scripture manuscript). When the section scrolls into view
 * the cover lifts open and the current Sanskrit shloka writes itself onto the
 * page, character by character, while verses cycle. Moving the pointer over
 * the manuscript tilts it in 3D.
 */
export default function ScriptureBook() {
  const [verseIndex, setVerseIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [open, setOpen] = useState(false)
  const [written, setWritten] = useState(0)
  const sceneRef = useRef(null)
  const exhibitRef = useRef(null)

  /* open the manuscript once it enters the viewport */
  useEffect(() => {
    const node = exhibitRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* TEMP QA HOOK — force-open for headless screenshots; remove before shipping */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('qaopen') === '1') setOpen(true)
  }, [])

  /* cycle verses */
  useEffect(() => {
    const cycle = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setVerseIndex((current) => (current + 1) % verses.length)
        setFading(false)
      }, 420)
    }, 6500)
    return () => clearInterval(cycle)
  }, [])

  /* the shloka writes itself slowly whenever the verse changes (once open) */
  useEffect(() => {
    if (!open) return
    setWritten(0)
    const total = verses[verseIndex].devanagari.length
    const tick = setInterval(() => {
      setWritten((count) => {
        if (count >= total) {
          clearInterval(tick)
          return count
        }
        return count + 1
      })
    }, 95)
    return () => clearInterval(tick)
  }, [open, verseIndex])

  const handleMove = (event) => {
    const frame = sceneRef.current?.getBoundingClientRect()
    if (!frame) return
    const px = (event.clientX - frame.left) / frame.width - 0.5
    const py = (event.clientY - frame.top) / frame.height - 0.5
    setTilt({ x: py * -10, y: px * 16 })
  }

  const verse = verses[verseIndex]

  return (
    <div className={`scripture-exhibit ${open ? 'is-open' : ''}`} ref={exhibitRef}>
      <div
        className="pothi-scene"
        ref={sceneRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="pothi"
          style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}
        >
          <div className="pothi-glow" aria-hidden="true" />
          <div className="pothi-base" aria-hidden="true" />

          {[0, 1, 2].map((page) => (
            <div className={`pothi-page pothi-page-${page + 1}`} key={page} aria-hidden="true">
              <span className="pothi-page-rule" />
              <span className="pothi-page-rule short" />
              <span className="pothi-page-rule" />
            </div>
          ))}

          <div className="pothi-open-page" aria-hidden="true">
            <span className="pothi-open-om">ॐ</span>
            <p className="pothi-shloka" lang="sa">
              {verse.devanagari.slice(0, written)}
              {written < verse.devanagari.length && <i className="shloka-caret" />}
            </p>
            <span className="pothi-open-source">{verse.source}</span>
          </div>

          <div className="pothi-cover" aria-hidden="true">
            <span className="pothi-cover-om">ॐ</span>
            <span className="pothi-cover-title">श्रीमद्भगवद्गीता</span>
            <span className="pothi-cover-sub">अध्यात्म · ज्ञान · भक्ति</span>
          </div>

          <span className="pothi-spark spark-a" aria-hidden="true" />
          <span className="pothi-spark spark-b" aria-hidden="true" />
          <span className="pothi-spark spark-c" aria-hidden="true" />
        </div>
      </div>

      <div className={`verse-card ${fading ? 'is-fading' : ''}`} role="status" aria-live="polite">
        <span className="verse-source">{verse.source}</span>
        <p className="verse-devanagari" lang="sa">{verse.devanagari}</p>
        <p className="verse-meaning">{verse.meaning}</p>
        <div className="verse-dots" aria-hidden="true">
          {verses.map((item, index) => (
            <i key={item.source} className={index === verseIndex ? 'is-active' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}
