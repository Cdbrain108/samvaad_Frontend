import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon'

export default function Composer({
  value,
  onChange,
  onSubmit,
  isDisabled = false,
  guestLimitReached = false,
  onGuestLimitClick,
  onFocus,
}) {
  const textareaRef = useRef(null)
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }, [value])

  const handleSend = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault()
      if (typeof e.stopPropagation === 'function') e.stopPropagation()
    }
    if (isDisabled || isSubmittingRef.current) return
    if (guestLimitReached) {
      onGuestLimitClick && onGuestLimitClick()
      return
    }
    const textToSend = (value || '').trim()
    if (textToSend) {
      isSubmittingRef.current = true
      // Instantly clear textarea and reset its height so user feels zero send delay
      onChange('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      onSubmit(textToSend)
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 800)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.stopPropagation()
      if (isDisabled || isSubmittingRef.current) return
      if (guestLimitReached) {
        onGuestLimitClick && onGuestLimitClick()
        return
      }
      handleSend(event)
    }
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
            <small>You&rsquo;ve used your free question &mdash; sign in with Google for unlimited access</small>
          </span>
          <span className="composer-lock-cta">Sign in →</span>
        </motion.button>
        <p className="composer-note">Educational playground. Verify important guidance with trusted sources and teachers.</p>
      </div>
    )
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={handleSend}>
        <textarea
          aria-label="Message Samvaad"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onClick={onFocus}
          placeholder={isDisabled ? 'Guru ji is responding...' : 'Ask a devotional question, or continue your learning journey...'}
          ref={textareaRef}
          rows="1"
          value={value}
          enterKeyHint="send"
        />
        <button
          className="send-button"
          aria-label="Send message"
          title={value.trim() ? "Send message (Enter)" : "Type your question to send"}
          disabled={!value.trim() || isDisabled}
          type="button"
          onClick={handleSend}
        >
          <Icon name="send" size={19} />
        </button>
      </form>
      <p className="composer-note">Educational playground. Verify important guidance with trusted sources and teachers.</p>
    </div>
  )
}
