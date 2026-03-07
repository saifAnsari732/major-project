import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Loader, Trash2, Reply, CornerUpLeft } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { sendMessage, sendTyping, sendStopTyping, getSocket } from '../services/socketService';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/Chat.css';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NameAvatar = ({ name = '', size = 40, className = '' }) => {
  const firstLetter = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#a18cd1', '#fbc2eb'
  ];
  const colorIndex = name
    ? name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length
    : 0;
  const bg = colors[colorIndex];
  return (
    <div
      className={`name-avatar ${className}`}
      style={{
        width: size, height: size, minWidth: size, minHeight: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: '700', color: '#fff',
        boxShadow: `0 3px 10px ${bg}55`,
        userSelect: 'none', letterSpacing: '0.5px'
      }}
    >
      {firstLetter}
    </div>
  );
};

// ✅ THE ROOT CAUSE FIX:
// Backend (chatController.js) always sorts IDs before saving:
//   const ids = [senderId, recipientId].sort();
//   const conversationId = `${ids[0]}-${ids[1]}`;
//
// Frontend was NOT sorting → joined wrong socket room → messageReceived never fired.
// This helper ensures frontend always generates the same conversationId as backend.
const buildConversationId = (idA, idB) =>
  [idA.toString(), idB.toString()].sort().join('-');

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const userIdFromProfile = searchParams.get('userId');

  const {
    currentConversation,
    messages,
    setMessages,
    typingUsers,
    loading,
    switchConversation,
    closeConversation,
    replyTo,
    setReplyTo
  } = useChatContext();

  const [messageInput, setMessageInput] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(userIdFromProfile || null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await api.get('/chat/users');
        setAllUsers(response.data?.users || []);
      } catch (error) {
        toast.error('Failed to load users');
        setAllUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  // Sync selectedUserId when notification opens a chat
  useEffect(() => {
    const handleOpenChatEvent = (event) => {
      const { userId } = event.detail;
      if (userId) setSelectedUserId(userId);
    };
    window.addEventListener('openChat', handleOpenChatEvent);
    return () => window.removeEventListener('openChat', handleOpenChatEvent);
  }, []);
  // ✅ DIRECT SOCKET LISTENER — bypasses ChatContext, always fresh
  // This is the guaranteed fix: listen on raw socket directly in Chat component
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg) => {
      if (!currentConversation) return;
      const normalize = (id) => id?.split('-').sort().join('-');
      const isSame = normalize(currentConversation) === normalize(msg.conversationId);
      if (!isSame) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id && !m._id?.startsWith('temp-'))) return prev;
        const ti = prev.findIndex(
          (m) => m._id?.startsWith('temp-') &&
            m.senderId?.toString() === msg.senderId?.toString() &&
            m.message === msg.message
        );
        if (ti !== -1) { const u = [...prev]; u[ti] = { ...msg, isRead: true }; return u; }
        return [...prev, { ...msg, isRead: true }];
      });
    };

    socket.off('messageReceived', handler);
    socket.on('messageReceived', handler);
    return () => socket.off('messageReceived', handler);
  }, [currentConversation, setMessages]);

  const handleMessageInput = (e) => {
    setMessageInput(e.target.value);
    if (currentConversation && e.target.value.trim()) {
      sendTyping(currentConversation, user?.name || 'Someone');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendStopTyping(currentConversation), 3000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) { toast.error('Message cannot be empty'); return; }
    if (!currentConversation || !selectedUserId) { toast.error('Select a user first'); return; }

    const selectedUser = allUsers.find((u) => u._id === selectedUserId);
    if (!selectedUser) { toast.error('User not found'); return; }

    const userId = user?._id;
    const userName = user?.name || 'You';
    const messageToSend = messageInput.trim();
    const replyContext = replyTo
      ? { replyTo: { _id: replyTo._id, message: replyTo.message, senderName: replyTo.senderName } }
      : {};

    // ✅ FIXED: sorted conversationId matches backend exactly
    const conversationId = buildConversationId(userId, selectedUserId);

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      conversationId,
      senderId: userId,
      senderName: userName,
      recipientId: selectedUserId,
      recipientName: selectedUser.name,
      message: messageToSend,
      messageType: 'text',
      timestamp: new Date(),
      isRead: false,
      ...replyContext
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageInput('');
    setReplyTo(null);
    sendStopTyping(currentConversation);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // ✅ FIXED: socket gets correct sorted conversationId → backend emits to right room
    sendMessage({
      conversationId,
      recipientId: selectedUserId,
      recipientName: selectedUser.name,
      message: messageToSend,
      messageType: 'text',
      ...replyContext
    });

    try {
      await api.post('/chat/send', {
        recipientId: selectedUserId,
        message: messageToSend,
        messageType: 'text',
        ...replyContext
      });
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  };

  // ✅ FIXED: sorted conversationId → user joins correct socket room
  const handleStartChat = useCallback((selectedUser) => {
    const userId = user?._id;
    if (!userId) { toast.error('User not logged in'); return; }
    const conversationId = buildConversationId(userId, selectedUser._id);
    setSelectedUserId(selectedUser._id);
    switchConversation(conversationId);
  }, [switchConversation, user]);

  useEffect(() => {
    if (userIdFromProfile && allUsers.length > 0 && !autoOpenedRef.current) {
      const found = allUsers.find((u) => u._id === userIdFromProfile);
      if (found) { autoOpenedRef.current = true; handleStartChat(found); }
    }
  }, [userIdFromProfile, allUsers, handleStartChat]);

  const handleDeleteMessage = async (messageId) => {
    try {
      setDeletingMessageId(messageId);
      const response = await api.delete(`/chat/message/${messageId}`);
      if (response.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success('Message deleted ✅');
      }
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleClearAllMessages = async () => {
    if (!window.confirm('Delete all messages in this conversation? This cannot be undone.')) return;
    try {
      const response = await api.delete(`/chat/clear/${currentConversation}`);
      if (response.data.success) { setMessages([]); toast.success('All messages cleared ✅'); }
    } catch (error) {
      toast.error('Failed to clear messages');
    }
  };

  const currentRecipient = allUsers.find((u) => u._id === selectedUserId) || null;
  const currentUserId = user?._id;
  const currentUserName = user?.name || 'You';

  return (
    <div className="chat-container">
      <div className="chat-area">

        {/* ══ TOP FIXED: Horizontal scrollable user list ══ */}
        <div className="chat-users-topbar">
          {usersLoading ? (
            <div className="topbar-loading">
              <Loader size={15} className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="topbar-loading"><span>No users found</span></div>
          ) : (
            allUsers.map((u) => (
              <div
                key={u._id}
                className={`topbar-user ${selectedUserId === u._id ? 'active' : ''}`}
                onClick={() => handleStartChat(u)}
              >
                <div className="topbar-avatar-wrap">
                  <NameAvatar name={u.name} size={46} />
                  {selectedUserId === u._id && <span className="topbar-active-dot" />}
                </div>
                <span className="topbar-user-name">{u.name.split(' ')[0]}</span>
              </div>
            ))
          )}
        </div>

        {currentConversation ? (
          <>
            {/* ══ CHAT HEADER ══ */}
            <div className="chat-area-header">
              <div className="recipient-info">
                {currentRecipient ? (
                  <>
                    <NameAvatar name={currentRecipient.name} size={38} />
                    <div style={{ marginLeft: 10 }}>
                      <p className="recipient-name">{currentRecipient.name}</p>
                      <p className="recipient-status">Active now</p>
                    </div>
                  </>
                ) : (
                  <p className="recipient-name">Loading...</p>
                )}
              </div>
              <div className="chat-header-actions">
                {messages.length > 0 && (
                  <button className="clear-chat-btn" onClick={handleClearAllMessages} title="Clear all">
                    <Trash2 size={18} />
                  </button>
                )}
                <button className="close-chat-btn" onClick={closeConversation}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ══ MIDDLE SCROLLABLE: Messages ══ */}
            <div className="messages-container">
              {loading ? (
                <div className="no-messages">
                  <Loader size={22} className="animate-spin" />
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation! 👋</p>
                </div>
              ) : (
                messages.map((message, idx) => {
                  const isSent = message.senderId?.toString() === currentUserId?.toString();
                  const senderName = isSent
                    ? (message.senderName || currentUserName)
                    : (message.senderName || currentRecipient?.name || 'User');

                  return (
                    <div
                      key={message._id || idx}
                      className={`message ${isSent ? 'sent' : 'received'}`}
                      onMouseEnter={() => setHoveredMessageId(message._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      {!isSent && <NameAvatar name={senderName} size={30} className="message-avatar" />}

                      <div className="message-wrapper">
                        {message.replyTo && (
                          <div className={`reply-preview ${isSent ? 'reply-sent' : 'reply-received'}`}>
                            <CornerUpLeft size={11} style={{ marginRight: 4, flexShrink: 0 }} />
                            <span className="reply-sender">{message.replyTo.senderName}</span>
                            <span className="reply-text">{message.replyTo.message}</span>
                          </div>
                        )}
                        <div className="message-bubble">
                          {!isSent && <span className="message-sender-name">{senderName}</span>}
                          <p>{message.message}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSent && <span className="read-status">{message.isRead ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>

                        {hoveredMessageId === message._id && (
                          <div className={`message-actions ${isSent ? 'actions-sent' : 'actions-received'}`}>
                            <button
                              className="action-btn reply-btn"
                              onClick={() => setReplyTo({
                                _id: message._id,
                                message: message.message,
                                senderName: isSent ? 'You' : senderName
                              })}
                              title="Reply"
                            >
                              <Reply size={13} />
                            </button>
                            {isSent && !message._id?.startsWith('temp-') && (
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteMessage(message._id)}
                                disabled={deletingMessageId === message._id}
                                title="Delete"
                              >
                                {deletingMessageId === message._id
                                  ? <Loader size={13} className="animate-spin" />
                                  : <Trash2 size={13} />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {isSent && <NameAvatar name={currentUserName} size={30} className="message-avatar" />}
                    </div>
                  );
                })
              )}

              {Object.keys(typingUsers).length > 0 && (
                <div className="typing-indicator">
                  <NameAvatar name={Object.values(typingUsers)[0]} size={26} />
                  <div className="typing-bubble"><span /><span /><span /></div>
                  <p>{Object.values(typingUsers).join(', ')} is typing...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ══ BOTTOM FIXED: Reply bar + Input ══ */}
            <div className="chat-bottom-fixed">
              {replyTo && (
                <div className="reply-bar">
                  <CornerUpLeft size={14} className="reply-bar-icon" />
                  <div className="reply-bar-content">
                    <span className="reply-bar-name">Replying to <strong>{replyTo.senderName}</strong></span>
                    <span className="reply-bar-msg">{replyTo.message}</span>
                  </div>
                  <button className="reply-bar-cancel" onClick={() => setReplyTo(null)}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={replyTo ? `Reply to ${replyTo.senderName}...` : 'Type a message...'}
                  value={messageInput}
                  onChange={handleMessageInput}
                  className="message-input"
                  autoComplete="off"
                />
                <button type="submit" className="send-btn" aria-label="Send">
                  <Send size={20} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <h3>No conversation selected</h3>
            <p>Pick a user above to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;