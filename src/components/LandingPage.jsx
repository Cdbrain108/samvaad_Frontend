import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import ScriptureBook from './ScriptureBook'
import ParchmentScroll from './ParchmentScroll'
import TempleNightCanvas from './TempleNightCanvas'
import heroSunrise from '../assets/hero-sunrise.png'
import heroNightTemple from '../assets/hero-night-temple.png'
import heroNightTempleMobile from '../assets/hero-night-temple-mobile.webp'
import logoWordmark from '../assets/logo-wordmark.webp'
import brandIcon from '../assets/brand-icon.webp'
import guruCutout from '../assets/guru-cutout.webp'
import oldManuscriptBg from '../assets/old-manuscript-page.jpg'

const scriptures = [
  'Bhajan Marg Q&A',
  'Bhagavad Gita',
  'Ramayana',
  'Upanishads',
  'Puranas',
  'Vedas',
  'Hanuman Chalisa',
  'Yoga Sutras',
]

const SHOW_GURU = false

const features = [
  {
    icon: 'heart',
    label: 'Grounded answers',
    title: 'Built around real devotional questions',
    text: 'The learning dataset follows the gentle question-answer style seen across Bhajan Marg discourses — a devotee asks, and the answer comes naturally and pleasantly.',
  },
  {
    icon: 'brain',
    label: 'Memory aware',
    title: 'A chat that remembers your journey',
    text: 'Firebase conversations and persistent memory help the assistant continue with your context over time, across sessions.',
  },
  {
    icon: 'spark',
    label: 'Learning playground',
    title: 'Transparent, personal and educational',
    text: 'This is a personal project for learning AI, RAG, UI design and spiritual-question workflows — built purely for education.',
  },
]

const flowSteps = [
  {
    icon: 'video',
    title: 'Extract',
    chip: 'YouTube → text',
    text: 'Public Bhajan Marg videos are gathered and their speech is transcribed into Hindi + English text.',
  },
  {
    icon: 'layers',
    title: 'QA Pairs',
    chip: 'shape the data',
    text: 'Transcripts are segmented and cleaned into question–answer learning examples — 50,000+ Hindi + English Q&A pairs.',
  },
  {
    icon: 'brain',
    title: 'Fine-tune',
    chip: 'teach the style',
    text: 'A base model is fine-tuned on those pairs so it learns the gentle, natural answering style of Maharaj Ji.',
  },
  {
    icon: 'book',
    title: 'RAG',
    chip: 'scripture knowledge',
    text: 'Extra knowledge — Gita, Chalisa, Upanishads, Vedas — is embedded and retrieved on demand for grounding.',
  },
  {
    icon: 'spark',
    title: 'Answer',
    chip: 'relevant output',
    text: 'Retrieved verses plus remembered context generate a calm, relevant reply in Hindi and English.',
  },
]

const videoExamples = [
  {
    id: 'Lgn-rroObt0',
    label: '#1344 Ekantik Vartalaap',
    title: 'Darshan and devotional dialogue',
  },
  {
    id: 'CBVPdFBK2A8',
    label: 'Radha Naam',
    title: 'Why Maharaj Ji loves Radha Naam',
  },
  {
    id: 'HeBVrzcr9hY',
    label: 'Prem and faith',
    title: 'How can love for God awaken?',
  },
]

const questionExamples = [
  'How do I find inner peace?',
  'मन भजन में कैसे टिके?',
  'What is true love (prem)?',
  'दैनिक जीवन में अभ्यास कैसे रखें?',
  'Meaning of karma?',
  'नाम का सहारा कैसे लें?',
]

const topics = [
  { emoji: '🪷', label: 'Bhagavad Gita', prompt: 'What does the Bhagavad Gita teach about staying calm in difficult times?' },
  { emoji: '❤️', label: 'Bhakti', prompt: 'How can I grow true bhakti and love for God in my daily life?' },
  { emoji: '🕉️', label: 'Dharma', prompt: 'How do I understand my dharma in a confusing situation?' },
  { emoji: '🍃', label: 'Life Guidance', prompt: 'Please guide me on balancing family duties with spiritual practice.' },
  { emoji: '🌳', label: 'Mind & Peace', prompt: 'How can I quiet a restless mind and find inner peace?' },
]

