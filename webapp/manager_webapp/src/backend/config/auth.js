import { auth } from "./firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';
import API from '../api';

// Pre-verify Stripe functionality before creating any user accounts
async function preVerifyStripeSetup() {
  try {
    console.log("Pre-verifying Stripe setup before user creation...");
    const functions = getFunctions();
    
    // Create a call to check if Stripe is properly configured
    const verifyStripeSetup = httpsCallable(functions, 'verifyStripeSetup');
    
    // Wrap this in a try/catch to handle network errors properly
    try {
      const result = await verifyStripeSetup();
      
      if (!result.data || !result.data.success) {
        console.error("Stripe pre-verification failed:", result.data);
        throw new Error('Stripe integration is not properly configured. Registration is disabled.');
      }
      
      return true;
    } catch (networkError) {
      console.error("Network error during Stripe verification:", networkError);
      
      // For development purposes, you might want to bypass this check if it's failing due to CORS
      // Comment this out in production
      if (process.env.NODE_ENV === 'development') {
        console.warn("In development mode: bypassing Stripe verification due to possible CORS issue");
        return true;
      }
      
      throw new Error('Unable to verify Stripe setup. Registration is currently unavailable.');
    }
  } catch (error) {
    console.error("Error during Stripe pre-verification:", error);
    throw new Error('Unable to verify Stripe setup. Registration is currently unavailable.');
  }
}

// Create manager profile in Firebase with integrated Stripe setup
async function createManagerProfileWithStripe(userData) {
  try {
    console.log("Creating manager profile with Stripe integration:", userData);
    
    // First, create the manager profile to trigger the Cloud Function
    const managerData = {
      managerId: userData.authId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      parkingLots: [], // Empty array initialized
      createdAt: new Date().toISOString()
    };
    
    // Create manager profile
    await API.put(`/managers/${userData.authId}.json`, managerData);
    console.log("Manager profile created, waiting for Stripe account creation");
    
    // Wait for the Cloud Function to create the Stripe account
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const functions = getFunctions();
    
    // Verify Stripe account was created
    console.log("Verifying Stripe account creation...");
    const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
    const statusResult = await checkStatus({ managerId: userData.authId });
    
    if (!statusResult.data || !statusResult.data.hasAccount) {
      throw new Error('Failed to create Stripe Connect account');
    }
    
    // Generate onboarding link
    console.log("Generating Stripe onboarding link...");
    const generateAccountLink = httpsCallable(functions, 'generateAccountLink');
    const linkResult = await generateAccountLink({ managerId: userData.authId });
    
    if (!linkResult.data || !linkResult.data.accountLinkUrl) {
      throw new Error('Failed to generate Stripe onboarding link');
    }
    
    const onboardingUrl = linkResult.data.accountLinkUrl;
    
    // Store the onboarding URL in session storage
    sessionStorage.setItem('stripeOnboardingUrl', onboardingUrl);
    sessionStorage.setItem(`stripeOnboarding_${userData.authId}`, onboardingUrl);
    
    // Update manager profile with Stripe status
    await API.patch(`/managers/${userData.authId}.json`, {
      stripeSetupInitiated: true,
      updatedAt: new Date().toISOString()
    });
    
    return {
      ...managerData,
      stripeOnboardingUrl: onboardingUrl
    };
  } catch (error) {
    console.error("Error in manager profile creation:", error);
    
    // Clean up the partial manager profile
    try {
      await API.delete(`/managers/${userData.authId}.json`);
      console.log("Cleaned up partial manager profile");
    } catch (cleanupError) {
      console.error("Error cleaning up profile:", cleanupError);
    }
    
    throw error;
  }
}

