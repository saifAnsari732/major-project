import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.split('/api')[0] || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from socket server');
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Chat event handlers
export const joinConversation = (conversationId) => {
  if (socket) {
    socket.emit('joinConversation', conversationId);
  }
};

export const leaveConversation = (conversationId) => {
  if (socket) {
    socket.emit('leaveConversation', conversationId);
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('sendMessage', data);
  }
};

export const sendTyping = (conversationId, userName) => {
  if (socket) {
    socket.emit('typing', { conversationId, userName });
  }
};

export const sendStopTyping = (conversationId) => {
  if (socket) {
    socket.emit('stopTyping', conversationId);
  }
};

export const markAsRead = (conversationId, messageIds) => {
  if (socket) {
    socket.emit('markAsRead', { conversationId, messageIds });
  }
};

// Event listeners
export const onMessageReceived = (callback) => {
  if (socket) {
    // Remove old listener to prevent duplicates
    socket.off('messageReceived');
    // Add new listener
    socket.on('messageReceived', callback);
  }
};

export const onMessageNotification = (callback) => {
  if (socket) {
    socket.on('newMessageNotification', callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('userTyping', callback);
  }
};

export const onUserStoppedTyping = (callback) => {
  if (socket) {
    socket.on('userStoppedTyping', callback);
  }
};

export const onMessagesRead = (callback) => {
  if (socket) {
    socket.on('messagesRead', callback);
  }
};

export const onUserJoined = (callback) => {
  if (socket) {
    socket.on('userJoined', callback);
  }
};

export const onUserLeft = (callback) => {
  if (socket) {
    socket.on('userLeft', callback);
  }
};

export const onUsersOnline = (callback) => {
  if (socket) {
    socket.on('usersOnline', callback);
  }
};

export const onUserOffline = (callback) => {
  if (socket) {
    socket.on('userOffline', callback);
  }
};

export const onNewMessageNotification = (callback) => {
  if (socket) {
    socket.off('newMessageNotification');
    socket.on('newMessageNotification', callback);
  }
};

// Remove listeners
export const offMessageReceived = () => {
  if (socket) {
    socket.off('messageReceived');
  }
};

export const offUserTyping = () => {
  if (socket) {
    socket.off('userTyping');
  }
};

export const offUserStoppedTyping = () => {
  if (socket) {
    socket.off('userStoppedTyping');
  }
};
