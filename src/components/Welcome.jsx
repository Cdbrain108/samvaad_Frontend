import Icon from './Icon'

export default function Welcome({ suggestions, onSelectPrompt }) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <span className="welcome-kicker">Samvad learning mode</span>
        <h1 id="welcome-title">
          Ask with sincerity.
          <span> Reflect with clarity.</span>
        </h1>
        <p>
          Explore devotional questions in a warm conversational style with remembered
          context, scripture-aware retrieval and simple explanations.
        </p>
      </div>

      <div className="suggestion-grid">
        {suggestions.map((suggestion) => (
          <button
            className="suggestion-card"
            key={suggestion.title}
            onClick={() => onSelectPrompt(suggestion.prompt)}
          >
            <span className="suggestion-icon">
              <Icon name={suggestion.icon} size={22} />
            </span>
            <span className="suggestion-copy">
              <small>{suggestion.eyebrow}</small>
              <strong>{suggestion.title}</strong>
            </span>
            <span className="card-arrow" aria-hidden="true">-&gt;</span>
          </button>
        ))}
      </div>
    </section>
  )
}
