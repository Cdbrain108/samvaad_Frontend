import { motion } from 'framer-motion'
import Icon from './Icon'

const headingStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const headingItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 20 } },
}

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
}

export default function Welcome({ suggestions, onSelectPrompt }) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <motion.div className="welcome-copy" variants={headingStagger} initial="hidden" animate="visible">
        <motion.span className="welcome-kicker" variants={headingItem}>Samvaad learning mode</motion.span>
        <motion.h1 id="welcome-title" variants={headingItem}>
          Ask with sincerity.
          <span> Reflect with clarity.</span>
        </motion.h1>
        <motion.p variants={headingItem}>
          Explore devotional questions in a warm conversational style with remembered
          context, scripture-aware retrieval and simple explanations.
        </motion.p>
      </motion.div>

      <motion.div className="suggestion-grid" variants={cardStagger} initial="hidden" animate="visible">
        {suggestions.map((suggestion) => (
          <motion.button
            className="suggestion-card"
            key={suggestion.title}
            onClick={() => onSelectPrompt(suggestion.prompt)}
            variants={cardItem}
            whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(120,70,10,0.14)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="suggestion-icon">
              <Icon name={suggestion.icon} size={22} />
            </span>
            <span className="suggestion-copy">
              <small>{suggestion.eyebrow}</small>
              <strong>{suggestion.title}</strong>
            </span>
            <span className="card-arrow" aria-hidden="true">-&gt;</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}
