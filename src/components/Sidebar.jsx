import Icon from './Icon'
import Logo from './Logo'

export default function Sidebar({
  conversations,
  isOpen,
  onClose,
  onNewChat,
  onSelectConversation,
}) {
  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Logo />
          <button className="icon-button mobile-only" onClick={onClose} aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>

        <button className="new-chat-button" onClick={onNewChat}>
          <Icon name="plus" size={18} />
          <span>New conversation</span>
        </button>

        <nav className="sidebar-nav" aria-label="Conversation history">
          <p className="nav-label">Recent</p>
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                className="conversation-item"
                key={conversation}
                onClick={() => onSelectConversation(conversation)}
              >
                <Icon name="chat" size={17} />
                <span>{conversation}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-action">
            <Icon name="settings" size={18} />
            <span>Preferences</span>
          </button>
          <div className="profile">
            <span className="avatar">AK</span>
            <span>
              <strong>Student workspace</strong>
              <small>Educational project</small>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
