import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import ScriptureBook from './ScriptureBook'
import LiveQADemo from './LiveQADemo'

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

const pipeline = [
  {
    icon: 'video',
    title: 'Listen',
    stat: '4000+ videos',
    text: 'Public discourses from the Bhajan Marg YouTube channel, where devotees ask questions and Premanand Ji Maharaj answers in a natural, pleasant manner.',
  },
  {
    icon: 'mic',
    title: 'Transcribe',
    stat: 'Hindi + English',
    text: 'Speech is carefully transcribed and aligned with video subtitles in both languages, preserving the warmth of the original words.',
  },
  {
    icon: 'layers',
    title: 'Shape',
    stat: 'Q&A pairs',
    text: 'Transcripts are segmented, cleaned and shaped into question-answer learning examples ready for retrieval practice.',
  },
  {
    icon: 'brain',
    title: 'Reflect',
    stat: 'Live memory',
    text: 'When you ask, Samvad searches related teachings and your remembered context, then replies in a calm, devotional style.',
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
  'How do I steady my mind during naam jap?',
  'मन भजन में कैसे टिके?',
  'Why do worldly desires fade when longing awakens?',
  'दैनिक जीवन में अभ्यास कैसे रखें?',
  'How should a devotee continue practice in daily life?',
  'नाम का सहारा कैसे लें?',
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

function SpiritualBrand() {
  return (
    <span className="spiritual-brand" aria-label="Samvad AI">
      <span className="om-seal" aria-hidden="true">Om</span>
      <span className="spiritual-wordmark">Samvad AI</span>
    </span>
  )
}

function HeroAmbience() {
  return (
    <div className="hero-ambience" aria-hidden="true">
      <span className="mandala-ring ring-slow" />
      <span className="mandala-ring ring-fast" />
      <span className="hero-ember ember-a" />
      <span className="hero-ember ember-b" />
      <span className="hero-ember ember-c" />
      <span className="hero-ember ember-d" />
      <span className="hero-ember ember-e" />
      <span className="hero-ember ember-f" />
    </div>
  )
}

/* ---------- page ---------- */

export default function LandingPage({ onEnter }) {
  const scrollRef = useRef(null)
  const activeRef = useRef(0)
  const statsRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [statsStarted, setStatsStarted] = useState(false)

  const goToPhase = (id) => {
    scrollRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
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

  return (
    <div className="spiritual-page landing-scroll" ref={scrollRef}>
      <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <header className="spiritual-header">
        <button className="spiritual-brand-button" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
          <SpiritualBrand />
        </button>

        <nav className="spiritual-nav" aria-label="Main navigation">
          <a href="#story" onClick={(event) => { event.preventDefault(); goToPhase('story') }}>Data Story</a>
          <a href="#scriptures" onClick={(event) => { event.preventDefault(); goToPhase('scriptures') }}>Scriptures</a>
          <a href="#features" onClick={(event) => { event.preventDefault(); goToPhase('features') }}>Experience</a>
          <a href="#dataset" onClick={(event) => { event.preventDefault(); goToPhase('dataset') }}>Dataset</a>
        </nav>

        <div className="spiritual-header-actions">
          <a className="outline-button compact-button" href="#education" onClick={(event) => { event.preventDefault(); goToPhase('education') }}>Purpose</a>
          <button className="rust-button compact-button" onClick={onEnter}>Open Chat</button>
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
          <HeroAmbience />

          <div className="hero-copy-panel">
            <div className="sacred-divider" aria-hidden="true"><span />Bhajan Marg inspired<span /></div>
            <span className="spiritual-pill">Personal AI learning playground · Education only</span>
            <h1>Samvad AI</h1>
            <p>
              Explore devotional questions through a responsive, living chat — shaped by the
              Q&A style of 4000+ Bhajan Marg video discourses, scripture notes and your
              remembered reflections.
            </p>

            <div className="spiritual-hero-actions">
              <button className="rust-button glow-button" onClick={onEnter}>Start a Samvad</button>
              <a className="outline-button" href="#story" onClick={(event) => { event.preventDefault(); goToPhase('story') }}>See the Data Story</a>
            </div>

            <div className="hero-stats" aria-label="Project signals">
              <span><strong>4000+</strong> videos studied</span>
              <span><strong>Hindi + English</strong> bilingual</span>
              <span><strong>Live</strong> memory chat</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Premanand Ji Maharaj and Bhajan Marg learning examples">
            <div className="maharaj-frame">
              <img
                alt="Premanand Ji Maharaj video thumbnail from Bhajan Marg"
                src="https://i.ytimg.com/vi/Lgn-rroObt0/hqdefault.jpg"
              />
              <div className="video-badge"><i />Bhajan Marg video source</div>
            </div>
            <div className="floating-question question-one">
              <span>Devotee asks</span>
              <strong>How can my mind stay fixed in naam?</strong>
            </div>
            <div className="floating-question question-two">
              <span>Samvad retrieves</span>
              <strong>Related Q&A, memory and scripture context</strong>
            </div>
          </div>

          <div className="video-marquee" aria-label="Example questions">
            <div>
              {[...questionExamples, ...questionExamples].map((question, index) => (
                <span key={`${question}-${index}`}>{question}</span>
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
              On the Bhajan Marg channel, devotees ask heartfelt questions and Premanand Ji
              Maharaj answers in a natural, pleasant manner. This personal playground studies
              that beautiful question-answer style — nothing more, nothing less.
            </p>
          </Reveal>

          <div className="story-grid">
            <div className="story-copy">
              <div className="story-stats" ref={statsRef}>
                <StatBlock end={4000} suffix="+" label="Bhajan Marg videos studied" started={statsStarted} />
                <StatBlock end={2} label="Languages — Hindi & English" started={statsStarted} delay={120} />
                <StatBlock end={1} label="Purpose — pure learning" started={statsStarted} delay={240} />
              </div>

              <ol className="pipeline" aria-label="How the learning data flows">
                {pipeline.map((step, index) => (
                  <Reveal as="li" delay={index * 110} key={step.title} className="pipeline-step">
                    <span className="pipeline-icon">
                      <Icon name={step.icon} size={19} />
                    </span>
                    <div className="pipeline-body">
                      <div className="pipeline-head">
                        <h3>{step.title}</h3>
                        <span className="pipeline-stat">{step.stat}</span>
                      </div>
                      <p>{step.text}</p>
                    </div>
                    {index < pipeline.length - 1 && <span className="pipeline-link" aria-hidden="true" />}
                  </Reveal>
                ))}
              </ol>
            </div>

            <Reveal delay={160} className="story-demo-wrap">
              <LiveQADemo />
              <p className="story-demo-note">
                The demo above is a recreated illustration of the discourse style, produced for
                education. It is not a real transcript and is not affiliated with Bhajan Marg.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- PHASE 3 · 3D SCRIPTURES ---------- */}
        <section className="scripture-section phase" id="scriptures">
          <Reveal className="spiritual-section-heading light-heading">
            <span>Animated sacred texts</span>
            <h2>Scriptures, brought to life.</h2>
            <p>
              A living manuscript floats beside your questions. Move your pointer over the
              pothi to tilt it in 3D, and watch verses from the Gita and Chalisa turn with it.
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
              The interface tells visitors what Samvad is, what powers it, and why the
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
            <blockquote>Built for learning, reflection and experimentation.</blockquote>
            <p>
              Samvad AI is an independent <strong>personal education project</strong> — a playground for
              learning RAG, memory systems and bilingual UI design. It is <strong>not affiliated</strong> with
              Bhajan Marg or Premanand Ji Maharaj, and important guidance should always be
              verified with trusted sources and living teachers.
            </p>
            <button className="rust-button glow-button" onClick={onEnter}>Begin your Samvad</button>
          </Reveal>
        </section>

        {/* ---------- PHASE 7 · CONTACT / CLOSING ---------- */}
        <section className="phase phase-final" id="contact">
          <div className="final-stack">
            <SpiritualBrand />
            <span className="final-kicker">Personal project · Education only</span>
            <a className="final-mail" href="mailto:hello@samvad.ai">hello@samvad.ai</a>
            <button className="rust-button glow-button" onClick={onEnter}>Open the Chat</button>
            <p className="final-note">
              2026 Samvad AI · Independent educational playground · Not affiliated with Bhajan Marg
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
