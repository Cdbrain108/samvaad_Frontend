import { useState, useEffect } from 'react';
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

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${conversations.length > 0 ? 'has-conversations' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Icon name="chat" size={20} />
            <span>Conversations</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="icon-button" onClick={onNewChat} aria-label="New conversation">
              <Icon name="plus" size={18} />
            </button>
            <button className="icon-button mobile-only" onClick={onClose} aria-label="Close menu">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

      {conversations.length === 0 ? (
        <div className="sidebar-empty">
          <Icon name="chat" size={32} />
          <p>No conversations yet</p>
          <button className="rust-button compact-button" onClick={onNewChat}>
            Start a new conversation
          </button>
        </div>
      ) : (
        <nav className="sidebar-nav" aria-label="Conversation history">
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="conversation-item-wrapper">
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
              </div>
            ))}
          </div>
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
    </aside>
    </>
  );
}