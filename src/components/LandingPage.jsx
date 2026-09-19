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
  { id: 'education', label: 'About Us' },
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
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)

  // Replay typing every time the chat enters the viewport (ChatGPT-style)
  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const scrollRoot = node.closest('.landing-scroll')
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { root: scrollRoot || null, threshold: 0.32 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // When not visible, reset and cancel any pending typing so the next
    // entry always starts from an empty bubble with a fresh typewriter run
    if (!isVisible) {
      setIsTyping(false)
      setTypedText('')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

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
        timeoutRef.current = setTimeout(step, 16)
      } else {
        setIsTyping(false)
        timeoutRef.current = null
      }
    }
    // small entrance delay so the scroll-snap settle is perceived before typing
    timeoutRef.current = setTimeout(step, 220)
    return () => {
      cancelled = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [activeTab, isVisible, selected.a])

  return (
    <div ref={containerRef} className="chat-demo-container">
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

/* ---------- interactive animated about us & creator overview ---------- */

function ChatAboutUs({ onEnter }) {
  const conversations = [
    {
      id: 'creator',
      label: '👨‍💻 About Anuj Kesharwani',
      q: 'Who created Samvaad AI, and what is your story and professional background?',
      a: `Pranam! 🙏 My name is Anuj Kesharwani — an aspiring Gen AI & Agentic AI Developer (Fresher) passionate about crafting production-ready autonomous multi-agent systems, fine-tuned LLMs, and high-performance RAG pipelines.

I built Samvaad as an independent passion project to challenge myself and master end-to-end full-stack Agentic AI engineering from scratch:
• Architecting multi-agent reasoning with Groq Chain-of-Thought deliberation and dynamic query understanding.
• Engineering fine-tuning datasets for compassionate, grounded LLM personas with dedicated Q8_0 GGUF inference.
• Implementing authentic multi-source RAG across 29+ scriptures with hybrid semantic scoring and strict topic gating.
• Designing real-time conversational memory, low-latency voice mode, and a serene bilingual user experience.

As a fresher actively seeking opportunities in Gen AI & Agentic AI Development, I am eager to contribute, build, and innovate on cutting-edge AI systems!`,
      tag: 'Gen AI & Agentic AI Developer',
    },
    {
      id: 'passion',
      label: '🎯 Independent Passion Project',
      q: 'What inspired this project, and why build a spiritual AI assistant?',
      a: `Samvaad was conceived as a non-commercial learning playground and a sincere devotional seva.

Every day, countless students, professionals, and householders face deep emotional stress, moral questions, and spiritual longing. The discourses of Pujya Premanand Ji Maharaj in Vrindavan radiate profound peace, fearless truth, and unconditional divine love.

I wanted to explore how cutting-edge generative AI can be sculpted with humility and reverence — delivering grounded solace and authentic scriptural wisdom rather than cold transactional answers. It has been a deeply fulfilling labor of engineering and devotion.`,
      tag: 'Vision & Motivation',
    },
    {
      id: 'disclaimer',
      label: '⚖️ Affiliation & Disclaimer',
      q: 'Is Samvaad officially affiliated with Bhajan Marg or Pujya Premanand Ji Maharaj?',
      a: `No. Samvaad is strictly an independent, personal educational and portfolio project.

It is not officially affiliated with, endorsed by, or representing Shri Hit Radha Kripa Trust, Bhajan Marg, or Pujya Premanand Ji Maharaj. All spiritual discourses and sacred scriptures belong to their revered traditions.

This platform serves as an interactive learning playground. Guidance here is reflective and should always be complemented by living masters and personal discrimination.`,
      tag: 'Project Transparency',
    },
  ]

  const [activeTab, setActiveTab] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const selected = conversations[activeTab]
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const scrollRoot = node.closest('.landing-scroll')
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { root: scrollRoot || null, threshold: 0.28 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setIsTyping(false)
      setTypedText('')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

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
        timeoutRef.current = setTimeout(step, 16)
      } else {
        setIsTyping(false)
        timeoutRef.current = null
      }
    }
    timeoutRef.current = setTimeout(step, 200)
    return () => {
      cancelled = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [activeTab, isVisible, selected.a])

  return (
    <div ref={containerRef} className="chat-demo-container about-us-chat-container">
      <div className="chat-demo-window">
        {/* Chat Window Top Bar */}
        <div className="chat-demo-topbar">
          <div className="chat-demo-avatar" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            <span>AK</span>
          </div>
          <div className="chat-demo-meta">
            <strong>Anuj Kesharwani · Gen AI &amp; Agentic AI Developer</strong>
            <span className="chat-demo-sub">
              <span className="chat-online-pulse" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              Aspiring Gen AI / Agentic AI Developer (Fresher) · Independent Project
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

          {/* Creator / AI Answer */}
          <div className="chat-demo-msg chat-demo-msg-ai">
            <div className="chat-demo-ai-avatar" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }} aria-hidden="true">ॐ</div>
            <div className="chat-demo-bubble chat-demo-bubble-ai">
              <div className="chat-demo-sender">
                <span>Anuj Kesharwani</span>
                <small>Gen AI &amp; Agentic AI Developer (Fresher)</small>
              </div>
              <div className="chat-demo-typed-content">
                {typedText.split('\n\n').map((para, i) => {
                  if (para.includes('\n• ') || para.startsWith('• ')) {
                    const lines = para.split('\n')
                    return (
                      <div key={i} className="chat-demo-bullet-group" style={{ margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {lines.map((line, li) => (
                          <p key={li} style={line.startsWith('•') ? { paddingLeft: '8px', opacity: 0.95 } : undefined}>{line}</p>
                        ))}
                      </div>
                    )
                  }
                  return <p key={i}>{para}</p>
                })}
                {isTyping && <span className="term-cursor" aria-hidden="true">▌</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Question Selector Tabs & Contact CTA Buttons */}
        <div className="chat-demo-controls">
          <span className="chat-demo-controls-label">Explore the creator's vision &amp; background:</span>
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

          {/* Social & Connect Action Buttons */}
          <div className="creator-social-actions">
            <a
              href="https://www.linkedin.com/in/anuj-kesharwani-3a5245206/"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-action-btn creator-linkedin-btn"
              title="Connect with Anuj Kesharwani on LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66Z" />
              </svg>
              <span>Connect on LinkedIn</span>
            </a>

            <a
              href="mailto:anujkeshari786@gmail.com"
              className="creator-action-btn creator-email-btn"
              title="Send email to Anuj Kesharwani"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>Email: anujkeshari786@gmail.com</span>
            </a>

            <button className="rust-button cta-button" onClick={onEnter}>
              <span aria-hidden="true">🙏</span> Start Live Samvaad <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- main landing page ---------- */

export default function LandingPage({ onEnter, onAsk, onSignIn, darkMode, onToggleTheme, user, userProfile, onLogout }) {
  const scrollRef = useRef(null)
  const askInputRef = useRef(null)
  const activeRef = useRef(0)
  const progressRef = useRef(null)
  const [active, setActive] = useState(0)
  const [question, setQuestion] = useState('')
  const [pipelineTab, setPipelineTab] = useState('milestones')
  const [scriptureStage, setScriptureStage] = useState('story')
  const [navHidden, setNavHidden] = useState(false)
  const navHideTimer = useRef(null)

  const goToPhase = (id) => {
    const root = scrollRef.current
    const el = root?.querySelector(`#${id}`)
    if (!root || !el) return
    // scrollTo with offsetTop plays nice with proximity snap;
    // scrollIntoView(smooth) fights the snap animation and overshoots.
    root.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
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

  /* progress bar + active phase follow the phase scroller.
     rAF-throttled + progress painted via ref (no re-render per pixel),
     so scrolling stays smooth and never triggers a double-page jump. */
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const elements = phases.map((phase) => root.querySelector(`#${phase.id}`))
    let ticking = false

    const update = () => {
      ticking = false
      const total = root.scrollHeight - root.clientHeight
      const p = total > 0 ? Math.min(root.scrollTop / total, 1) : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p})`
      }
      const rootTop = root.getBoundingClientRect().top
      const probe = root.clientHeight * 0.4
      let current = 0
      elements.forEach((el, index) => {
        if (el && el.getBoundingClientRect().top - rootTop <= probe) current = index
      })
      if (current !== activeRef.current) {
        activeRef.current = current
        setActive(current)
      }
    }

    let settleTimer = null
    const checkImplicitSettle = () => {
      clearTimeout(settleTimer)
      settleTimer = setTimeout(() => {
        const rootTop = root.getBoundingClientRect().top
        let closestEl = null
        let minDiff = Infinity
        elements.forEach((el) => {
          if (!el) return
          const diff = Math.abs(el.getBoundingClientRect().top - rootTop)
          if (diff < minDiff) {
            minDiff = diff
            closestEl = el
          }
        })
        // If user stopped scrolling close to a section (within 24% of viewport), gently and implicitly align it
        if (closestEl && minDiff > 8 && minDiff < root.clientHeight * 0.24) {
          root.scrollTo({ top: closestEl.offsetTop, behavior: 'smooth' })
        }
      }, 220)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
      checkImplicitSettle()
    }
    update()
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      clearTimeout(settleTimer)
    }
  }, [])

  /* keyboard: arrow / page keys move one page section at a time.
     Native wheel/touch scrolling is intentionally left alone — the
     previous wheel-hijack (stepPhase + 700ms block) fought CSS snap
     and turned one flick into a 2-page jump. */
  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat) return
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

  /* Auto-hide taskbar logic:
     - On page section change or scroll: whole taskbar shows and auto-hides in 2 sec, leaving day/night bar visible.
     - When pointing mouse in taskbar area (clientY <= 95) or hover: whole taskbar gets visible again.
     - When scrolling up (deltaY < -15): whole taskbar gets visible again.
     - When scrolling down (deltaY > 15): hides taskbar for 100% clean view.
     - On last page (About Us / education): completely hidden / removed so creator profile is 100% unobstructed.
  */
  useEffect(() => {
    if (phases[active]?.id === 'education' || active === phases.length - 1) {
      clearTimeout(navHideTimer.current)
      setNavHidden(true)
      return
    }

    const showNavTemporarily = (duration = 2000) => {
      setNavHidden(false)
      clearTimeout(navHideTimer.current)
      navHideTimer.current = setTimeout(() => {
        setNavHidden(true)
      }, duration)
    }

    // 1. Mouse movement: pointing mouse in taskbar area (clientY <= 95) or moving towards top reveals whole taskbar
    const onMouseMove = (event) => {
      if (event.clientY <= 95 || event.movementY < -4) {
        showNavTemporarily(2600)
      } else if (event.movementY > 8 && event.clientY > 110) {
        clearTimeout(navHideTimer.current)
        setNavHidden(true)
      }
    }

    // 2. Mouse Up
    const onMouseUp = () => {
      showNavTemporarily(2400)
    }

    // 3. Wheel gesture: scrolling UP (deltaY < -15) reveals whole taskbar; scrolling DOWN (deltaY > 15) hides it
    const onWheelNav = (event) => {
      if (event.deltaY < -15) {
        showNavTemporarily(2600)
      } else if (event.deltaY > 15) {
        clearTimeout(navHideTimer.current)
        setNavHidden(true)
      }
    }

    // 4. Touch swipe events (mobile & tablet)
    let touchStartY = 0
    const onTouchStart = (event) => {
      touchStartY = event.touches[0].clientY
    }
    const onTouchMove = (event) => {
      const currentY = event.touches[0].clientY
      const deltaY = currentY - touchStartY
      if (deltaY > 18) {
        showNavTemporarily(2600)
      } else if (deltaY < -18) {
        clearTimeout(navHideTimer.current)
        setNavHidden(true)
      }
    }

    // Show full taskbar initially on page enter, then auto-hide in 2s
    showNavTemporarily(2000)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    window.addEventListener('wheel', onWheelNav, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('wheel', onWheelNav)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      clearTimeout(navHideTimer.current)
    }
  }, [active])


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
      <span className="scroll-progress" ref={progressRef} aria-hidden="true" />

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

      {/* Full Taskbar: auto-hides in 2s to floating Day/Night bar, completely omitted on About Us */}
      {phases[active]?.id !== 'education' && (
        <header
          className={`spiritual-header${navHidden ? ' is-hidden' : ''}`}
          onMouseEnter={() => {
            clearTimeout(navHideTimer.current)
            setNavHidden(false)
          }}
          onMouseLeave={() => {
            clearTimeout(navHideTimer.current)
            navHideTimer.current = setTimeout(() => setNavHidden(true), 2000)
          }}
        >
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
            <a href="#education" onClick={(event) => { event.preventDefault(); goToPhase('education') }}><Icon name="info" size={15} />About Us</a>
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
            {user ? (
              <div className="landing-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="theme-pill-toggle landing-user-pill"
                  onClick={onEnter}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 13px',
                    fontWeight: 600,
                    fontSize: '0.83rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: darkMode ? '#FFE9B8' : '#78350F',
                    background: darkMode ? 'rgba(254, 200, 75, 0.12)' : 'rgba(254, 243, 199, 0.85)',
                    border: darkMode ? '1px solid rgba(254, 200, 75, 0.35)' : '1px solid rgba(217, 119, 6, 0.35)',
                    borderRadius: '999px',
                  }}
                  type="button"
                  title={`Signed in as ${userProfile?.fullName || user.email || 'Devotee'}. Click to enter chat.`}
                >
                  <span aria-hidden="true">🙏</span>
                  <span style={{ maxWidth: '95px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Devotee')}
                  </span>
                </button>
                {onLogout && (
                  <button
                    className="theme-pill-toggle landing-logout-btn"
                    onClick={onLogout}
                    style={{
                      cursor: 'pointer',
                      padding: '7px 12px',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      color: darkMode ? '#FCA5A5' : '#DC2626',
                      background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.7)',
                      border: darkMode ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '999px',
                    }}
                    type="button"
                    aria-label="Sign out"
                    title="Sign out of account"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              onSignIn && (
                <button
                  className="theme-pill-toggle"
                  onClick={onSignIn}
                  style={{ cursor: 'pointer', padding: '8px 16px', fontWeight: 600, fontSize: '0.85rem' }}
                  type="button"
                  aria-label="Sign In to account"
                >
                  Sign In
                </button>
              )
            )}
            <button className="rust-button cta-button" onClick={onEnter}>
              <span aria-hidden="true">🙏</span> Start Asking
            </button>
          </div>
        </header>
      )}

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
              <span className="logo-moon" aria-hidden="true" />
              <img
                className="hero-logo"
                src={logoWordmark}
                alt="Samvaad — प्रश्न आपका, कृपा उसकी · Ask, Learn, Reflect, Grow"
              />
            </h1>
            <p className="hero-tagline">
              <span className="hero-tagline-lead">Fine-Tuned AI embodying the</span>
              <span className="hero-tagline-sacred"><em>Wisdom of Indian Gurus, Saints &amp; Hindu Scriptures</em></span>
            </p>
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
            PAGE 4 · HOW IT WORKS & NUMBERS (ENHANCED DUAL-VIEW FIT)
            ============================================================ */}
        <section className="pipeline-combined-section phase" id="pipeline">
          <Reveal className="spiritual-section-heading">
            <span>आंकड़े और वास्तुकला · How Samvaad Works</span>
            <h2>From 4,000+ discourses to an enlightened chat.</h2>
            <p>
              Explore the scale of preserved knowledge and the step-by-step AI pipeline.
            </p>
          </Reveal>

          {/* Interactive Mode Switcher */}
          <div className="pipeline-switcher-wrap">
            <div className="pipeline-switcher" role="tablist" aria-label="Pipeline view selection">
              <button
                type="button"
                role="tab"
                aria-selected={pipelineTab === 'milestones'}
                className={`pipeline-tab-btn ${pipelineTab === 'milestones' ? 'is-active' : ''}`}
                onClick={() => setPipelineTab('milestones')}
              >
                <span className="pipeline-tab-icon">📜</span>
                <span>1. Corpus Scale &amp; Numbers</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pipelineTab === 'architecture'}
                className={`pipeline-tab-btn ${pipelineTab === 'architecture' ? 'is-active' : ''}`}
                onClick={() => setPipelineTab('architecture')}
              >
                <span className="pipeline-tab-icon">⚙️</span>
                <span>2. 5-Stage AI Architecture</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Parchment Scroll Milestones */}
          {pipelineTab === 'milestones' ? (
            <div className="pipeline-pane-wrap">
              <ParchmentScroll />
              <div className="pipeline-pane-nav">
                <button
                  type="button"
                  className="pipeline-action-btn"
                  onClick={() => setPipelineTab('architecture')}
                  aria-label="Next: Explore 5-stage architecture"
                >
                  <span>Explore 5-Stage AI Architecture Pipeline</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Sequential 5-Stage Interactive Pipeline */
            <div className="pipeline-pane-wrap">
              <FlowPipeline />
              <div className="pipeline-pane-nav">
                <button
                  type="button"
                  className="pipeline-action-btn pipeline-action-secondary"
                  onClick={() => setPipelineTab('milestones')}
                  aria-label="Back to Corpus Scale"
                >
                  <span aria-hidden="true">←</span>
                  <span>View Corpus Scale &amp; Milestones</span>
                </button>
              </div>
            </div>
          )}

          <button className="scroll-cue" onClick={() => goToPhase('scriptures')} aria-label="Scroll down to Scriptures">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Scriptures</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 5 · ANCIENT SCRIPTURES (ANIMATED STORYTELLING: STORY FIRST, THEN POTHI ONLY)
            ============================================================ */}
        <section className="scripture-section phase" id="scriptures">
          {scriptureStage === 'story' ? (
            <div className="scripture-story-stage">
              <div className="sacred-divider" aria-hidden="true">
                <span />
                ॐ
                <span />
              </div>
              <div className="spiritual-section-heading light-heading scripture-story-heading">
                <span className="scripture-kicker">प्राचीन ग्रंथ · Living Manuscript Heritage</span>
                <h2>Where Ancient Manuscripts Still Speak</h2>
                <div className="heritage-parchment-card">
                  <p className="heritage-lead">
                    Before it was ever a book, <em>knowledge was a leaf (तालपत्र)</em>. For more than two millennia,
                    rishis and acharyas etched dharma, karma, bhakti and jnana onto palm leaves with an iron
                    <em>शलाका</em> — oiling, smoking, and preserving them so eternal wisdom could survive centuries.
                  </p>
                  <p className="heritage-sub">
                    The <strong>Bhagavad Gita</strong>, <strong>Ramcharitmanas</strong>, <strong>Upanishads</strong> and <strong>Vedas</strong> you encounter here are the living memory of a civilization that wrote to remember, and remembered to awaken.
                  </p>
                </div>
                <div className="scripture-story-actions">
                  <button
                    type="button"
                    className="unfurl-pothi-btn"
                    onClick={() => setScriptureStage('pothi')}
                    aria-label="Unfurl Sacred Palm-Leaf Pothi"
                  >
                    <span className="unfurl-btn-icon">📜</span>
                    <span>Unfurl the Sacred Palm-Leaf Pothi (तालपत्र पोथी)</span>
                    <span className="unfurl-btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="scripture-pothi-stage">
              <div className="scripture-pothi-topbar">
                <button
                  type="button"
                  className="pothi-return-story-btn"
                  onClick={() => setScriptureStage('story')}
                  aria-label="Return to Heritage Story"
                  title="Read the Heritage Story"
                >
                  <span aria-hidden="true">←</span>
                  <span>Read Heritage Story</span>
                </button>
                <span className="pothi-stage-tag">ॐ तालपत्र पोथी · Palm-Leaf Folios</span>
              </div>
              <ScriptureBook />
            </div>
          )}

          <button className="scroll-cue" onClick={() => goToPhase('education')} aria-label="Scroll down to About Us">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>About Us</small>
          </button>
        </section>

        {/* ============================================================
            PAGE 6 · ABOUT US & CREATOR'S PASSION PROJECT
            ============================================================ */}
        <section className="about-us-section phase" id="education">
          <Reveal className="spiritual-section-heading">
            <span>परिचय एवं ध्येय · About Us</span>
            <h2>Independent Passion Project &amp; Creator</h2>
            <p>
              Samvaad is an independent passion project crafted by <strong>Anuj Kesharwani</strong>, an aspiring Gen AI &amp; Agentic AI Developer (Fresher),
              to build and demonstrate end-to-end Agentic AI systems, custom fine-tuned LLMs, and multi-source RAG while honoring timeless wisdom.
            </p>
          </Reveal>

          <ChatAboutUs onEnter={onEnter} />
        </section>
      </main>
    </div>
  )
}

