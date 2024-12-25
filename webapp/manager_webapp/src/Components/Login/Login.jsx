import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUser } from "react-icons/fa";
import { CiLock } from "react-icons/ci";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate authentication for now
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard'); // Redirect to the dashboard
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="wrapper">
    <header className="app-header">
      <h1>SwiftParker Manager App</h1>
    </header>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <div className="input-box">
          <input 
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-box">
          <input 
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <CiLock className="icon" />
        </div>

        <button type="submit">Login</button>

      </form>
    </div>
  );
};

export default Login;
