import React, { useState, useEffect } from 'react';
import socket from './socket';
import Auth from './components/Auth';
import ChatContainer from './components/ChatContainer';

export default function App() {
  const [myUsername, setMyUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing session stored in sessionStorage on page reload
  useEffect(() => {
    const savedUser = sessionStorage.getItem('username');
    if (savedUser) {
      setMyUsername(savedUser);
      setIsLoggedIn(true);
      socket.connect();
    }
  }, []);

  // Invoked after successful auth API check to establish session and connect socket
  const handleLoginSuccess = (username) => {
    setMyUsername(username);
    setIsLoggedIn(true);
    sessionStorage.setItem('username', username);
    socket.connect();
  };

  // Wipes all application session, clears sessionStorage, and disconnects socket
  const handleLogout = () => {
    sessionStorage.removeItem('username');
    setMyUsername('');
    setIsLoggedIn(false);
    socket.disconnect();
  };

  return (
    <div>
      {!isLoggedIn ? (
        <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ChatContainer
          myUsername={myUsername}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}
