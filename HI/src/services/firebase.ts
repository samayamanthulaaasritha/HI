import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFYU3FRPL6tunKQMjsC1WEK0qlcuY1_KE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hotelinfo-752c5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hotelinfo-752c5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hotelinfo-752c5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "46618751687",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:46618751687:web:7d37972fed81efe70504e2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D4E0QX97EF"
};

// Singleton Firebase initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const getTimestamp = serverTimestamp;

export default app;
