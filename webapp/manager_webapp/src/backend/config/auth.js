import { auth } from "./firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { getFunctions, httpsCallable } from 'firebase/functions';
import API from '../api';



// Create manager profile in Firebase
async function createManagerProfile(userData) {
  try {
    console.log("Starting manager profile creation with data:", userData);
    
    // First, attempt to create the Stripe Connect account BEFORE creating the manager profile
    // This ensures we don't have orphaned manager profiles without Stripe accounts
    const functions = getFunctions();
    
    // 1. Create a temporary record to trigger the Cloud Function that creates the Stripe account
    const tempData = {
      managerId: userData.authId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      isTemporary: true, // Mark as temporary
      createdAt: new Date().toISOString()
    };
    
    // Create temporary record to trigger Stripe account creation
    await API.put(`/managers/${userData.authId}.json`, tempData);
    console.log("Temporary manager record created to trigger Stripe account creation");
    
    // Wait for the Cloud Function to create the Stripe account
    console.log("Waiting for Stripe account creation...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 2. Verify that a Stripe account was created
    console.log("Checking Stripe account status...");
    const checkStatus = httpsCallable(functions, 'checkStripeAccountStatus');
    const statusResult = await checkStatus({ managerId: userData.authId });
    
    console.log("Stripe account status check result:", statusResult.data);
    
    if (!statusResult.data || !statusResult.data.hasAccount) {
      // If no Stripe account was created, throw an error
      console.error("Stripe account creation failed. Status result:", statusResult.data);
      throw new Error('Failed to create Stripe Connect account. Please try again later.');
    }
    
    console.log("Stripe Connect account created successfully:", statusResult.data);
    
    // 3. Generate onboarding link
    console.log("Generating Stripe onboarding link...");
    const generateAccountLink = httpsCallable(functions, 'generateAccountLink');
    const linkResult = await generateAccountLink({ managerId: userData.authId });
    
    console.log("Stripe link generation result:", linkResult.data);
    
    if (!linkResult.data || !linkResult.data.accountLinkUrl) {
      console.error("Failed to generate Stripe onboarding link. Link result:", linkResult.data);
      throw new Error('Failed to generate Stripe onboarding link. Please try again later.');
    }
    
    // Store the onboarding URL in session storage
    const onboardingUrl = linkResult.data.accountLinkUrl;
    sessionStorage.setItem('stripeOnboardingUrl', onboardingUrl);
    console.log("Stripe onboarding URL generated and stored in session:", onboardingUrl);
    
    // 4. Now that Stripe is set up, update the manager profile with complete data
    const managerData = {
      ...tempData,
      isTemporary: false, // Remove temporary flag
      parkingLots: [], // Empty array initialized
      stripeSetupComplete: true, // Mark that Stripe account was created
      updatedAt: new Date().toISOString()
    };
    
    // Update the manager profile with complete data
    const response = await API.put(`/managers/${userData.authId}.json`, managerData);
    console.log("Manager profile created and Stripe account linked:", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in manager profile creation or Stripe setup:', error);
    
    // Clean up any partially created data
    try {
      // Delete the manager record since the setup failed
      await API.delete(`/managers/${userData.authId}.json`);
      console.log("Removed partial manager profile due to Stripe setup failure");
    } catch (cleanupError) {
      console.error('Error cleaning up partial manager profile:', cleanupError);
    }
    
    throw error;
  }
}

export const doCreateUserWithEmailAndPassword = async (email, password, userData = {}) => {
  let userCredential = null;
  
  try {
    console.log("Starting manager registration process");
    
    // Step 1: Create Firebase auth user
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Firebase auth user created:", user.uid);

    // Step 2: Create manager profile and set up Stripe Connect
    // This will throw an error if Stripe setup fails
    await createManagerProfile({
      authId: user.uid,
      email: user.email,
      ...userData
    });
    
    console.log("Manager registration completed successfully with Stripe Connect integration");
    return userCredential;
    
  } catch (error) {
    console.error('Error in registration process:', error);
    
    // If we created a Firebase user but failed at a later step, clean up
    if (userCredential && userCredential.user) {
      try {
        console.log('Deleting Firebase user due to failed registration:', userCredential.user.uid);
        await userCredential.user.delete();
        console.log('Firebase user deleted successfully');
      } catch (deleteError) {
        console.error('Error deleting Firebase user after failed registration:', deleteError);
      }
    }
    
    // Re-throw the error to be handled by the UI
    throw error;
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
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
  // Check if we have a saved URL
  const savedUrl = sessionStorage.getItem('stripeOnboardingUrl');
  
  if (savedUrl) {
    // Clear it from storage so it's used only once
    sessionStorage.removeItem('stripeOnboardingUrl');
    return savedUrl;
  }
  
  // Generate a new one
  try {
    const functions = getFunctions();
    const generateAccountLink = httpsCallable(functions, 'generateAccountLink');
    
    const result = await generateAccountLink({ managerId });
    
    if (result.data && result.data.accountLinkUrl) {
      return result.data.accountLinkUrl;
    }
    
    throw new Error('Failed to generate Stripe onboarding URL');
  } catch (error) {
    console.error('Error getting Stripe onboarding URL:', error);
    throw error;
  }
};