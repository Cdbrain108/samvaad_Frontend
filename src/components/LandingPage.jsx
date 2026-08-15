import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import ScriptureBook from './ScriptureBook'
import LiveQADemo from './LiveQADemo'
import heroSunrise from '../assets/hero-sunrise.jpg'
import heroNightTemple from '../assets/hero-night-temple.png'
import logoWordmark from '../assets/logo-wordmark.webp'
import brandIcon from '../assets/brand-icon.webp'
import guruCutout from '../assets/guru-cutout.webp'

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

/* Guru Ji's cutout is kept fully intact (asset, CSS, measurements) —
   flip this flag to true to bring him back into the hero exactly as before. */
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

/* ---------- full-screen phases ---------- */

const phases = [
  { id: 'hero', label: 'Welcome' },
  { id: 'story', label: 'Data Story' },
  { id: 'scriptures', label: 'Scriptures' },
  { id: 'features', label: 'Experience' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'education', label: 'Purpose' },
  { id: 'contact', label: 'Contact' },
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

function CountUp({ end, started, duration = 1600 }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    let frame
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return <>{value.toLocaleString('en-IN')}</>
}

function StatBlock({ end, suffix = '', label, started, delay = 0 }) {
  return (
    <div className="story-stat" style={{ transitionDelay: `${delay}ms` }}>
      <strong>
        <CountUp end={end} started={started} />
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
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

/* ---------- page ---------- */

export default function LandingPage({ onEnter, onAsk, darkMode, onToggleTheme }) {
  const scrollRef = useRef(null)
  const askInputRef = useRef(null)
  const activeRef = useRef(0)
  const statsRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [statsStarted, setStatsStarted] = useState(false)
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
      /* active phase = the last one whose top crossed 40% of the screen,
         so phases taller than the viewport still register correctly */
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

  /* keyboard: arrow / page keys move one phase at a time */
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
        goToPhase('contact')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const node = statsRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const askQuestion = (text) => {
    const value = (text ?? question).trim()
    if (!value) {
      focusAsk()
      return
    }
    onAsk?.(value)
  }

  return (
    <div className={`spiritual-page landing-scroll ${darkMode ? 'night' : ''}`} ref={scrollRef}>
      <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      {/* Floating Marigold Petals Background Animation */}
      <div className="floating-petals-layer" aria-hidden="true">
        <span className="petal" />
        <span className="petal" />
        <span className="petal" />
        <span className="petal" />
        <span className="petal" />
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
          <a href="#hero" onClick={(event) => { event.preventDefault(); focusAsk() }}><Icon name="help" size={15} />Ask</a>
          <a href="#scriptures" onClick={(event) => { event.preventDefault(); goToPhase('scriptures') }}><Icon name="book" size={15} />Scriptures</a>
          <a href="#education" onClick={(event) => { event.preventDefault(); goToPhase('education') }}><Icon name="info" size={15} />About</a>
        </nav>

        <div className="spiritual-header-actions">
          <button
            className={`theme-toggle ${darkMode ? 'is-night' : ''}`}
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Switch to day theme' : 'Switch to night theme'}
          >
            <span className="toggle-thumb" aria-hidden="true"><Icon name={darkMode ? 'moon' : 'sun'} size={13} /></span>
            <Icon name="moon" size={13} />
            <Icon name="sun" size={13} />
          </button>
          <button className="rust-button cta-button" onClick={onEnter}>
            <span aria-hidden="true">🙏</span> Start Asking
          </button>
        </div>
      </header>

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
        {/* ---------- PHASE 1 · HERO ---------- */}
        <section className="spiritual-hero phase phase-hero" id="hero">
          <div
                      className="hero-bg"
                      style={{ backgroundImage: `url(${darkMode ? heroNightTemple : heroSunrise})` }}
                      aria-hidden="true"
                    />
          {darkMode && (
            <div className="night-sky" aria-hidden="true">
              <span className="sky-moon" />
              <i className="sky-star" style={{ top: '16%', right: '30%' }} />
              <i className="sky-star" style={{ top: '9%', right: '12%', animationDelay: '.9s' }} />
              <i className="sky-star" style={{ top: '27%', right: '6%', animationDelay: '1.6s' }} />
              <i className="sky-star" style={{ top: '34%', right: '24%', animationDelay: '2.3s' }} />
            </div>
          )}
          <div className="hero-copy-panel">
            <span className="hero-welcome">
              <span className="diya-container"><Icon name="diya" size={16} /></span>
              Welcome to
              <span className="diya-container"><Icon name="diya" size={16} /></span>
            </span>
            <h1 className="hero-wordmark">
              <img
                className="hero-logo"
                src={logoWordmark}
                alt="Samvaad — प्रश्न आपका, कृपा उसकी · Ask, Learn, Reflect, Grow"
              />
            </h1>
            <p className="hero-tagline">Where AI speaks with the <em>heart</em> of a Guru</p>
            <p className="hero-desc">
              Ask your questions about life, devotion, dharma, karma and Hindu scriptures.
              Get answers inspired by the teachings and love of Premanand Ji Maharaj —
              shaped from 4000+ Bhajan Marg discourses.
            </p>
            <span className="spiritual-pill">Personal AI learning playground · Education only</span>

            <form
              className="hero-askbox"
              onSubmit={(event) => { event.preventDefault(); askQuestion() }}
            >
              <span className="askbox-lotus" aria-hidden="true">🪷</span>
              <input
                ref={askInputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask your question..."
                aria-label="Ask your question"
              />
              <button className="askbox-send" type="submit" aria-label="Send question">
                <Icon name="arrow-right" size={18} />
              </button>
            </form>
            <p className="hero-examples">
              e.g. “How to find inner peace?”, “What is true love (prem)?”, “Meaning of karma?”
            </p>

            <div className="topic-chips" aria-label="Popular topics">
              {topics.map((topic) => (
                <button key={topic.label} onClick={() => askQuestion(topic.prompt)}>
                  <span aria-hidden="true">{topic.emoji}</span>
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Premanand Ji Maharaj and a teaching quote">
            {SHOW_GURU && (
              <div className="maharaj-frame">
                <img alt="पूज्य प्रेमानंद जी महाराज in a namaste pose" src={guruCutout} />
              </div>
            )}
            <div className="hero-quote-card">
              <p>“मन को शांत करने का एक ही उपाय है – नाम जप और प्रेम !”</p>
              <span><i aria-hidden="true">🙏</i> — पूज्य प्रेमानंद जी महाराज</span>
            </div>
          </div>

          <div className="video-marquee" aria-label="Example questions">
            <div>
              {[...questionExamples, ...questionExamples].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>

          <button className="scroll-cue" onClick={() => goToPhase('story')} aria-label="Scroll down to the data story">
            <span className="scroll-cue-wheel" aria-hidden="true" />
            <small>Scroll</small>
          </button>
        </section>

        {/* ---------- PHASE 2 · DATA STORY / HOW IT WORKS ---------- */}
        <section className="story-section phase" id="story">
          <Reveal className="spiritual-section-heading">
            <span>The data story · कैसे काम करता है</span>
            <h2>From 4000+ discourses to a thoughtful chat.</h2>
            <p>
              Watch the learning pipeline come alive: videos are extracted from the Bhajan Marg
              channel, shaped into Q&A pairs, fine-tuned, grounded with RAG scripture knowledge,
              and finally answered with relevance and love.
            </p>
          </Reveal>

          <div className="story-stats" ref={statsRef}>
            <StatBlock end={4000} suffix="+" label="Bhajan Marg videos studied" started={statsStarted} />
            <StatBlock end={50000} suffix="+" label="Hindi + English Q&A pairs" started={statsStarted} delay={120} />
            <StatBlock end={5} label="Pipeline stages, fully animated" started={statsStarted} delay={240} />
          </div>

          <FlowPipeline />

          <Reveal delay={160} className="story-demo-wrap">
            <LiveQADemo />
            <p className="story-demo-note">
              The demo above is a recreated illustration of the discourse style, produced for
              education. It is not a real transcript and is not affiliated with Bhajan Marg.
            </p>
          </Reveal>
        </section>

        {/* ---------- PHASE 3 · 3D SCRIPTURES ---------- */}
        <section className="scripture-section phase" id="scriptures">
          <Reveal className="spiritual-section-heading light-heading">
            <span>प्राचीन ग्रंथ · Ancient manuscripts</span>
            <h2>Where ancient manuscripts still speak.</h2>
            <p>
              Centuries ago the words of God were preserved in these manuscripts, and in them
              dharma and karma still breathe today. Open the pothi — its cover lifts, the pages
              turn, and a Sanskrit shloka writes itself slowly, carrying the wisdom that makes
              our ancient history our richest treasure.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <ScriptureBook />
          </Reveal>
        </section>

        {/* ---------- PHASE 4 · FEATURES ---------- */}
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

        {/* ---------- PHASE 5 · DATASET EXAMPLES ---------- */}
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

        {/* ---------- PHASE 6 · EDUCATION PURPOSE ---------- */}
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

        {/* ---------- PHASE 7 · CONTACT / CLOSING ---------- */}
        <section className="phase phase-final" id="contact">
          <div className="final-stack">
            <img className="final-icon" src={brandIcon} alt="Samvaad app icon" />
            <span className="final-kicker">Personal project · Education only</span>
            <a className="final-mail" href="mailto:hello@samvaad.ai">hello@samvaad.ai</a>
            <button className="rust-button cta-button" onClick={onEnter}><span aria-hidden="true">🙏</span> Start Asking</button>
          </div>

          <div className="final-bar">
            <span className="final-om" aria-hidden="true">〜 ॐ 〜</span>
            <span className="final-mantra"><i aria-hidden="true">🪷</i> Serve · Learn · Love <i aria-hidden="true">🪷</i></span>
            <span className="final-built">Built with <i aria-hidden="true">❤️</i> for Dharma</span>
          </div>
        </section>
      </main>
    </div>
  )
}
