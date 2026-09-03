import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const VIDEO_URL = 'https://www.youtube.com/watch?v=gWwhvLiBG78'
const CHANNEL_URL = 'https://www.youtube.com/@BhajanMarg'
const THUMB_URL = 'https://i.ytimg.com/vi/gWwhvLiBG78/maxresdefault.jpg'

const STEPS = [
  { icon: 'video', label: 'Collect' },
  { icon: 'layers', label: 'Transcribe' },
  { icon: 'code', label: 'Segment' },
  { icon: 'message-square', label: 'QA Pairs' },
  { icon: 'brain', label: 'Fine-tune' },
  { icon: 'spark', label: 'Answer' },
]

const QUEUE = [
  { done: true, id: '#1346', label: 'Ekantik Vartalaap · दर्शन और भक्ति', status: 'audio extracted' },
  { done: true, id: '#1345', label: 'Ekantik Vartalaap · नाम का महत्व', status: 'audio extracted' },
  { done: false, id: '#1344', label: 'Ekantik Vartalaap · मन को शांत करना', status: 'downloading', pct: 68 },
  { done: false, id: '#1343', label: 'Ekantik Vartalaap · प्रेम का सागर', status: 'queued', pct: 0 },
]

const VTT_CUES = [
  { t: '00:00:00.000 --> 00:00:04.200', text: 'सुनिए, मन को शांत करने का एक ही उपाय है...' },
  { t: '00:00:04.200 --> 00:00:08.800', text: 'नाम जप और प्रेम। बाकी सब कर्म में आता है।' },
  { t: '00:00:08.800 --> 00:00:12.500', text: 'जैसे राम ने कहा — मन को राम में लगाओ।' },
  { t: '00:00:12.500 --> 00:00:16.100', text: 'तब मन की चिंता अपने आप मिट जाती है।' },
]

const SEGMENTS = [
  { id: 'SEG-001', text: 'सुनिए, मन को शांत करने का एक ही उपाय है – नाम जप और प्रेम !' },
  { id: 'SEG-002', text: 'जैसे राम ने कहा, मन को राम में लगाओ — तब चिंता मिटती है।' },
  { id: 'SEG-003', text: 'प्रेम से जप करो, संसार की भागदौड़ में भी शांति मिलेगी।' },
  { id: 'SEG-004', text: 'मन को शांत करने का एक ही उपाय है – नाम जप और प्रेम !' },
]

const QA_PAIRS = [
  { q: 'मन भजन में कैसे टिके ?', a: 'जप और प्रेम से। मन को राम में लगाओ।' },
  { q: 'कर्म करते हुए भजन कैसे रखें ?', a: 'काम करते हुए नाम जपते रहें — संसार का काम, मन में राम।' },
  { q: 'चिंता से मुक्ति कैसे मिले ?', a: 'चिंता का एक ही उपाय है — नाम का सहारा।' },
]

const EPOCHS = [
  { n: 1, loss: 2.41, pct: 32 },
  { n: 2, loss: 1.12, pct: 66 },
  { n: 3, loss: 0.31, pct: 100 },
]

const ANSWER_HINDI = 'नमस्ते 🙏 आपका प्रश्न सुनकर बहुत अच्छा लगा। मन को शांत करने का एक ही उपाय है – नाम जप और प्रेम। जैसे राम ने कहा, मन को राम में लगाओ, तब मन की चिंता अपने आप मिट जाती है।'
const ANSWER_ENGLISH = 'Namaste 🙏 — the one remedy for a restless mind is nama japa and love. As Sri Ram said, keep your mind on Ram, and anxiety dissolves by itself.'

function CollectStage() {
  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">01</span> Collect — 4,000+ Bhajan Marg videos</p>
      {QUEUE.map((item, i) => (
        <div className="queue-row p-in" style={{ animationDelay: `${0.2 + i * 0.45}s` }} key={item.id}>
          <span className={`queue-icon ${item.done ? 'is-done' : item.status === 'downloading' ? 'is-busy' : ''}`}>
            {item.done ? <Icon name="check" size={12} /> : item.status === 'downloading' ? <Icon name="download" size={12} /> : <span />}
          </span>
          <span className="queue-label"><b>{item.id}</b> {item.label}</span>
          {item.status === 'downloading' ? (
            <span className="queue-pct">
              <span className="queue-bar"><i style={{ width: `${item.pct}%` }} /></span>{item.pct}%
            </span>
          ) : (
            <span className={`queue-status ${item.done ? 'ok' : ''}`}>{item.status}</span>
          )}
        </div>
      ))}
      <p className="proc-note">yt-dlp → audio stream 192 kbps · subtitle fetch</p>
    </div>
  )
}

function TranscribeStage() {
  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">02</span> Extract raw VTT transcription</p>
      <div className="vtt-panel">
        <p className="vtt-header">WEBVTT</p>
        {VTT_CUES.map((cue, i) => (
          <p className="vtt-cue p-in" style={{ animationDelay: `${0.25 + i * 0.6}s` }} key={cue.t}>
            <span className="vtt-time">{cue.t}</span>
            <span className="vtt-text">{cue.text}</span>
          </p>
        ))}
        <span className="term-cursor" aria-hidden="true" />
      </div>
      <p className="proc-note">Whisper large-v3 · timestamps + Hindi text → .vtt</p>
    </div>
  )
}

