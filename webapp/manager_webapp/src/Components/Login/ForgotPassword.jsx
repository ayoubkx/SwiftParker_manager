import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { doPasswordReset } from '../../backend/config/auth';
import { FaUser } from "react-icons/fa";
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            await doPasswordReset(email);
            setMessage('Password reset link has been sent to your email');
            setEmail('');
        } catch (error) {
            setError('Failed to reset password: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="wrapper">
            <header className="app-header">
                <h1>SwiftParker Manager App</h1>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Reset Password</h1>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <div className="input-box">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <FaUser className="icon" />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={isSubmitting ? 'button-disabled' : ''}
                >
                    {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="login-link">
                    <Link to="/login" className="back-to-login">
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;