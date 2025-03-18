import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { doSignInWithEmailAndPassword } from '../../backend/config/auth';
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
        
        // Check if there's a Stripe onboarding URL in sessionStorage
        const onboardingUrl = sessionStorage.getItem('stripeOnboardingUrl');
        if (onboardingUrl) {
          // Give the user option to complete Stripe onboarding
          if (window.confirm('You have a pending Stripe account setup. Would you like to complete it now?')) {
            window.location.href = onboardingUrl;
            sessionStorage.removeItem('stripeOnboardingUrl');
            return; // Stop execution since we're redirecting
          } else {
            // Clear the URL if user doesn't want to complete onboarding now
            sessionStorage.removeItem('stripeOnboardingUrl');
          }
        }
        
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