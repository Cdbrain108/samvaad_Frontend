import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserConversations, deleteConversation } from '../services/firebase';
import Icon from './Icon';

export default function ChatHistory({ user, conversations = [], isOpen = false, onClose, onSelectConversation, onNewChat, onDeleteConversation }) {
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    const result = await deleteConversation(user.uid, conversationId);
    if (!result.error) {
      if (onDeleteConversation) {
        onDeleteConversation(conversationId);
      }
    } else {
      alert('Failed to delete conversation: ' + result.error);
    }
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
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Icon name="chat" size={20} />
            <span>Conversations</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              className="icon-button"
              onClick={onNewChat}
              aria-label="New conversation"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon name="plus" size={18} />
            </motion.button>
            <button className="icon-button mobile-only" onClick={onClose} aria-label="Close menu">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {conversations.length === 0 ? (
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
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <strong>{user?.email || 'User'}</strong>
              <small>Signed in</small>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
