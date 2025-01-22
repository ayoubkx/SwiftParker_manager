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
    // Check if manager already exists
    const existingManagerQuery = await API.get(
      `/managers.json?orderBy="authId"&equalTo="${userData.authId}"`
    );

    if (Object.keys(existingManagerQuery.data || {}).length > 0) {
      console.log('Manager profile already exists');
      return;
    }

    // Create new manager profile
    const managerData = {
      authId: userData.authId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phoneNumber: userData.phoneNumber || '',
      company: userData.company || '',
      parkingLots: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    await API.post('/managers.json', managerData);
  } catch (error) {
    console.error('Error creating manager profile:', error);
    throw error;
  }
}

export const doCreateUserWithEmailAndPassword = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

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
      authId: user.uid,
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