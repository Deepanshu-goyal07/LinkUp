import React, { useState } from 'react';

export default function ChatHeader({
  myUsername,
  onlineUsers,
  currentTarget,
  onSelectUser,
  unreadCounts,
  onLogout,
  notifications = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);

  const otherUsers = onlineUsers.filter((u) => u !== myUsername);
  const filteredUsers = otherUsers.filter((u) =>
    u.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generates a distinct gradient background based on username string hash code
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #f43f5e 0%, #fda4af 100%)', // Rose
      'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)', // Blue
      'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)', // Emerald
      'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)', // Violet
      'linear-gradient(135deg, #f59e0b 0%, #fde68a 100%)', // Amber
      'linear-gradient(135deg, #ec4899 0%, #fbcfe8 100%)', // Pink
      'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)'  // Cyan
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="chat-sidebar">
      {/* Sidebar Top: Brand & Logged In User */}
      <div className="sidebar-header">
        <div className="brand-section">
          <div className="brand-logo-text">LinkUp</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="pulse-indicator"></span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-online)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-info">
            <div className="avatar" style={{ background: getAvatarColor(myUsername) }}>
              {getInitials(myUsername)}
            </div>
            <div className="my-username-label" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>User Session</span>
              <span id="my-username" style={{ fontWeight: 700 }}>{myUsername}</span>
            </div>
          </div>

          <button id="logout-btn" onClick={onLogout} title="Exit Application">
            {/* SVG Logout Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* User Search Bar */}
      <div className="search-container">
        <div className="search-box-wrapper">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Online Users List */}
      <div className="sidebar-users-section">
        <div className="users-list-title">Online Chats</div>
        <span id="users-list">
          {filteredUsers.length === 0 ? (
            <div className="no-users-msg">
              {otherUsers.length === 0 ? 'No other users online' : 'No matches found'}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const unread = unreadCounts[user] || 0;
              const isActive = user === currentTarget;
              return (
                <button
                  key={user}
                  onClick={() => onSelectUser(user)}
                  className={`user-row-btn ${isActive ? 'active' : ''}`}
                >
                  <div className="user-row-left">
                    <div className="user-row-avatar" style={{ background: getAvatarColor(user) }}>
                      {getInitials(user)}
                    </div>
                    <div className="user-row-name-status">
                      <span className="user-row-name">{user}</span>
                      <span className="user-row-status-text">
                        <span className="status-dot"></span>
                        online
                      </span>
                    </div>
                  </div>
                  <div className="user-row-right">
                    {unread > 0 && (
                      <span className="unread-badge">{unread}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </span>
      </div>

      {/* Telemetry Polling Notifications Dashboard at bottom */}
      <div className="polling-monitor-container">
        <div className="polling-monitor-header" onClick={() => setIsLogsExpanded(!isLogsExpanded)}>
          <div className="polling-monitor-title">
            <span className="pulse-indicator"></span>
            HTTP Polling Monitor
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {isLogsExpanded ? 'Close Logs ▲' : `Logs (${notifications.length}) ▼`}
          </span>
        </div>

        {isLogsExpanded && (
          <div className="polling-details">
            <div className="polling-status-desc">
              <span>Telemetry Interval: 5s</span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Active</span>
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>
                No polled records captured yet.
              </div>
            ) : (
              <ul className="polling-logs-list">
                {notifications.slice(-3).reverse().map((n, i) => {
                  const logTime = n.time || (n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A');
                  return (
                    <li key={i} className="polling-log-item">
                      [{logTime}] <strong>{n.sender}</strong>: {n.text || 'Sent attachment'}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
