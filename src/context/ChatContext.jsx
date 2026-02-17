import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  onMessageReceived,
  onMessageNotification,
  offMessageReceived,
  onUserTyping,
  onUserStoppedTyping,
  offUserTyping,
  offUserStoppedTyping,
  onMessagesRead,
  onNewMessageNotification
} from '../services/socketService';
import { useAuth } from './AuthContext';
import api from '../utils/api'; // ✅ FIX: Use shared api utility (has correct baseURL with /api prefix)

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
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

  // Refs to avoid stale closures in socket callbacks
  const currentConversationRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Initialize socket when user logs in
  useEffect(() => {
    if (user && token) {
      initializeSocket(token);
      fetchConversations();
      fetchUnreadCount();

      return () => {
        disconnectSocket();
      };
    }
  }, [user, token]);

  // ✅ FIX: Use api utility instead of raw axios — no more URL mismatch
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data.conversations || []);
      console.log('✅ Fetched conversations:', response.data.conversations);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Use api utility — was using raw axios hitting wrong URL (missing /api prefix)
  const fetchChatHistory = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/history/${conversationId}`);
      const fetchedMessages = response.data.messages || [];
      setMessages(fetchedMessages);
      console.log(`✅ Fetched ${fetchedMessages.length} messages for:`, conversationId);
      setCurrentConversation(conversationId);
      joinConversation(conversationId);
    } catch (error) {
      console.log('ℹ️ No history found, starting fresh conversation:', conversationId);
      setMessages([]);
      setCurrentConversation(conversationId);
      joinConversation(conversationId);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Use api utility
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/chat/unread-count');
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error.response?.data || error.message);
    }
  }, []);

  // ✅ FIX: Use api utility
  const searchUsers = useCallback(async (query) => {
    try {
      const response = await api.get('/chat/search/users', { params: { query } });
      return response.data.users || [];
    } catch (error) {
      console.error('❌ Error searching users:', error.response?.data || error.message);
      return [];
    }
  }, []);

  // CORE: Handle incoming messages for BOTH sender and receiver
  useEffect(() => {
    const handleMessageReceived = (message) => {
      const activeChatId = currentConversationRef.current;
      const currentMessages = messagesRef.current;

      if (activeChatId && message.conversationId === activeChatId) {
        const realMessageExists = currentMessages.some(
          (msg) => msg._id === message._id && !msg._id?.startsWith('temp-')
        );

        if (realMessageExists) return;

        const matchingTempIndex = currentMessages.findIndex(
          (msg) =>
            msg._id?.startsWith('temp-') &&
            msg.senderId?.toString() === message.senderId?.toString() &&
            msg.message === message.message
        );

        if (matchingTempIndex !== -1) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[matchingTempIndex] = { ...message, isRead: true };
            return updated;
          });
        } else {
          setMessages((prev) => [...prev, { ...message, isRead: true }]);
        }
      } else {
        setNotifications((prev) => [message, ...prev]);
        fetchUnreadCount();
      }
    };

    onMessageReceived(handleMessageReceived);
    return () => {
      offMessageReceived();
    };
  }, [fetchUnreadCount]);

  // Handle new message notifications (badge count)
  useEffect(() => {
    const handleNewMessageNotification = (notification) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev]);
    };

    onNewMessageNotification(handleNewMessageNotification);
    return () => {};
  }, []);

  // Handle typing indicators
  useEffect(() => {
    const handleUserTyping = (data) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.userName }));
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    };

    onUserTyping(handleUserTyping);
    onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      offUserTyping();
      offUserStoppedTyping();
    };
  }, []);

  // Handle read receipts
  useEffect(() => {
    const handleMessagesRead = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    };

    onMessagesRead(handleMessagesRead);
    return () => {};
  }, []);

  // Listen for openChat event from Profile page
  useEffect(() => {
    const handleOpenChat = (event) => {
      const { conversationId } = event.detail;
      if (currentConversationRef.current) {
        leaveConversation(currentConversationRef.current);
      }
      fetchChatHistory(conversationId);
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [fetchChatHistory]);

  // Switch conversation
  const switchConversation = useCallback((conversationId) => {
    if (currentConversationRef.current) {
      leaveConversation(currentConversationRef.current);
    }
    setReplyTo(null);
    fetchChatHistory(conversationId);
  }, [fetchChatHistory]);

  // Close conversation
  const closeConversation = useCallback(() => {
    if (currentConversationRef.current) {
      leaveConversation(currentConversationRef.current);
    }
    setCurrentConversation(null);
    setMessages([]);
    setTypingUsers({});
    setReplyTo(null);
  }, []);

  const value = {
    conversations,
    currentConversation,
    messages,
    setMessages,
    typingUsers,
    unreadCount,
    loading,
    onlineUsers,
    notifications,
    replyTo,
    setReplyTo,
    fetchConversations,
    fetchChatHistory,
    fetchUnreadCount,
    searchUsers,
    switchConversation,
    closeConversation,
    setNotifications
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};