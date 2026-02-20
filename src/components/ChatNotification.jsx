import React, { useCallback, useEffect } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatNotification.css';

const NameAvatar = ({ name = '', size = 36 }) => {
  const firstLetter = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const colors = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#a18cd1'];
  const colorIndex = name
    ? name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length
    : 0;
  const bg = colors[colorIndex];

  return (
    <div style={{
      width: size, height: size, minWidth: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: '700', color: '#fff',
      userSelect: 'none', flexShrink: 0
    }}>
      {firstLetter}
    </div>
  );
};

const ChatNotification = () => {
  const navigate = useNavigate();
  const { unreadCount, notifications, setNotifications } = useChatContext();
  const [showNotifications, setShowNotifications] = React.useState(false);

  // ✅ New message aane par auto popup open karo
  useEffect(() => {
    if (notifications.length > 0) {
      setShowNotifications(true);
    }
  }, [notifications.length]);

  // ✅ Bahar click karne par popup band karo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.chat-notification-widget') && 
          !e.target.closest('.notifications-overlay')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenChat = () => {
    navigate('/chat');
    setShowNotifications(false);
    setNotifications([]);
  };

  const handleDismissNotification = useCallback((index) => {
    setNotifications((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setShowNotifications(false);
      return updated;
    });
  }, [setNotifications]);

  return (
    <>
      {/* ✅ Bell Button */}
      <div className="chat-notification-widget">
        <button
          className="chat-notification-btn"
          onClick={() => setShowNotifications((p) => !p)}
          title="Messages"
        >
          <MessageSquare size={20} />
          {(unreadCount > 0 || notifications.length > 0) && (
            <span className="notification-badge">
              {notifications.length > 0 ? notifications.length : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ✅ Center Popup — Portal style overlay */}
      {showNotifications && (
        <div className="notifications-overlay">
          <div className="notifications-modal">
            {/* Header */}
            <div className="notifications-header">
              <div className="notifications-header-left">
                <Bell size={18} color="white" />
                <h3>New Messages</h3>
              </div>
              <button className="close-btn" onClick={() => setShowNotifications(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="notifications-content">
              {notifications.length === 0 ? (
                <p className="empty-notifications">No new messages</p>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="notification-item"
                    onClick={handleOpenChat}
                  >
                    <NameAvatar name={notification.senderName} size={42} />

                    <div className="notification-info">
                      <p className="notification-sender">{notification.senderName}</p>
                      <p className="notification-message">
                        {notification.message?.length > 50
                          ? notification.message.substring(0, 50) + '...'
                          : notification.message}
                      </p>
                      <p className="notification-time">
                        {new Date(notification.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <button
                      className="dismiss-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissNotification(index);
                      }}
                      title="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="notifications-footer">
              <button className="view-all-btn" onClick={handleOpenChat}>
                💬 Open Chat
              </button>
              {notifications.length > 0 && (
                <button
                  className="clear-all-btn"
                  onClick={() => {
                    setNotifications([]);
                    setShowNotifications(false);
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatNotification;