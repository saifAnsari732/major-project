import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  onUserTyping,
  onUserStoppedTyping,
  offUserTyping,
  offUserStoppedTyping,
  onMessagesRead,
} from '../services/socketService';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ChatContext = createContext();
export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  const currentConversationRef = useRef(null);
  const userIdRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => { currentConversationRef.current = currentConversation; }, [currentConversation]);
  useEffect(() => { userIdRef.current = user?._id?.toString(); }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    try { const r = await api.get('/chat/unread-count'); setUnreadCount(r.data.unreadCount || 0); } catch {}
  }, []);

  const fetchConversations = useCallback(async () => {
    try { const r = await api.get('/chat/conversations'); setConversations(r.data.conversations || []); } catch {}
  }, []);

  const fetchChatHistory = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const r = await api.get(`/chat/history/${conversationId}`);
      console.log(r.data);
      setMessages(r.data.messages || []);
      setCurrentConversation(conversationId);
      joinConversation(conversationId);
    } catch {
      setMessages([]);
      setCurrentConversation(conversationId);
      joinConversation(conversationId);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?._id || !token) return;
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }

    const s = initializeSocket(token);
    socketRef.current = s;
    fetchConversations();
    fetchUnreadCount();

    const attach = () => {
      s.off('messageReceived');
      s.on('messageReceived', (msg) => {
        const activeChatId = currentConversationRef.current;
        const myId = userIdRef.current;
        const normalize = (id) => id?.split('-').sort().join('-');

        // ✅ Check if this message belongs to currently open conversation
        const isSame = activeChatId &&
          normalize(activeChatId) === normalize(msg.conversationId);
        const isMyOwn = msg.senderId?.toString() === myId;

        if (isSame) {
          // ✅ Add to current chat immediately
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
        } else if (!isMyOwn) {
          // ✅ Different conversation — show notification
          setNotifications((prev) => {
            if (prev.some((n) => n._id === msg._id)) return prev;
            return [msg, ...prev];
          });
          fetchUnreadCount();
        }
      });
    };

    if (s.connected) attach();
    else s.once('connect', attach);

    s.on('reconnect', () => {
      attach();
      if (currentConversationRef.current) joinConversation(currentConversationRef.current);
    });

    return () => { s.off('messageReceived'); s.off('reconnect'); s.disconnect(); socketRef.current = null; };
  }, [user?._id, token]);

  useEffect(() => {
    onUserTyping((d) => setTypingUsers((p) => ({ ...p, [d.userId]: d.userName })));
    onUserStoppedTyping((d) => setTypingUsers((p) => { const u = { ...p }; delete u[d.userId]; return u; }));
    return () => { offUserTyping(); offUserStoppedTyping(); };
  }, []);

  useEffect(() => {
    onMessagesRead((data) => {
      setMessages((prev) => prev.map((m) => data.messageIds.includes(m._id) ? { ...m, isRead: true } : m));
    });
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (currentConversationRef.current) leaveConversation(currentConversationRef.current);
      fetchChatHistory(e.detail.conversationId);
    };
    window.addEventListener('openChat', h);
    return () => window.removeEventListener('openChat', h);
  }, [fetchChatHistory]);

  const switchConversation = useCallback((id) => {
    if (currentConversationRef.current) leaveConversation(currentConversationRef.current);
    setReplyTo(null);
    fetchChatHistory(id);
  }, [fetchChatHistory]);

  const closeConversation = useCallback(() => {
    if (currentConversationRef.current) leaveConversation(currentConversationRef.current);
    setCurrentConversation(null); setMessages([]); setTypingUsers({}); setReplyTo(null);
  }, []);

  const searchUsers = useCallback(async (q) => {
    try { const r = await api.get('/chat/search/users', { params: { query: q } }); return r.data.users || []; }
    catch { return []; }
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations, currentConversation, setCurrentConversation,
      messages, setMessages, typingUsers, unreadCount, loading,
      onlineUsers, notifications, replyTo, setReplyTo,
      fetchConversations, fetchChatHistory, fetchUnreadCount,
      searchUsers, switchConversation, closeConversation, setNotifications
    }}>
      {children}
    </ChatContext.Provider>
  );
};