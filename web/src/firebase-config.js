// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ✅ Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD7ctGJEtkD9mRaubNUNaayqTG6imNRQu8",
  authDomain: "wulapal.firebaseapp.com",
  projectId: "wulapal",
  storageBucket: "wulapal.firebasestorage.app",
  messagingSenderId: "841356244009",
  appId: "1:841356244009:web:1ba9485655ec9aa6a15838",
  measurementId: "G-35M2EHWT7D"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
