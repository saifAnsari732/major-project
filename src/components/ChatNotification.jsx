import React, { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/ChatNotification.css';

const ChatNotification = () => {
  const navigate = useNavigate();
  const { unreadCount, notifications, setNotifications } = useChatContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleOpenChat = () => {
    navigate('/chat');
    setShowNotifications(false);
  };

  const handleDismissNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat-notification-widget">
      <button
        className="chat-notification-btn"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Messages"
      >
        <MessageSquare size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Messages</h3>
            <button
              className="close-btn"
              onClick={() => setShowNotifications(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="notifications-content">
            {notifications.length === 0 ? (
              <p className="empty-notifications">No new messages</p>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <img
                    src={notification.senderImage}
                    alt={notification.senderName}
                    className="notification-avatar"
                  />
                  <div className="notification-info">
                    <p className="notification-sender">
                      {notification.senderName}
                    </p>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    className="dismiss-btn"
                    onClick={() => handleDismissNotification(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <button className="view-all-btn" onClick={handleOpenChat}>
              View All Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatNotification;
