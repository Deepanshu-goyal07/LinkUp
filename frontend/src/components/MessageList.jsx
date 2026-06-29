import React from 'react';

const isDev = window.location.port === '5173';
const API_BASE_URL = isDev ? 'http://localhost:5000' : '';

export default function MessageList({
  currentTarget,
  messages,
  messagesEndRef
}) {
  return (
    <div>
      <h3 id="chat-header">
        {currentTarget ? `Chatting with: ${currentTarget}` : 'Select an online user to start chatting'}
      </h3>

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
            let formattedTime = msg.time;
            if (msg.timestamp) {
              formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            return (
              <li key={index} style={{ marginBottom: '0.75rem' }}>
                <strong>{senderName}</strong>{' '}
                <span style={{ fontSize: '0.8rem', color: '#888' }}>({formattedTime})</span>:{' '}
                {msg.text && <span style={{ marginLeft: '0.25rem' }}>{msg.text}</span>}
                
                {msg.files && msg.files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem', paddingLeft: '0.5rem', borderLeft: '2px solid #ccc' }}>
                    {msg.files.map((file, fileIdx) => {
                      const fileUrl = `${API_BASE_URL}${file.url}`;
                      const isImage = file.mimetype && file.mimetype.startsWith('image/');
                      return (
                        <div key={fileIdx} className="shared-file">
                          {isImage ? (
                            <div style={{ marginTop: '0.25rem' }}>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={fileUrl} 
                                  alt={file.originalname} 
                                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ddd', display: 'block', marginBottom: '0.2rem' }} 
                                />
                              </a>
                              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {file.originalname} ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                              📄 <a href={fileUrl} target="_blank" rel="noopener noreferrer" download={file.originalname} style={{ fontWeight: 'bold' }}>
                                {file.originalname}
                              </a>
                              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </ul>
    </div>
  );
}
