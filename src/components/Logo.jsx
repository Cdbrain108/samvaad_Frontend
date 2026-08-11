export default function Logo({ compact = false }) {
  return (
    <div className="brand" aria-label="Samvad AI">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-name">samvad</span>}
    </div>
  )
}
