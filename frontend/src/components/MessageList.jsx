import React from 'react';

const isDev = window.location.port === '5173';
const API_BASE_URL = isDev ? 'http://localhost:5000' : '';

export default function MessageList({
  currentTarget,
  messages,
  messagesEndRef,
  onBack,
  myUsername
}) {
  // Generates avatar background color gradient based on name hash code
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #f43f5e 0%, #fda4af 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)',
      'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #fde68a 100%)',
      'linear-gradient(135deg, #ec4899 0%, #fbcfe8 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)'
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Absolute/Sticky Chat Header bar */}
      <div className="chat-target-header">
        <div className="chat-target-left">
          <button className="chat-back-btn" onClick={onBack} title="Back to sidebar">
            {/* SVG Back Arrow */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <div className="chat-target-info">
            <div className="avatar" style={{ background: getAvatarColor(currentTarget), width: '36px', height: '36px', fontSize: '0.85rem' }}>
              {getInitials(currentTarget)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span id="chat-header" className="chat-target-name">{currentTarget}</span>
              <span className="chat-target-status">
                <span className="status-dot" style={{ width: '6px', height: '6px', marginRight: '0.25rem' }}></span>
                active conversation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div className="messages-pane">
        <ul id="messages">
          {messages.map((msg, index) => {
            if (msg.type === 'system') {
              return (
                <li key={index} className="system-msg">
                  {msg.text}
                </li>
              );
            } else {
              const senderName = msg.sender || msg.username || 'Unknown';
              const isSelf = myUsername && senderName.toLowerCase() === myUsername.toLowerCase();
              
              let formattedTime = msg.time;
              if (msg.timestamp) {
                formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }

              return (
                <li key={index} className={`message-wrapper ${isSelf ? 'self' : 'other'}`}>
                  <div className="message-meta">
                    {!isSelf && <strong>{senderName}</strong>}
                    <span>{formattedTime}</span>
                  </div>
                  
                  <div className="message-bubble">
                    {msg.text && <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.text}</div>}
                    
                    {msg.files && msg.files.length > 0 && (
                      <div className="msg-attachments-grid">
                        {msg.files.map((file, fileIdx) => {
                          const fileUrl = `${API_BASE_URL}${file.url}`;
                          const isImage = file.mimetype && file.mimetype.startsWith('image/');
                          
                          return (
                            <div key={fileIdx} className="shared-file">
                              {isImage ? (
                                <div>
                                  <div className="shared-file-img-wrapper">
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                      <img 
                                        src={fileUrl} 
                                        alt={file.originalname} 
                                        className="shared-file-img"
                                      />
                                    </a>
                                  </div>
                                  <div className="shared-file-info">
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                      {file.originalname}
                                    </span>
                                    <span>({(file.size / 1024).toFixed(1)} KB)</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="shared-file-doc">
                                  <div className="shared-file-doc-left">
                                    <span style={{ fontSize: '1.2rem' }}>📄</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                      <span className="shared-file-doc-name" title={file.originalname}>{file.originalname}</span>
                                      <span className="shared-file-doc-size">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                  </div>
                                  <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    download={file.originalname} 
                                    className="shared-file-doc-dl"
                                  >
                                    Get File
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            }
          })}
          <div ref={messagesEndRef} />
        </ul>
      </div>
    </div>
  );
}
