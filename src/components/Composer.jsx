import { useEffect, useRef } from 'react'
import Icon from './Icon'

const quickPrompts = [
  { label: 'Make it gentle', prompt: 'Please answer in a calm and pleasant tone: ' },
  { label: 'Hindi + English', prompt: 'Explain this in simple Hindi and English: ' },
  { label: 'Give practice', prompt: 'Give me one small reflection practice for this question: ' },
]

export default function Composer({ value, onChange, onSubmit }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }, [value])

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  function addQuickPrompt(prompt) {
    const nextValue = value.trim() ? `${value.trim()} ${prompt}` : prompt
    onChange(nextValue)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <div className="composer-wrap">
      <div className="composer-toolbar" aria-label="Quick prompt helpers">
        {quickPrompts.map((item) => (
          <button key={item.label} type="button" onClick={() => addQuickPrompt(item.prompt)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="composer">
        <button className="composer-action" aria-label="Attach a file" type="button">
          <Icon name="attach" />
        </button>
        <textarea
          aria-label="Message Samvaad"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a devotional question, or continue your learning journey..."
          ref={textareaRef}
          rows="1"
          value={value}
        />
        <button
          className="send-button"
          aria-label="Send message"
          disabled={!value.trim()}
          onClick={onSubmit}
          type="button"
        >
          <Icon name="send" size={19} />
        </button>
      </div>
      <p className="composer-note">Educational playground. Verify important guidance with trusted sources and teachers.</p>
    </div>
  )
}
