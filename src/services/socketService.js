import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.split('/api')[0] || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const joinConversation = (conversationId) => {
  if (socket?.connected) {
    socket.emit('joinConversation', conversationId);
    console.log('📍 joinConversation:', conversationId);
  } else {
    // Wait for connect then join
    socket?.once('connect', () => {
      socket.emit('joinConversation', conversationId);
      console.log('📍 joinConversation (after connect):', conversationId);
    });
  }
};

export const leaveConversation = (id) => { if (socket) socket.emit('leaveConversation', id); };
export const sendMessage = (data) => { if (socket) socket.emit('sendMessage', data); };
export const sendTyping = (conversationId, userName) => { if (socket) socket.emit('typing', { conversationId, userName }); };
export const sendStopTyping = (conversationId) => { if (socket) socket.emit('stopTyping', conversationId); };
export const markAsRead = (conversationId, messageIds) => { if (socket) socket.emit('markAsRead', { conversationId, messageIds }); };

export const onUserTyping = (cb) => { if (socket) { socket.off('userTyping'); socket.on('userTyping', cb); } };
export const onUserStoppedTyping = (cb) => { if (socket) { socket.off('userStoppedTyping'); socket.on('userStoppedTyping', cb); } };
export const onMessagesRead = (cb) => { if (socket) { socket.off('messagesRead'); socket.on('messagesRead', cb); } };
export const onNewMessageNotification = (cb) => { if (socket) { socket.off('newMessageNotification'); socket.on('newMessageNotification', cb); } };
export const offUserTyping = () => { if (socket) socket.off('userTyping'); };
export const offUserStoppedTyping = () => { if (socket) socket.off('userStoppedTyping'); };
export const onMessageReceived = (cb) => { if (socket) { socket.off('messageReceived'); socket.on('messageReceived', cb); } };
export const offMessageReceived = () => { if (socket) socket.off('messageReceived'); };
export const onMessageNotification = (cb) => { if (socket) { socket.off('newMessageNotification'); socket.on('newMessageNotification', cb); } };
export const onUserJoined = (cb) => { if (socket) socket.on('userJoined', cb); };
export const onUserLeft = (cb) => { if (socket) socket.on('userLeft', cb); };
export const onUsersOnline = (cb) => { if (socket) socket.on('usersOnline', cb); };
export const onUserOffline = (cb) => { if (socket) socket.on('userOffline', cb); };