/* ---------- full-screen 1-component-per-page phases ---------- */

const phases = [
  { id: 'hero', label: 'Home' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'scriptures', label: 'Scriptures' },
  { id: 'features', label: 'Experience' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'education', label: 'Purpose' },
]

/* ---------- small interaction helpers ---------- */

function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.16 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/* ---------- animated data pipeline ---------- */

function FlowPipeline() {
  const wrapRef = useRef(null)
  const [live, setLive] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!live) return
    const cycle = setInterval(
      () => setActive((current) => (current + 1) % flowSteps.length),
      2400
    )
    return () => clearInterval(cycle)
  }, [live])

  return (
    <div className="flow-pipeline" ref={wrapRef} aria-label="How the learning data flows">
      {flowSteps.map((step, index) => (
        <div
          key={step.title}
          className={`flow-step ${index === active ? 'is-active' : ''} ${index < active ? 'is-done' : ''}`}
        >
          <span className="flow-node">
            <Icon name={step.icon} size={20} />
            <em className="flow-index">{index + 1}</em>
          </span>
          <span className="flow-chip">{step.chip}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
          {index < flowSteps.length - 1 && (
            <span className="flow-link" aria-hidden="true"><i /></span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------- main landing page ---------- */

export default function LandingPage({ onEnter, onAsk, darkMode, onToggleTheme }) {
  const scrollRef = useRef(null)
  const askInputRef = useRef(null)
  const activeRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [question, setQuestion] = useState('')
  const [hasSeenIntro, setHasSeenIntro] = useState(false)
  const [showHeritageIntro, setShowHeritageIntro] = useState(false)

  const goToPhase = (id) => {
    scrollRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const focusAsk = () => {
    goToPhase('hero')
    setTimeout(() => askInputRef.current?.focus({ preventScroll: true }), 650)
  }

  const stepPhase = (dir) => {
    const next = Math.min(Math.max(activeRef.current + dir, 0), phases.length - 1)
    if (next !== activeRef.current) goToPhase(phases[next].id)
  }

  useEffect(() => {
    activeRef.current = active
  }, [active])

  /* heritage intro — show once when first entering Scriptures, hide header there */
  useEffect(() => {
    // scriptures is index 3
    if (active === 3 && !hasSeenIntro && !showHeritageIntro) {
      setShowHeritageIntro(true)
    }
  }, [active, hasSeenIntro, showHeritageIntro])

  const dismissHeritageIntro = () => {
    setShowHeritageIntro(false)
    setHasSeenIntro(true)
  }

  // cinematic auto-collide after 6.2s if user just watches
  useEffect(()=>{
    if(showHeritageIntro){
      const t=setTimeout(()=> dismissHeritageIntro(), 6200)
      return()=> clearTimeout(t)
    }
  },[showHeritageIntro])

  /* progress bar + active phase follow the phase scroller */
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const elements = phases.map((phase) => root.querySelector(`#${phase.id}`))
    const onScroll = () => {
      const total = root.scrollHeight - root.clientHeight
      setProgress(total > 0 ? Math.min(root.scrollTop / total, 1) : 0)
      const rootTop = root.getBoundingClientRect().top
      const probe = root.clientHeight * 0.4
      let current = 0
      elements.forEach((el, index) => {
        if (el && el.getBoundingClientRect().top - rootTop <= probe) current = index
      })
      setActive(current)
    }
    onScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [])

  /* keyboard: arrow / page keys move one page section at a time — intro collides first */
  useEffect(() => {
    const onKey = (event) => {
      if (event.target !== document.body && event.target !== scrollRef.current) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        if (activeRef.current === 3 && showHeritageIntro) { dismissHeritageIntro(); return }
        stepPhase(1)
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        if (activeRef.current === 3 && showHeritageIntro) { dismissHeritageIntro(); return }
        stepPhase(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goToPhase('hero')
      } else if (event.key === 'End') {
        event.preventDefault()
        goToPhase('education')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showHeritageIntro])

  /* wheel listener: lock scroll to one complete screen per gesture — heritage intro collides first */
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    let isWheeling = false
    let wheelTimer = null

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 24) return
      if (isWheeling) {
        event.preventDefault()
        return
      }
      // if heritage intro is showing and user swipes down, collide to pothi instead of leaving page
      if (showHeritageIntro && activeRef.current === 3) {
        if (event.deltaY > 0) {
          event.preventDefault()
          isWheeling = true
          dismissHeritageIntro()
          clearTimeout(wheelTimer)
          wheelTimer = setTimeout(() => { isWheeling = false }, 700)
          return
        } else {
          // swipe up from intro goes to previous phase
          event.preventDefault()
          isWheeling = true
          dismissHeritageIntro()
          setTimeout(()=> stepPhase(-1), 320)
          clearTimeout(wheelTimer)
          wheelTimer = setTimeout(() => { isWheeling = false }, 700)
          return
        }
      }
      isWheeling = true
      const dir = event.deltaY > 0 ? 1 : -1
      stepPhase(dir)

      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => {
        isWheeling = false
      }, 700)
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      root.removeEventListener('wheel', onWheel)
      clearTimeout(wheelTimer)
    }
  }, [showHeritageIntro])

  /* touch swipe to collide heritage intro on mobile */
  useEffect(()=>{
    const root=scrollRef.current
    if(!root || !showHeritageIntro || active!==3) return
    let startY=0
    const onTouchStart=(e)=>{ startY=e.touches[0].clientY }
    const onTouchEnd=(e)=>{
      const dy=e.changedTouches[0].clientY - startY
      if(Math.abs(dy)<40) return
      if(dy<0) dismissHeritageIntro()
    }
    root.addEventListener('touchstart', onTouchStart, {passive:true})
    root.addEventListener('touchend', onTouchEnd, {passive:true})
    return()=>{ root.removeEventListener('touchstart', onTouchStart); root.removeEventListener('touchend', onTouchEnd) }
  },[showHeritageIntro, active])

  const askQuestion = (text) => {
    const value = (text ?? question).trim()
    if (!value) {
      onEnter?.()
      return
    }
    onAsk?.(value)
  }

  return (
    <div className={`spiritual-page landing-scroll ${darkMode ? 'night' : ''}`} ref={scrollRef}>
      <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      {/* Floating Authentic Marigold & Lotus Petals */}
      <div className="floating-petals-layer" aria-hidden="true">
        <svg className="petal petal-1" viewBox="0 0 32 32" width="20" height="20">
          <path d="M16 2 C10 8, 4 14, 4 21 A12 12 0 0 0 28 21 C28 14, 22 8, 16 2 Z" fill="url(#marigoldGrad1)" />
          <path d="M16 8 C12 12, 8 16, 8 20 A8 8 0 0 0 24 20 C24 16, 20 12, 16 8 Z" fill="#FFE082" opacity="0.6" />
          <defs>
            <linearGradient id="marigoldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="60%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="petal petal-2" viewBox="0 0 32 32" width="24" height="24">
          <path d="M16 2 C10 8, 4 14, 4 21 A12 12 0 0 0 28 21 C28 14, 22 8, 16 2 Z" fill="url(#marigoldGrad2)" />
          <defs>
            <linearGradient id="marigoldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9100" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
          </defs>
        </svg>
        <svg className="petal petal-3" viewBox="0 0 32 32" width="18" height="18">
          <path d="M16 2 C10 8, 4 14, 4 21 A12 12 0 0 0 28 21 C28 14, 22 8, 16 2 Z" fill="url(#marigoldGrad1)" />
        </svg>
        <svg className="petal petal-4" viewBox="0 0 32 32" width="22" height="22">
          <path d="M16 2 C10 8, 4 14, 4 21 A12 12 0 0 0 28 21 C28 14, 22 8, 16 2 Z" fill="url(#marigoldGrad2)" />
        </svg>
        <svg className="petal petal-5" viewBox="0 0 32 32" width="16" height="16">
          <path d="M16 2 C10 8, 4 14, 4 21 A12 12 0 0 0 28 21 C28 14, 22 8, 16 2 Z" fill="url(#marigoldGrad1)" />
        </svg>
      </div>

      <header className={`spiritual-header ${active === 3 ? 'is-hidden' : ''}`}>
        <button className="spiritual-brand-button" onClick={() => goToPhase('hero')}>
          <img className="brand-icon" src={brandIcon} alt="" />
          <span className="brand-text">
            <span className="spiritual-wordmark">Samvaad</span>
            <span className="brand-tagline">प्रश्न आपका, कृपा उसकी</span>
          </span>
        </button>

        <nav className="spiritual-nav" aria-label="Main navigation">
          <a href="#hero" onClick={(event) => { event.preventDefault(); goToPhase('hero') }}><Icon name="home" size={15} />Home</a>
          <a href="#numbers" onClick={(event) => { event.preventDefault(); goToPhase('numbers') }}><Icon name="spark" size={15} />Numbers</a>
          <a href="#pipeline" onClick={(event) => { event.preventDefault(); goToPhase('pipeline') }}><Icon name="layers" size={15} />Pipeline</a>
          <a href="#scriptures" onClick={(event) => { event.preventDefault(); goToPhase('scriptures') }}><Icon name="book" size={15} />Scriptures</a>
          <a href="#education" onClick={(event) => { event.preventDefault(); goToPhase('education') }}><Icon name="info" size={15} />About</a>
        </nav>

        <div className="spiritual-header-actions">
          <button
            className="theme-pill-toggle"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Switch to Day theme' : 'Switch to Night theme'}
            title="Toggle Day / Night theme"
          >
            <span className={`theme-pill-opt ${!darkMode ? 'is-active' : ''}`}>
              Day ☀️
            </span>
            <span className={`theme-pill-opt ${darkMode ? 'is-active' : ''}`}>
              Night 🌙
            </span>
          </button>
          <button className="rust-button cta-button" onClick={onEnter}>
            <span aria-hidden="true">🙏</span> Start Asking
          </button>
        </div>
      </header>

      {/* Side Dot Navigation */}
      <nav className="phase-nav" aria-label="Page phases">
        {phases.map((phase, index) => (
          <button
            key={phase.id}
            className={`phase-dot ${index === active ? 'is-active' : ''}`}
            onClick={() => goToPhase(phase.id)}
            aria-label={`Go to ${phase.label}`}
          >
            <span className="phase-dot-label">{phase.label}</span>
          </button>
        ))}
      </nav>

      <main>
        {/* ============================================================
            PAGE 1 · HERO
            ============================================================ */}
        <section className="spiritual-hero phase phase-hero" id="hero">
          {darkMode ? (
            <>
              <img
                src={heroNightTempleMobile}
                className="hero-bg hero-bg-mobile-temple"
                alt="Sacred Vrindavan Temple at Night"
                aria-hidden="true"
              />
              <TempleNightCanvas className="hero-bg hero-bg-canvas desktop-only-canvas" />
            </>
          ) : (
            <div
              className="hero-bg hero-bg-sunrise"
              style={{ backgroundImage: `url(${heroSunrise})` }}
              aria-hidden="true"
            />
          )}

          <div className="hero-copy-panel">
            <h1 className="hero-wordmark">
              <img
                className="hero-logo"
                src={logoWordmark}
                alt="Samvaad — प्रश्न आपका, कृपा उसकी · Ask, Learn, Reflect, Grow"
              />
            </h1>
            <p className="hero-tagline">Fine-Tuned AI embodying the <em>Wisdom of Indian Gurus, Saints & Hindu Scriptures</em></p>
            <p className="hero-desc">
              Ask your personal, emotional, or devotional questions. Trained on 4,000+ Bhajan Marg discourses,
              Bhagavad Gita, Ramayana, Upanishads & Vedas to guide you with calm, grounded wisdom.
            </p>

            <form
              className="hero-askbox"
              onSubmit={(event) => { event.preventDefault(); askQuestion() }}
            >
              <span className="askbox-lotus" aria-hidden="true">🪷</span>
              <input
                ref={askInputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask your spiritual or life question..."
                aria-label="Ask your question"
              />
              <button className="askbox-send" type="submit" aria-label="Send question">
                <Icon name="arrow-right" size={18} />
              </button>
            </form>

            <div className="topic-chips" aria-label="Popular topics">
              {topics.map((topic) => (
                <button key={topic.label} onClick={() => askQuestion(topic.prompt)}>
                  <span aria-hidden="true">{topic.emoji}</span>
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="hero-inspiration-bar">
              <span className="inspiration-icon" aria-hidden="true">🙏</span>
              <p className="inspiration-text">
                “मन को शांत करने का एक ही उपाय है – नाम जप और प्रेम !” <em>— पूज्य प्रेमानंद जी महाराज</em>
              </p>
            </div>
          </div>

          <div className="hero-visual" aria-label="Sacred Temple View">
            {SHOW_GURU && (
              <div className="maharaj-frame">
                <img alt="पूज्य प्रेमानंद जी महाराज in a namaste pose" src={guruCutout} />
              </div>
            )}
          </div>

          <button className="scroll-cue" onClick={() => goToPhase('numbers')} aria-label="Scroll down to Our Journey in Numbers">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Scroll</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 2 · OUR JOURNEY IN NUMBERS (DEDICATED PARCHMENT SCROLL PAGE)
            ============================================================ */}
        <section className="numbers-section phase" id="numbers">
          <Reveal className="spiritual-section-heading">
            <span>हमारे आंकड़े · The Milestones</span>
            <h2>Our Journey In Numbers</h2>
            <p>
              Years of discourses, millions of tokens, and continuous refinements preserved into a sacred, conversational guide.
            </p>
          </Reveal>

          {/* Ancient manuscript unfurling parchment scroll */}
          <ParchmentScroll />
        </section>

        {/* ============================================================
            PAGE 3 · HOW SAMVAAD WORKS (DATA PIPELINE)
            ============================================================ */}
        <section className="story-section phase" id="pipeline">
          <Reveal className="spiritual-section-heading">
            <span>The data story · कैसे काम करता है</span>
            <h2>From 4000+ discourses to a thoughtful chat.</h2>
            <p>
              Watch the learning pipeline come alive: videos are extracted from the Bhajan Marg
              channel, shaped into Q&amp;A pairs, fine-tuned, grounded with RAG scripture knowledge,
              and finally answered with relevance and love.
            </p>
          </Reveal>

          <FlowPipeline />
        </section>


        {/* ============================================================
            PAGE 4 · CINEMATIC SCRIPTURES
            Layer architecture:
              - pothi-stage   (z:0)  — fills entire 100svh, always rendered behind
              - heritage-intro (z:18) — full screen, sweeps UP cinematically on dismiss
            ============================================================ */}
        <section className={`scripture-section phase ${showHeritageIntro ? 'is-heritage' : 'is-pothi'}`} id="scriptures">

          {/* Layer 1 (back): Pothi — always rendered, visible as heritage sweeps up */}
          <div className={`pothi-stage ${showHeritageIntro ? 'is-hidden' : 'is-visible'}`}>
            <div className="spiritual-section-heading light-heading">
              <span>प्राचीन ग्रंथ · Ancient manuscripts</span>
              <h2>Where ancient manuscripts still speak.</h2>
              <p>
                Centuries ago the words of God were preserved in these manuscripts.
                Open the pothi — its cover lifts, the pages turn, and a Sanskrit shloka
                writes itself slowly, word by word.
              </p>
            </div>
            <ScriptureBook />
          </div>

          {/* Layer 2 (front): Heritage Intro — cinematic, sweeps UP on scroll/tap */}
          <div
            className={`heritage-intro ${showHeritageIntro ? 'is-visible' : 'is-collapsed'}`}
            aria-hidden={!showHeritageIntro ? 'true' : undefined}
          >
            <div className="heritage-bg" style={{ backgroundImage: `url(${oldManuscriptBg})` }} aria-hidden="true" />
            <div className="heritage-bg-overlay" aria-hidden="true" />
            <div className="heritage-inclined-page" aria-hidden="true">
              <div className="heritage-page-inner">ॐ · वेदोऽखिलो धर्ममूलम् · धर्मो रक्षति रक्षितः</div>
            </div>
            <div className="heritage-content">
              <span className="heritage-kicker">Our parampara · हमारी परम्परा</span>
              <h2>Where our history still breathes.</h2>
              <p className="heritage-lead">
                Before it was ever a book, <em>knowledge was a leaf</em>. For more than two millennia, rishis and acharyas etched dharma, karma, bhakti and jnana onto palm leaves with an iron <em>शलाका</em> — oiling, smoking, and tying them with cotton threads so wisdom could survive centuries.
              </p>
              <p>
                The <strong>Gita</strong>, <strong>Ramcharitmanas</strong>, <strong>Upanishads</strong> and <strong>Vedas</strong> you encounter here are not museum relics. They are the same pothis that travelled from Kashi to Kanchi, from forest ashrams to your hands — the living memory of a civilization that wrote to remember, and remembered to awaken.
              </p>
              <p className="heritage-muted">
                Samvaad keeps that lineage alive. Each shloka was once a hand-etched line on aged palm leaf; now it writes itself again — word by word, on the same inclined page before you, as if a Guru is writing it for you, today.
              </p>
              <div className="heritage-actions">
                <button className="rust-button cta-button heritage-cta" onClick={dismissHeritageIntro}>
                  Open the Pothi <span aria-hidden="true">→</span>
                </button>
                <span className="heritage-swipe-hint">swipe ↓ or tap to reveal</span>
              </div>
            </div>
            <button className="heritage-scroll-cue" onClick={dismissHeritageIntro} aria-label="Show manuscripts">
              <span />
              <small>Explore leaves</small>
            </button>
          </div>

        </section>


        {/* ============================================================
            PAGE 5 · FEATURES
            ============================================================ */}
        <section className="spiritual-features phase" id="features">
          <Reveal className="spiritual-section-heading">
            <span>Designed for gentle learning</span>
            <h2>A front page that explains the soul of the project.</h2>
            <p>
              The interface tells visitors what Samvaad is, what powers it, and why the
              responses should always be treated as educational guidance.
            </p>
          </Reveal>

          <div className="spiritual-feature-grid">
            {features.map((feature, index) => (
              <Reveal delay={index * 120} key={feature.title}>
                <article className="spiritual-feature-card">
                  <div className="feature-symbol"><Icon name={feature.icon} size={22} /></div>
                  <span className="feature-label">{feature.label}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <button onClick={onEnter} aria-label={`Explore ${feature.title}`}>Try it <span aria-hidden="true">→</span></button>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================
            PAGE 6 · DATASET EXAMPLES
            ============================================================ */}
        <section className="video-examples phase" id="dataset">
          <Reveal className="spiritual-section-heading">
            <span>Video content examples</span>
            <h2>Real topics from the Bhajan Marg learning corpus.</h2>
            <p>
              These sample video cards show the kind of source material the pipeline turns
              into searchable, conversational learning examples.
            </p>
          </Reveal>

          <div className="video-example-grid">
            {videoExamples.map((video, index) => (
              <Reveal delay={index * 110} key={video.id}>
                <a
                  className="video-example-card"
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <img alt={`${video.title} thumbnail`} loading="lazy" src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} />
                  <span>{video.label}</span>
                  <strong>{video.title}</strong>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="traditions">
            <span className="traditions-label">Learning material reflected in the playground</span>
            <div className="scripture-row">
              {scriptures.map((scripture) => <span key={scripture}>{scripture}</span>)}
            </div>
          </div>
        </section>

        {/* ============================================================
            PAGE 7 · EDUCATION PURPOSE & QUOTE
            ============================================================ */}
        <section className="spiritual-quote phase" id="education">
          <Reveal>
            <div className="quote-om">ॐ</div>
            <blockquote>“प्रेम ही भगवान तक पहुँचने का सरल मार्ग है !”</blockquote>
            <p className="quote-attrib">— पूज्य प्रेमानंद जी महाराज</p>
            <p>
              Samvaad is an independent <strong>personal education project</strong> — a playground for
              learning RAG, memory systems and bilingual UI design. It is <strong>not affiliated</strong> with
              Bhajan Marg or Premanand Ji Maharaj, and important guidance should always be
              verified with trusted sources and living teachers.
            </p>
            <button className="rust-button cta-button" onClick={onEnter}><span aria-hidden="true">🙏</span> Begin your Samvaad</button>
          </Reveal>
        </section>
      </main>
    </div>
  )
}
