import React from 'react';

export default function ChatHeader({
  myUsername, onlineUsers, currentTarget, onSelectUser, unreadCounts, onLogout, notifications = []
}) {
  const otherUsers = onlineUsers.filter((u) => u !== myUsername);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Logged in as:</strong> <span id="my-username">{myUsername}</span>
        </div>
        <button id="logout-btn" onClick={onLogout} style={{ padding: '0.25rem 0.5rem' }}>
          Logout
        </button>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <strong>Online Users (Click to chat):</strong>
        <span id="users-list">
          {otherUsers.length === 0 ? (
            <em> No other users online</em>
          ) : (
            otherUsers.map((user) => {
              const unread = unreadCounts[user] || 0;
              const isActive = user === currentTarget;
              return (
                <span key={user}>
                  {' '}
                  <button
                    onClick={() => onSelectUser(user)}
                    style={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      backgroundColor: isActive ? '#ddd' : undefined
                    }}
                  >
                    {unread > 0 ? `${user} (${unread})` : user}
                  </button>
                </span>
              );
            })
          )}
        </span>
      </div>

      {/* Polling Notifications Banner */}
      {notifications.length > 0 && (
        <div style={{
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          padding: '0.5rem',
          borderRadius: '4px',
          margin: '0.5rem 0'
        }}>
          <strong>Polling Notification System:</strong> You have {notifications.length} message(s) in history (HTTP Polled).
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#1890ff' }}>
              View last 3 polled messages
            </summary>
            <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
              {notifications.slice(-3).map((n, i) => (
                <li key={i}>
                  [{n.time || n.timestamp}] <strong>{n.sender}</strong>: {n.text || 'Sent an attachment'}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
