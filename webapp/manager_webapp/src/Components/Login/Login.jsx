import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { FcGoogle } from "react-icons/fc";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../backend/config/auth';
import { useAuth } from '../../backend/config/contexts/authContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        navigate('/dashboard');
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  if (userLoggedIn) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    <div className="wrapper">
      <header className="app-header">
        <h1>SwiftParker Manager</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="input-box">
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button
          type="submit"
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing In...' : 'Login'}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="google-signin"
          disabled={isSigningIn}
        >
          <FcGoogle className="google-icon" />
          {isSigningIn ? 'Signing In...' : 'Continue with Google'}
        </button>

        <div className="register-link">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-indigo-600 hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;