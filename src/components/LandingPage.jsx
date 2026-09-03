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

/* ---------- full-screen 6-phase systematic flow ---------- */

const phases = [
  { id: 'hero', label: 'Home' },
  { id: 'inspiration', label: 'Inspiration' },
  { id: 'overview', label: 'About Project' },
  { id: 'pipeline', label: 'How It Works' },
  { id: 'scriptures', label: 'Scriptures' },
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

/* ---------- interactive animated chatbot demo overview ---------- */

function ChatProjectOverview({ onEnter }) {
  const conversations = [
    {
      id: 'motivation',
      label: '🙏 Why Samvaad was created',
      q: 'What is the Samvaad project really about, and what inspired you to build it?',
      a: `Pranam 🙏 Samvaad is a heartfelt educational seva born out of deep faith in Sanatan Dharma and immense reverence for Pujya Premanand Ji Maharaj (Bhajan Marg).

As a devotee seeking spiritual strength to quiet a restless mind and lead a righteous life, I realized millions of householders and youth have real, everyday questions about karma, anxiety, bhakti, detachment, and family duties. Maharaj Ji's Ekantik Vartalaap discourses on YouTube address these with boundless compassion and simple clarity.

I created Samvaad to make this wisdom effortlessly accessible through conversational AI — to help myself and fellow seekers clear doubts with humility, warmth, and sacred grounding.`,
      tag: 'Heart & Inspiration',
    },
    {
      id: 'working',
      label: '⚙️ How data & AI work',
      q: 'How does it turn 4,000+ Bhajan Marg discourses into an intelligent guide?',
      a: `Under the hood, Samvaad works through a dedicated multi-stage pipeline:

1. Transcribe: Audio from 4,000+ public Bhajan Marg discourses is transcribed into Hindi & English with speech AI (Whisper).
2. Segment & Q&A: Transcripts are curated into 50,000+ clean question-answer pairs capturing Maharaj Ji's gentle, loving voice.
3. Fine-Tuning: A foundational conversational model is fine-tuned on this dataset to speak with patience and reverence.
4. Scripture RAG: Crucial verses from Bhagavad Gita, Ramcharitmanas, Upanishads, and Vedas are embedded and retrieved dynamically to support answers with authentic shloka citations.`,
      tag: 'Architecture & RAG',
    },
    {
      id: 'devotion',
      label: '🪷 Who is this for & personal reflection',
      q: 'Can anyone ask personal life doubts? Does it remember my questions?',
      a: `Yes, completely. Samvaad is open for every seeker — whether you are taking your first steps in japa and nama, or seeking clarity during difficult emotional times.

Key features for seekers:
• Bilingual: Ask freely in Hindi, English, or mixed Hinglish.
• Scripture-Grounded: Quotes authentic verses when relevant.
• Persistent Memory: Remembers your questions across sessions so your reflection grows with you.
• Educational: An honest learning playground; important guidance should always be verified with living teachers.`,
      tag: 'Seeker Experience',
    },
  ]

  const [activeTab, setActiveTab] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const selected = conversations[activeTab]

  useEffect(() => {
    let cancelled = false
    setIsTyping(true)
    setTypedText('')

    const chars = Array.from(selected.a)
    let idx = 0
    const step = () => {
      if (cancelled) return
      if (idx < chars.length) {
        idx += 3
        setTypedText(chars.slice(0, idx).join(''))
        setTimeout(step, 16)
      } else {
        setIsTyping(false)
      }
    }
    const timer = setTimeout(step, 140)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [activeTab])

  return (
    <div className="chat-demo-container">
      <div className="chat-demo-window">
        {/* Chat Window Top Bar */}
        <div className="chat-demo-topbar">
          <div className="chat-demo-avatar">
            <span>ॐ</span>
          </div>
          <div className="chat-demo-meta">
            <strong>Samvaad AI · संवाद</strong>
            <span className="chat-demo-sub">
              <span className="chat-online-pulse" />
              Grounded in Bhajan Marg &amp; Holy Scriptures
            </span>
          </div>
          <span className="chat-demo-badge">{selected.tag}</span>
        </div>

        {/* Chat Messages */}
        <div className="chat-demo-body">
          {/* User Question */}
          <div className="chat-demo-msg chat-demo-msg-user">
            <div className="chat-demo-bubble">
              <p>{selected.q}</p>
            </div>
            <div className="chat-demo-user-avatar" aria-hidden="true">🙏</div>
          </div>

          {/* AI Answer */}
          <div className="chat-demo-msg chat-demo-msg-ai">
            <div className="chat-demo-ai-avatar" aria-hidden="true">🪷</div>
            <div className="chat-demo-bubble chat-demo-bubble-ai">
              <div className="chat-demo-sender">
                <span>Samvaad Assistant</span>
                <small>Compassionate reflection</small>
              </div>
              <div className="chat-demo-typed-content">
                {typedText.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {isTyping && <span className="term-cursor" aria-hidden="true">▌</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Question Selector Tabs & CTA */}
        <div className="chat-demo-controls">
          <span className="chat-demo-controls-label">Explore aspects of the project:</span>
          <div className="chat-demo-pills">
            {conversations.map((item, idx) => (
              <button
                key={item.id}
                className={`chat-demo-pill ${idx === activeTab ? 'is-active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="chat-demo-footer-action">
            <button className="rust-button cta-button" onClick={onEnter}>
              <span aria-hidden="true">🙏</span> Start Your Own Live Samvaad <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
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

  /* keyboard: arrow / page keys move one page section at a time */
  useEffect(() => {
    const onKey = (event) => {
      if (event.target !== document.body && event.target !== scrollRef.current) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        stepPhase(1)
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
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
  }, [])

  /* wheel listener: lock scroll to one complete screen per gesture */
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
  }, [])

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

      <header className="spiritual-header">
        <button className="spiritual-brand-button" onClick={() => goToPhase('hero')}>
          <img className="brand-icon" src={brandIcon} alt="" />
          <span className="brand-text">
            <span className="spiritual-wordmark">Samvaad</span>
            <span className="brand-tagline">प्रश्न आपका, कृपा उसकी</span>
          </span>
        </button>

        <nav className="spiritual-nav" aria-label="Main navigation">
          <a href="#hero" onClick={(event) => { event.preventDefault(); goToPhase('hero') }}><Icon name="home" size={15} />Home</a>
          <a href="#inspiration" onClick={(event) => { event.preventDefault(); goToPhase('inspiration') }}><Icon name="heart" size={15} />Inspiration</a>
          <a href="#overview" onClick={(event) => { event.preventDefault(); goToPhase('overview') }}><Icon name="message-square" size={15} />About Project</a>
          <a href="#pipeline" onClick={(event) => { event.preventDefault(); goToPhase('pipeline') }}><Icon name="layers" size={15} />How It Works</a>
          <a href="#scriptures" onClick={(event) => { event.preventDefault(); goToPhase('scriptures') }}><Icon name="book" size={15} />Scriptures</a>
          <a href="#education" onClick={(event) => { event.preventDefault(); goToPhase('education') }}><Icon name="info" size={15} />Purpose</a>
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
            <p className="hero-tagline">Fine-Tuned AI embodying the <em>Wisdom of Indian Gurus, Saints &amp; Hindu Scriptures</em></p>
            <p className="hero-desc">
              Ask your personal, emotional, or devotional questions. Trained on 4,000+ Bhajan Marg discourses,
              Bhagavad Gita, Ramayana, Upanishads &amp; Vedas to guide you with calm, grounded wisdom.
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

          <button className="scroll-cue" onClick={() => goToPhase('inspiration')} aria-label="Scroll down to Inspiration">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Scroll</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 2 · INSPIRATION (MOVED TO PAGE 2 AS REQUESTED)
            ============================================================ */}
        <section className="video-examples phase inspiration-section" id="inspiration">
          <Reveal className="spiritual-section-heading">
            <span>हमारी प्रेरणा · The Living Inspiration</span>
            <h2>Discourses of Pujya Premanand Ji Maharaj</h2>
            <p>
              Before diving into technology, Samvaad is anchored in sincere devotion.
              The questions and answers here reflect the daily Ekantik Vartalaap in Vrindavan —
              where householders, seekers, and youth find solace, purpose, and unshakeable love for God.
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
            <span className="traditions-label">Sacred traditions reflected in the learning corpus</span>
            <div className="scripture-row">
              {scriptures.map((scripture) => <span key={scripture}>{scripture}</span>)}
            </div>
          </div>

          <button className="scroll-cue" onClick={() => goToPhase('overview')} aria-label="Scroll down to About Project">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Overview</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 3 · INTERACTIVE ANIMATED CHAT DEMO OVERVIEW (NEW)
            ============================================================ */}
        <section className="chat-overview-section phase" id="overview">
          <Reveal className="spiritual-section-heading">
            <span>प्रकल्प परिचय · Project Overview</span>
            <h2>What is the Samvaad project really about?</h2>
            <p>
              Experience an animated dialogue explaining our personal motivation, spiritual foundation,
              and how modern AI brings 4,000+ Bhajan Marg discourses to life.
            </p>
          </Reveal>

          <ChatProjectOverview onEnter={onEnter} />

          <button className="scroll-cue" onClick={() => goToPhase('pipeline')} aria-label="Scroll down to How It Works">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>How It Works</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 4 · HOW IT WORKS & NUMBERS (COMBINED PAGES 2 & 3)
            ============================================================ */}
        <section className="pipeline-combined-section phase" id="pipeline">
          <Reveal className="spiritual-section-heading">
            <span>आंकड़े और वास्तुकला · Milestones &amp; Architecture</span>
            <h2>From 4,000+ discourses to an enlightened chat.</h2>
            <p>
              Explore both the scale of our preserved knowledge and the step-by-step pipeline:
              extracting speech, crafting 50,000+ Q&amp;A pairs, fine-tuning, grounding with scripture RAG,
              and answering with empathy and reverence.
            </p>
          </Reveal>

          {/* Ancient manuscript unfurling parchment scroll with numbers */}
          <ParchmentScroll />

          {/* Sequential 5-Stage Interactive Pipeline */}
          <FlowPipeline />

          <button className="scroll-cue" onClick={() => goToPhase('scriptures')} aria-label="Scroll down to Scriptures">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Scriptures</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 5 · ANCIENT SCRIPTURES & POTHI (PERMANENT HEADER, HOLE-FREE)
            ============================================================ */}
        <section className="scripture-section phase" id="scriptures">
          <div className="spiritual-section-heading light-heading">
            <span>प्राचीन ग्रंथ · Ancient manuscripts</span>
            <h2>Where ancient manuscripts still speak.</h2>
            <p className="heritage-lead">
              Before it was ever a book, <em>knowledge was a leaf</em>. For more than two millennia,
              rishis and acharyas etched dharma, karma, bhakti and jnana onto palm leaves with an iron
              <em>शलाका</em> — oiling, smoking, and preserving them so eternal wisdom could survive centuries.
            </p>
            <p className="heritage-sub">
              The <strong>Gita</strong>, <strong>Ramcharitmanas</strong>, <strong>Upanishads</strong> and <strong>Vedas</strong> you encounter here are the living memory of a civilization that wrote to remember, and remembered to awaken. Tap the leaf to turn, or open fullscreen to read with reverence.
            </p>
          </div>

          <ScriptureBook />

          <button className="scroll-cue" onClick={() => goToPhase('education')} aria-label="Scroll down to Purpose">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Purpose</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 6 · EDUCATION PURPOSE & SACRED BENEDICTION
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

