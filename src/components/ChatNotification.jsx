import React, { useCallback } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatNotification.css';

// ✅ Inline NameAvatar - senderImage की जरूरत नहीं
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

  const handleOpenChat = () => {
    navigate('/chat');
    setShowNotifications(false);
    // ✅ Popup बंद होने पर notifications clear करें
    setNotifications([]);
  };

  const handleDismissNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, [setNotifications]);

  return (
    <div className="chat-notification-widget">
      <button
        className="chat-notification-btn"
        onClick={() => setShowNotifications((p) => !p)}
        title="Messages"
      >
        <MessageSquare size={20} />
        {/* ✅ Badge - unreadCount OR notifications.length जो भी हो */}
        {(unreadCount > 0 || notifications.length > 0) && (
          <span className="notification-badge">
            {notifications.length > 0 ? notifications.length : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Messages</h3>
            <button className="close-btn" onClick={() => setShowNotifications(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="notifications-content">
            {notifications.length === 0 ? (
              <p className="empty-notifications">No new messages</p>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="notification-item"
                  onClick={() => handleOpenChat()} // ✅ click करने पर chat खुले
                  style={{ cursor: 'pointer' }}
                >
                  {/* ✅ img की जगह NameAvatar */}
                  <NameAvatar name={notification.senderName} size={36} />

                  <div className="notification-info">
                    <p className="notification-sender">{notification.senderName}</p>
                    <p className="notification-message">
                      {notification.message?.length > 40
                        ? notification.message.substring(0, 40) + '...'
                        : notification.message}
                    </p>
                  </div>

                  <button
                    className="dismiss-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ parent click रोकें
                      handleDismissNotification(index);
                    }}
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