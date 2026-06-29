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
    <div id="chat-container">
      <ChatHeader
        myUsername={myUsername}
        onlineUsers={onlineUsers}
        currentTarget={currentTarget}
        onSelectUser={onSelectUser}
        unreadCounts={unreadCounts}
        onLogout={onLogout}
        notifications={notifications}
      />
      
      <MessageList
        currentTarget={currentTarget}
        messages={messages}
        messagesEndRef={messagesEndRef}
      />
      
      <MessageInput
        currentTarget={currentTarget}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
