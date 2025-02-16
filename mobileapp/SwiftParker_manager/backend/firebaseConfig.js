import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC1NkWVIhdqQ5prVozavThxTdYlD78llXg",
  authDomain: "swiftparker-e2e14.firebaseapp.com",
  databaseURL: "https://swiftparker-e2e14-default-rtdb.firebaseio.com",
  projectId: "swiftparker-e2e14",
  storageBucket: "swiftparker-e2e14.firebasestorage.app",
  messagingSenderId: "318201912656",
  appId: "1:318201912656:web:dcb6b2d666d64a162ee055",
  measurementId: "G-C9KSPX1DNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };