import { useEffect, useState } from 'react'
import Icon from './Icon'

// Recreated, style-inspired sample exchanges — illustrations of the Bhajan Marg
// question-answer format this learning project studies, NOT real transcripts.
const samples = [
  {
    question: 'महाराज, मन भजन में टिकता नहीं है, क्या करूँ?',
    questionEn: 'Maharaj, my mind does not stay fixed in bhajan — what should I do?',
    answer: 'मन चंचल है, यह स्वाभाविक है। जब भी भटके, प्रेम से फिर नाम पर लौटा लाओ। यही अभ्यास है।',
  },
  {
    question: 'How can love for God awaken in the heart?',
    questionEn: '',
    answer: 'Through satsang and remembrance. Keep the name close, and the heart slowly learns to long.',
  },
  {
    question: 'दुख के समय भक्ति कैसे सहारा देती है?',
    questionEn: 'How does devotion support us in times of sorrow?',
    answer: 'जब सब छूट जाए, नाम नहीं छूटता। वही सहारा है, वही शांति है।',
  },
]

const PHASE_ASK = 'ask'
const PHASE_TYPING = 'typing'
const PHASE_ANSWER = 'answer'

/**
 * A self-playing, looping simulation of the devotee-asks / guru-answers style
 * found across 4000+ Bhajan Marg videos. Purely illustrative.
 */
export default function LiveQADemo() {
  const [sampleIndex, setSampleIndex] = useState(0)
  const [phase, setPhase] = useState(PHASE_ASK)
  const [revealed, setRevealed] = useState(0)

  const sample = samples[sampleIndex]

  useEffect(() => {
    let timer
    if (phase === PHASE_ASK) {
      timer = setTimeout(() => setPhase(PHASE_TYPING), 2100)
    } else if (phase === PHASE_TYPING) {
      timer = setTimeout(() => setPhase(PHASE_ANSWER), 1500)
    } else if (phase === PHASE_ANSWER) {
      setRevealed(0)
      const chars = sample.answer
      const interval = setInterval(() => {
        setRevealed((count) => {
          if (count >= chars.length) {
            clearInterval(interval)
            return count
          }
          return count + 2
        })
      }, 34)
      return () => clearInterval(interval)
    }
    return () => clearTimeout(timer)
  }, [phase, sample, sampleIndex])

  useEffect(() => {
    if (phase !== PHASE_ANSWER) return
    if (revealed < sample.answer.length) return
    const next = setTimeout(() => {
      setSampleIndex((current) => (current + 1) % samples.length)
      setPhase(PHASE_ASK)
    }, 4200)
    return () => clearTimeout(next)
  }, [phase, revealed, sample])

  const answerText = phase === PHASE_ANSWER ? sample.answer.slice(0, revealed) : ''
  const stillTypingAnswer = phase === PHASE_ANSWER && revealed < sample.answer.length

  return (
    <div className="live-demo" aria-label="Illustration of the Bhajan Marg question and answer style">
      <div className="live-demo-header">
        <span className="live-demo-dot" aria-hidden="true" />
        <div>
          <strong>Bhajan Marg · Q&A style</strong>
          <small>Recreated illustration — not a real transcript</small>
        </div>
        <span className="live-demo-badge">
          <Icon name="play" size={12} />
          Live demo
        </span>
      </div>

      <div className="live-demo-body">
        <div className={`demo-bubble devotee ${phase === PHASE_ASK ? 'is-entering' : ''}`}>
          <span className="demo-role">
            <Icon name="heart" size={12} />
            Devotee asks
          </span>
          <p lang="hi">{sample.question}</p>
          {sample.questionEn && <small>{sample.questionEn}</small>}
        </div>

        {phase !== PHASE_ASK && (
          <div className="demo-bubble guru">
            <span className="demo-role guru-role">
              <Icon name="flame" size={12} />
              Answered in a natural, pleasant manner
            </span>
            {phase === PHASE_TYPING ? (
              <span className="demo-typing" aria-label="Composing answer">
                <i /><i /><i />
              </span>
            ) : (
              <p lang="hi">
                {answerText}
                {stillTypingAnswer && <span className="stream-cursor" aria-hidden="true" />}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="live-demo-footer" aria-hidden="true">
        <span className="demo-progress">
          {samples.map((item, index) => (
            <i key={item.question} className={index === sampleIndex ? 'is-active' : ''} />
          ))}
        </span>
        <small>4000+ such dialogues power this playground</small>
      </div>
    </div>
  )
}