function SegmentStage() {
  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">03</span> Segment the transcript</p>
      {SEGMENTS.map((seg, i) => (
        <div className="seg-row p-in" style={{ animationDelay: `${0.2 + i * 0.5}s` }} key={seg.id}>
          <span className="seg-id">{seg.id}</span>
          <span className="seg-text">{seg.text}</span>
          <span className="seg-tokens">{(Math.random() * 60 + 90) | 0} tok</span>
        </div>
      ))}
      <p className="proc-note">topic-aware chunking · 12,800 segments · speaker labels</p>
    </div>
  )
}

function QaStage() {
  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">04</span> Shape Q&A learning pairs</p>
      {QA_PAIRS.map((pair, i) => (
        <div className="qa-card p-in" style={{ animationDelay: `${0.2 + i * 0.55}s` }} key={pair.q}>
          <p className="qa-q"><span>Q</span>{pair.q}</p>
          <p className="qa-a"><span>A</span>{pair.a}</p>
        </div>
      ))}
      <p className="proc-note">50,000+ Hindi + English pairs · clean + dedupe</p>
    </div>
  )
}

function FinetuneStage() {
  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">05</span> Fine-tune on the pairs</p>
      {EPOCHS.map((ep, i) => (
        <div className="ft-row p-in" style={{ animationDelay: `${0.2 + i * 0.55}s` }} key={ep.n}>
          <span className="ft-epoch">epoch {ep.n}/3</span>
          <span className="ft-bar"><i style={{ width: `${ep.pct}%`, animationDelay: `${0.4 + i * 0.55}s` }} /></span>
          <span className="ft-loss">loss {ep.loss.toFixed(2)}</span>
        </div>
      ))}
      <p className="proc-note">gemma base · LoRA · 8k steps → guru-v4 weights</p>
    </div>
  )
}

function AnswerStage({ live }) {
  const [hindi, setHindi] = useState('')
  const [english, setEnglish] = useState('')

  useEffect(() => {
    if (!live) return
    setHindi('')
    setEnglish('')
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setHindi(ANSWER_HINDI.slice(0, i))
      if (i >= ANSWER_HINDI.length) {
        clearInterval(timer)
        let j = 0
        const timer2 = setInterval(() => {
          j += 1
          setEnglish(ANSWER_ENGLISH.slice(0, j))
          if (j >= ANSWER_ENGLISH.length) clearInterval(timer2)
        }, 12)
      }
    }, 26)
    return () => clearInterval(timer)
  }, [live])

  return (
    <div className="proc-block">
      <p className="proc-label"><span className="proc-num">06</span> Answer — RAG + memory + fine-tuned tone</p>
      <div className="ans-user p-in">
        <span>🪷 मन भजन में कैसे टिके ?</span>
      </div>
      <div className="ans-guru p-in" style={{ animationDelay: '0.4s' }}>
        <p>{hindi}<span className="term-cursor" aria-hidden="true" /></p>
        <p className="ans-en">{english}</p>
      </div>
      <p className="proc-note">retrieved verses · memory context · guru style</p>
    </div>
  )
}

export default function ProcessScreen() {
  const wrapRef = useRef(null)
  const [live, setLive] = useState(false)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!live) return
    const timer = setInterval(() => setStage((s) => (s + 1) % STEPS.length), 4200)
    return () => clearInterval(timer)
  }, [live])

  return (
    <div className="process-screen" ref={wrapRef} aria-label="AI Guru data pipeline running inside a screen">
      <div className="process-titlebar">
        <span className="process-lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="process-appname">samvaad · data lab</span>
        <span className="process-stage-count">stage {stage + 1}/{STEPS.length}</span>
      </div>

      <div className="process-layout">
<div className="process-video" aria-label="YouTube video being processed">
            <a className="pv-player" href={VIDEO_URL} target="_blank" rel="noopener noreferrer" style={{ backgroundImage: `url(${THUMB_URL})` }} aria-label="Watch Ekantik Vartalaap #1323 on YouTube">
              <span className="pv-play" aria-hidden="true"><Icon name="play" size={20} /></span>
              <div className="pv-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
              <span className="pv-timer">12:41 / 45:34</span>
              <div className="pv-progress" aria-hidden="true"><i /></div>
            </a>
            <div className="pv-info">
              <p className="pv-title">#1323 Ekantik Vartalaap &amp; Darshan · 11-07-2026</p>
              <p className="pv-meta"><a className="pv-channel" href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">Bhajan Marg</a> · 215K views · Hindi · auto-captions on</p>
              <p className="pv-extract"><Icon name="mic" size={11} /> extracting audio + subtitles…</p>
              <a className="pv-watch" href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
                <Icon name="play" size={12} /> Watch on YouTube
              </a>
            </div>
          </div>

        <div className="process-stage" key={stage}>
          {!live && <p className="proc-note">— scroll here to run the pipeline —</p>}
          {stage === 0 && <CollectStage />}
          {stage === 1 && <TranscribeStage />}
          {stage === 2 && <SegmentStage />}
          {stage === 3 && <QaStage />}
          {stage === 4 && <FinetuneStage />}
          {stage === 5 && <AnswerStage live={live} />}
        </div>
      </div>

      <div className="process-steps" aria-label="Pipeline stages">
        {STEPS.map((step, i) => (
          <span
            key={step.label}
            className={`process-step ${i === stage ? 'is-active' : ''} ${i < stage || (stage === 0 && i === STEPS.length - 1) ? 'is-done' : ''}`}
          >
            <Icon name={step.icon} size={13} />
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}