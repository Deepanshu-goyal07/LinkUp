import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  // Swaps between Login and Sign Up views, resetting state fields and feedback messages
  const handleToggleMode = (e) => {
    e.preventDefault();
    setIsLoginMode(!isLoginMode);
    setMessage('');
    setUsername('');
    setPassword('');
  };

  // Submits credentials to the backend API for verification/creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) return;


    // Detect if we are running on the esbuild dev server port
    const isDev = window.location.port === '5173';
    const baseUrl = isDev ? 'http://localhost:5000' : '';
    const endpoint = `${baseUrl}${isLoginMode ? '/api/login' : '/api/signup'}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (isLoginMode) {
          onLoginSuccess(data.username);
        } else {
          setMessageClass('success-msg');
          setMessage(data.message);
          setIsLoginMode(true);
          setUsername('');
          setPassword('');
        }
      } else {
        setMessageClass('error-msg');
        setMessage(data.message || 'An error occurred');
      }
    } catch (err) {
      console.error('Auth fetch error:', err);
      setMessageClass('error-msg');
      setMessage('Failed to connect to the server');
    }
  };

  return (
    <div id="auth-container">
      <h3>{isLoginMode ? 'Log In' : 'Sign Up'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            id="username-input"
            type="text"
            autoComplete="off"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            id="password-input"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {message && (
          <div id="auth-message" className={messageClass}>
            {message}
          </div>
        )}
        <button type="submit">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <p className="toggle-text">
        <span>{isLoginMode ? "Don't have an account?" : 'Already have an account?'}</span>{' '}
        <a href="#" onClick={handleToggleMode}>
          {isLoginMode ? 'Sign Up' : 'Log In'}
        </a>
      </p>
    </div>
  );
}