// The main registration function with pre-verification
export const doCreateUserWithEmailAndPassword = async (email, password, userData = {}) => {
  try {
    // First, verify Stripe functionality before creating any user accounts
    console.log("Starting registration with Stripe pre-verification");
    await preVerifyStripeSetup();
    
    // If pre-verification succeeds, create the Firebase auth user
    console.log("Stripe pre-verification successful, creating Firebase user");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    try {
      // Now create the manager profile with Stripe integration
      console.log("Firebase user created, setting up manager profile with Stripe");
      const managerData = await createManagerProfileWithStripe({
        authId: user.uid,
        email: user.email,
        ...userData
      });
      
      console.log("Manager registration completed successfully with Stripe integration");
      
      return {
        ...userCredential,
        stripeOnboardingUrl: managerData.stripeOnboardingUrl
      };
    } catch (profileError) {
      // If manager profile creation fails, delete the auth user and throw error
      console.error("Manager profile creation failed, cleaning up auth user:", profileError);
      
      try {
        await user.delete();
        console.log("Auth user deleted due to manager profile creation failure");
      } catch (deleteError) {
        console.error("Error deleting auth user:", deleteError);
      }
      
      throw profileError;
    }
  } catch (error) {
    console.error("Registration process error:", error);
    throw error;
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  try {
    // First, verify Stripe functionality before processing Google sign-in
    await preVerifyStripeSetup();
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if manager profile already exists
    const managerResponse = await API.get(`/managers/${user.uid}.json`);
    const managerData = managerResponse.data;
    
    if (!managerData) {
      // If no manager profile exists, create one with Stripe integration
      await createManagerProfileWithStripe({
        authId: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        phoneNumber: user.phoneNumber || ''
      });
      
      // Set flag to show Stripe setup screen
      sessionStorage.setItem('showStripeSetup', 'true');
    } else {
      // For existing users, check if Stripe setup is complete
      try {
        const functions = getFunctions();
        const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
        
        const statusResult = await checkStatus({ managerId: user.uid });
        
        if (statusResult.data && !statusResult.data.onboardingComplete) {
          // If onboarding is not complete, get new link
          const generateAccountLink = httpsCallable(functions, 'generateAccountLink');
          const linkResult = await generateAccountLink({ managerId: user.uid });
          
          if (linkResult.data && linkResult.data.accountLinkUrl) {
            sessionStorage.setItem('stripeOnboardingUrl', linkResult.data.accountLinkUrl);
            sessionStorage.setItem('showStripeSetup', 'true');
          }
        }
      } catch (stripeError) {
        console.error('Error checking Stripe status:', stripeError);
      }
    }

    return result;
  } catch (error) {
    console.error('Error in Google sign-in:', error);
    throw error;
  }
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};

// Check if Stripe onboarding is complete
export const checkStripeOnboarding = async (managerId) => {
  try {
    const functions = getFunctions();
    const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
    
    const result = await checkStatus({ managerId });
    return result.data;
  } catch (error) {
    console.error('Error checking Stripe onboarding:', error);
    throw error;
  }
};

// Get the saved onboarding URL or generate a new one
export const getStripeOnboardingUrl = async (managerId) => {
  // Check multiple storage locations
  const savedUrl = sessionStorage.getItem('stripeOnboardingUrl') || 
                   sessionStorage.getItem(`stripeOnboarding_${managerId}`);
  
  if (savedUrl) {
    console.log("Found existing Stripe onboarding URL in session storage");
    return savedUrl;
  }
  
  // Generate a new one
  try {
    console.log("Generating new Stripe onboarding URL");
    const functions = getFunctions();
    const generateAccountLink = httpsCallable(functions, 'generateAccountLink');
    
    const result = await generateAccountLink({ managerId });
    
    if (result.data && result.data.accountLinkUrl) {
      const newUrl = result.data.accountLinkUrl;
      
      // Store in both locations
      sessionStorage.setItem('stripeOnboardingUrl', newUrl);
      sessionStorage.setItem(`stripeOnboarding_${managerId}`, newUrl);
      
      return newUrl;
    }
    
    throw new Error('Failed to generate Stripe onboarding URL');
  } catch (error) {
    console.error('Error getting Stripe onboarding URL:', error);
    throw error;
  }
};