import React, { useState, useEffect } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../backend/config/contexts/authContext'
import { doCreateUserWithEmailAndPassword } from '../../backend/config/auth'
import './Login.css' // Using the same styles as Login

const Register = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    })
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showStripeRedirect, setShowStripeRedirect] = useState(false)
    const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState('')
    const [registrationCompleted, setRegistrationCompleted] = useState(false)

    // Check for Stripe onboarding URL in session storage
    useEffect(() => {
        const onboardingUrl = sessionStorage.getItem('stripeOnboardingUrl')
        if (onboardingUrl) {
            console.log("Found Stripe onboarding URL in session:", onboardingUrl)
            setStripeOnboardingUrl(onboardingUrl)
            setShowStripeRedirect(true)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords don't match")
            return false
        }
        if (formData.password.length < 6) {
            setErrorMessage("Password must be at least 6 characters")
            return false
        }
        return true
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        if (!isRegistering) {
            setIsRegistering(true)
            setErrorMessage('')
            
            try {
                const userData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber
                }
                
                console.log("Starting registration with user data:", { 
                    email: formData.email, 
                    firstName: userData.firstName,
                    lastName: userData.lastName 
                })
                
                // Register the user and get the result
                const regResult = await doCreateUserWithEmailAndPassword(
                    formData.email, 
                    formData.password, 
                    userData
                )
                
                console.log("Registration successful, checking for Stripe onboarding URL")
                
                // Check for onboarding URL in the result or session storage
                let onboardingUrl = regResult.stripeOnboardingUrl
                if (!onboardingUrl) {
                    onboardingUrl = sessionStorage.getItem('stripeOnboardingUrl')
                }
                
                if (onboardingUrl) {
                    console.log("Stripe onboarding URL found, showing redirect screen")
                    setStripeOnboardingUrl(onboardingUrl)
                    setSuccessMessage('Account created successfully! Complete your Stripe Connect onboarding to start accepting payments.')
                    setShowStripeRedirect(true)
                    setRegistrationCompleted(true)
                } else {
                    // This should not happen with the updated auth code that enforces
                    // Stripe setup, but handle it just in case
                    console.error("No Stripe onboarding URL found after successful registration")
                    setErrorMessage('Registration completed but Stripe setup failed. Please contact support.')
                }
            } catch (error) {
                console.error("Registration error:", error)
                setErrorMessage(error.message || 'Registration failed. Please try again.')
            } finally {
                setIsRegistering(false)
            }
        }
    }

    const handleStripeRedirect = () => {
        // Navigate to Stripe onboarding URL
        if (stripeOnboardingUrl) {
            console.log("Redirecting to Stripe onboarding URL:", stripeOnboardingUrl)
            
            // Open in same window
            window.location.href = stripeOnboardingUrl
            
            // Remove the URL from session storage to avoid issues if the user returns
            sessionStorage.removeItem('stripeOnboardingUrl')
        } else {
            console.error("No Stripe onboarding URL available for redirect")
            setErrorMessage("No Stripe onboarding URL available. Please try again later.")
        }
    }

    const skipStripeOnboarding = () => {
        // This function should only be accessible if registration was actually completed
        if (!registrationCompleted) {
            console.error("Attempting to skip onboarding without completed registration")
            setErrorMessage("Registration has not been completed. Please try again.")
            return
        }
        
        // Clear the URL and redirect to dashboard
        sessionStorage.removeItem('stripeOnboardingUrl')
        navigate('/dashboard')
    }
    
    // Important: Only redirect to dashboard if both conditions are met:
    // 1. User is logged in (userLoggedIn is true)
    // 2. We're not showing the Stripe redirect screen
    // 3. Registration has been completed successfully
    if (userLoggedIn && !showStripeRedirect && registrationCompleted) {
        return <Navigate to={'/dashboard'} replace={true} />
    }

    return (
        <div className="wrapper">
            <header className="app-header">
                <h1>SwiftParker Manager</h1>
            </header>
            
            {showStripeRedirect ? (
                <div className="form-container">
                    <div className="stripe-redirect-container">
                        <h2>Set Up Payments</h2>
                        <div className="stripe-info">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                                alt="Stripe" 
                                className="stripe-logo"
                            />
                            <p>We've created a Stripe Connect account for you to receive payments from customers.</p>
                            <p>To complete your registration, please set up your Stripe account now.</p>
                        </div>
                        
                        <button 
                            onClick={handleStripeRedirect}
                            className="stripe-redirect-button"
                        >
                            Complete Stripe Onboarding
                        </button>
                        
                        {/* Only show skip button if registration was actually completed */}
                        {registrationCompleted && (
                            <button 
                                onClick={skipStripeOnboarding}
                                className="skip-button"
                            >
                                Skip for now (You can complete this later)
                            </button>
                        )}
                        
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                    </div>
                </div>
            ) : (
                <form onSubmit={onSubmit}>
                    <h1>Create Account</h1>
                    
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    
                    <div className="input-box">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="input-box">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="input-box">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="input-box">
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            required
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="input-box">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="input-box">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            autoComplete="off"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="stripe-notice">
                        <p>By creating an account, you'll also set up a Stripe Connect account to receive payments from customers.</p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Creating Account...' : 'Create Account'}
                    </button>
                    
                    <div className="register-link">
                        <span>Already have an account? </span>
                        <Link to={'/login'}>Login</Link>
                    </div>
                </form>
            )}
            
            <style jsx>{`
                .form-container {
                    width: 100%;
                    max-width: 420px;
                    padding: 25px;
                }
                
                .stripe-redirect-container {
                    background: white;
                    border: 3px solid #dfe4ea;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }
                
                .stripe-redirect-container h2 {
                    color: #073b4c;
                    margin-bottom: 20px;
                    font-size: 1.6rem;
                }
                
                .stripe-info {
                    margin-bottom: 20px;
                }
                
                .stripe-info p {
                    margin: 10px 0;
                    color: #333;
                    font-size: 1rem;
                }
                
                .stripe-logo {
                    max-width: 120px;
                    margin-bottom: 15px;
                }
                
                .stripe-redirect-button {
                    background-color: #635bff !important; /* Stripe's brand color */
                    margin-bottom: 10px;
                }
                
                .stripe-redirect-button:hover {
                    background-color: #4b45c6 !important;
                }
                
                .skip-button {
                    background-color: white !important;
                    color: #073b4c !important;
                    border: 2px solid #073b4c !important;
                }
                
                .skip-button:hover {
                    background-color: #f8f8f8 !important;
                }
                
                .stripe-notice {
                    margin: 15px 0;
                    padding: 10px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #666;
                }
                
                .success-message {
                    color: #2e7d32;
                    font-size: 0.9rem;
                    text-align: center;
                    margin-bottom: 1rem;
                    background-color: #e8f5e9;
                    padding: 10px;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    )
}

export default Register