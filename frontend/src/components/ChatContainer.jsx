import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import Chat from './Chat';

export default function ChatContainer({ myUsername, isLoggedIn, handleLogout }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Track previous count of messages to know if a new one arrived
  const lastNotificationCountRef = useRef(0);

  // Request native browser Notification permission on login
  useEffect(() => {
    if (isLoggedIn && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isLoggedIn]);

  // Beginner-friendly HTTP polling for notifications/messages
  useEffect(() => {
    if (!isLoggedIn || !myUsername) return;

    // Helper function that makes the fetch request
    const fetchNotifications = async () => {
      try {
        const isDev = window.location.port === '5173';
        const url = isDev
          ? `http://localhost:5000/api/notifications?username=${encodeURIComponent(myUsername)}`
          : `/api/notifications?username=${encodeURIComponent(myUsername)}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.notifications) {
            const fetched = data.notifications;

            // If the message count has increased, trigger a browser desktop alert
            if (fetched.length > lastNotificationCountRef.current) {
              const newest = fetched[fetched.length - 1];
              // Only notify if the sender is not the current user
              if (newest && newest.sender !== myUsername) {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`TexTie Polling Alert: ${newest.sender}`, {
                    body: newest.text || 'Sent an attachment',
                  });
                }
              }
            }

            setNotifications(fetched);
            lastNotificationCountRef.current = fetched.length;
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Run fetch once immediately
    fetchNotifications();

    // Set up polling interval to run every 5 seconds (5000 milliseconds)
    const intervalId = setInterval(fetchNotifications, 5000);

    // Return cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [isLoggedIn, myUsername]);

  // Set up socket event listeners and handle real-time events
  useEffect(() => {
    if (!isLoggedIn || !myUsername) return;

    // Triggered upon successful connection to register the user's socket session
    const handleConnect = () => {
      socket.emit('user joined', myUsername);
      if (currentTarget) {
        socket.emit('join room', currentTarget);
      }
    };

    // Triggered when an error packet is sent by the server, logging the user out
    const handleErrorMessage = (msg) => {
      alert(msg);
      handleLogout();
    };

    // Triggered when the server broadcasts the list of all online users
    const handleUpdateUsersList = (users) => {
      setOnlineUsers(users);
    };

    // Triggered when historical messages are retrieved for a 1-to-1 conversation
    const handleRoomHistory = (data) => {
      setCurrentRoom(data.room);
      setMessages(data.history);
      if (data.target) {
        setUnreadCounts((prev) => ({ ...prev, [data.target]: 0 }));
      }
    };

    // Triggered when a new real-time message (system or user) is received
    const handleChatMessage = (msg) => {
      if (msg.type === 'system') {
        setMessages((prev) => [...prev, msg]);
      }
      else if (msg.room === currentRoom) {
        setMessages((prev) => [...prev, msg]);
      }
      else {
        const sender = msg.sender;
        if (sender) {
          setUnreadCounts((prev) => ({
            ...prev,
            [sender]: (prev[sender] || 0) + 1
          }));
        }
      }
    };

    socket.on('connect', handleConnect);
    socket.on('error_message', handleErrorMessage);
    socket.on('update users list', handleUpdateUsersList);
    socket.on('room history', handleRoomHistory);
    socket.on('chat message', handleChatMessage);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('error_message', handleErrorMessage);
      socket.off('update users list', handleUpdateUsersList);
      socket.off('room history', handleRoomHistory);
      socket.off('chat message', handleChatMessage);
    };
  }, [isLoggedIn, myUsername, currentTarget, currentRoom, handleLogout]);

  // Triggered when a user clicks on an online user to join their 1-to-1 chat room
  const handleSelectUser = (targetUser) => {
    setCurrentTarget(targetUser);
    socket.emit('join room', targetUser);
    setUnreadCounts((prev) => ({ ...prev, [targetUser]: 0 }));
  };

  // Emits a private message payload to the server, uploading any attached files first
  const handleSendMessage = async (text, filesToUpload) => {
    if (!currentTarget) return;

    let uploadedFiles = [];
    if (filesToUpload && filesToUpload.length > 0) {
      const formData = new FormData();
      for (const file of filesToUpload) {
        formData.append('files', file);
      }

      try {
        const isDev = window.location.port === '5173';
        const uploadUrl = isDev ? 'http://localhost:5000/api/upload' : '/api/upload';

        const res = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Failed to upload files to server');
        }

        const data = await res.json();
        if (data.success && data.files) {
          uploadedFiles = data.files;
        } else {
          alert('Failed to upload files: ' + (data.error || 'Unknown error'));
          return;
        }
      } catch (err) {
        console.error('File upload error:', err);
        alert('An error occurred during file upload: ' + err.message);
        return;
      }
    }

    if (text.trim() || uploadedFiles.length > 0) {
      socket.emit('private message', {
        target: currentTarget,
        text: text,
        files: uploadedFiles
      });
    }
  };

  return (
    <Chat
      myUsername={myUsername}
      onlineUsers={onlineUsers}
      currentTarget={currentTarget}
      onSelectUser={handleSelectUser}
      messages={messages}
      unreadCounts={unreadCounts}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
      notifications={notifications}
    />
  );
}
