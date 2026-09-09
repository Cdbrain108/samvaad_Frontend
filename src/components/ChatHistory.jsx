import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteConversation } from '../services/firebase';
import Icon from './Icon';

export default function ChatHistory({ user, conversations = [], isOpen = false, onClose, onSelectConversation, onNewChat, onDeleteConversation, onLogout, onGuestSignIn }) {
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;

    // Local-only conversations (id starts with "local_") only exist in localStorage
    // — skip the Firestore call and remove them directly from state.
    const isLocalOnly = conversationId.startsWith('local_') || !user?.uid || user.uid === 'devotee_local';

    if (!isLocalOnly) {
      const result = await deleteConversation(user.uid, conversationId);
      if (result.error) {
        alert('Failed to delete: ' + result.error);
        return;
      }
    }

    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const listStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const listItem = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const isGuest = user?.uid === 'devotee_local';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            className="sidebar-backdrop is-visible"
            aria-label="Close navigation"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${isOpen ? 'is-open' : ''} ${conversations.length > 0 ? 'has-conversations' : ''}`}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="sidebar-title-icon">ॐ</span>
            <span>Conversations</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isGuest && (
              <motion.button
                className="icon-button"
                onClick={onNewChat}
                aria-label="New conversation"
                title="New conversation"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <Icon name="plus" size={18} />
              </motion.button>
            )}
            <button className="icon-button sidebar-close-btn" onClick={onClose} aria-label="Close menu" title="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {isGuest ? (
          <div className="sidebar-guest-cta">
            <div className="guest-cta-icon" aria-hidden="true">ॐ</div>
            <h3 className="guest-cta-title">Save Your Journey</h3>
            <p className="guest-cta-desc">Sign in to keep your conversations, unlock memory, and continue your spiritual path across devices.</p>
            <motion.button
              className="guest-cta-google-btn"
              onClick={() => onGuestSignIn && onGuestSignIn()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </motion.button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">
            <Icon name="chat" size={32} />
            <p>No conversations yet</p>
            <motion.button
              className="rust-button compact-button"
              onClick={onNewChat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start a new conversation
            </motion.button>
          </div>
        ) : (
          <nav className="sidebar-nav" aria-label="Conversation history">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="conversation-list"
                  key="conv-list"
                  variants={listStagger}
                  initial="hidden"
                  animate="visible"
                >
                  {conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      className="conversation-item-wrapper"
                      variants={listItem}
                    >
                      <button
                        className="conversation-item"
                        onClick={() => onSelectConversation(conversation)}
                      >
                        <div className="conversation-info">
                          <Icon name="message-square" size={17} />
                          <div className="conversation-details">
                            <span className="conversation-title">
                              {conversation.title || 'Untitled conversation'}
                            </span>
                            <span className="conversation-time">
                              {formatDate(conversation.updatedAt || conversation.createdAt)}
                            </span>
                          </div>
                        </div>
                      </button>
                      <button
                        className="icon-button conversation-delete"
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        aria-label="Delete conversation"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        )}

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user?.email?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <strong title={user?.email || ''}>
                {user?.displayName || user?.email || 'Devotee'}
              </strong>
              <small>{user?.uid === 'devotee_local' ? 'Guest mode' : 'Signed in'}</small>
            </div>
          </div>
          {isGuest ? (
            <motion.button
              className="logout-button"
              onClick={() => { onClose(); onGuestSignIn && onGuestSignIn(); }}
              aria-label="Sign in"
              title="Sign in with Google"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: '#4285F4', borderColor: 'rgba(66, 133, 244, 0.35)' }}
            >
              <Icon name="login" size={15} />
              <span>Sign in</span>
            </motion.button>
          ) : onLogout && (
            <motion.button
              className="logout-button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon name="logout" size={15} />
              <span>Sign out</span>
            </motion.button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
