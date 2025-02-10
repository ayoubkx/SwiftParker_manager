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
import API from '../api';

// Create manager profile in Firebase
async function createManagerProfile(userData) {
  try {
    console.log("Creating manager profile with data:", userData);
    
    
    const managerData = {
      managerId: userData.authId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      parkingLots: [], // Empty array initialized
      createdAt: new Date().toISOString()
    };

    const response = await API.put(`/managers/${userData.authId}.json`, managerData);
    console.log("Manager profile created:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating manager profile:', error);
    throw error;
  }
}

export const doCreateUserWithEmailAndPassword = async (email, password, userData = {}) => {
  try {
    console.log("Starting user registration with data:", { email, userData }); // Debug log
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Firebase auth user created:", user.uid); // Debug log

    // Create manager profile
    await createManagerProfile({
      authId: user.uid,
      email: user.email,
      ...userData
    });

    return userCredential;
  } catch (error) {
    console.error('Error in registration:', error);
    throw error;
  }
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create manager profile for Google sign-in
    await createManagerProfile({
      managerId: user.uid,
      email: user.email,
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ')[1] || '',
      phoneNumber: user.phoneNumber || ''
    });

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