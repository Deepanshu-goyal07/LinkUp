import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function Chat({
  myUsername,
  onlineUsers,
  currentTarget,
  onSelectUser,
  messages,
  unreadCounts,
  onSendMessage,
  onLogout,
  notifications = []
}) {
  const messagesEndRef = useRef(null);

  // Auto-scrolls the chat window to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div id="chat-container" className={`chat-layout ${currentTarget ? 'mobile-chat-active' : ''}`}>
      <ChatHeader
        myUsername={myUsername}
        onlineUsers={onlineUsers}
        currentTarget={currentTarget}
        onSelectUser={onSelectUser}
        unreadCounts={unreadCounts}
        onLogout={onLogout}
        notifications={notifications}
      />
      
      <div className="chat-main">
        {currentTarget ? (
          <>
            <MessageList
              currentTarget={currentTarget}
              messages={messages}
              messagesEndRef={messagesEndRef}
              onBack={() => onSelectUser(null)}
              myUsername={myUsername}
            />
            
            <MessageInput
              currentTarget={currentTarget}
              onSendMessage={onSendMessage}
            />
          </>
        ) : (
          <div className="empty-chat-state">
            <div className="empty-chat-icon">💬</div>
            <div>
              <h2>Welcome to LinkUp, {myUsername}!</h2>
              <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Select an online user from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
