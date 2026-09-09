import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon'

const quickPrompts = [
  { label: 'Make it gentle', prompt: 'Please answer in a calm and pleasant tone: ' },
  { label: 'Hindi + English', prompt: 'Explain this in simple Hindi and English: ' },
  { label: 'Give practice', prompt: 'Give me one small reflection practice for this question: ' },
]

export default function Composer({ value, onChange, onSubmit, guestLimitReached = false, onGuestLimitClick }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }, [value])

  const handleSend = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (guestLimitReached) {
      onGuestLimitClick && onGuestLimitClick()
      return
    }
    if (value && value.trim()) {
      onSubmit()
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (guestLimitReached) {
        onGuestLimitClick && onGuestLimitClick()
        return
      }
      handleSend(event)
    }
  }

  function addQuickPrompt(prompt) {
    if (guestLimitReached) { onGuestLimitClick && onGuestLimitClick(); return }
    const nextValue = value.trim() ? `${value.trim()} ${prompt}` : prompt
    onChange(nextValue)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  // Guest limit reached: replace composer with a locked sign-in CTA bar
  if (guestLimitReached) {
    return (
      <div className="composer-wrap">
        <motion.button
          className="composer-guest-lock"
          onClick={() => onGuestLimitClick && onGuestLimitClick()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          type="button"
          aria-label="Sign in to continue chatting"
        >
          <span className="composer-lock-icon" aria-hidden="true">🔒</span>
          <span className="composer-lock-text">
            <strong>Sign in to continue your spiritual journey</strong>
            <small>You've used your free question &mdash; sign in with Google for unlimited access</small>
          </span>
          <span className="composer-lock-cta">Sign in →</span>
        </motion.button>
        <p className="composer-note">Educational playground. Verify important guidance with trusted sources and teachers.</p>
      </div>
    )
  }

  return (
    <div className="composer-wrap">
      <div className="composer-toolbar" aria-label="Quick prompt helpers">
        {quickPrompts.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            onClick={() => addQuickPrompt(item.prompt)}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {item.label}
          </motion.button>
        ))}
      </div>
      <form className="composer" onSubmit={handleSend}>
        <textarea
          aria-label="Message Samvaad"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a devotional question, or continue your learning journey..."
          ref={textareaRef}
          rows="1"
          value={value}
          enterKeyHint="send"
        />
        <motion.button
          className="send-button"
          aria-label="Send message"
          disabled={!value.trim()}
          onClick={handleSend}
          type="submit"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Icon name="send" size={19} />
        </motion.button>
      </form>
      <p className="composer-note">Educational playground. Verify important guidance with trusted sources and teachers.</p>
    </div>
  )
}
