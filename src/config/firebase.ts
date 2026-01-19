// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJ0Jc5Vl9gxkhQM-vKsyl6Acep-EDirtk",
  authDomain: "prk-smiles.firebaseapp.com",
  projectId: "prk-smiles",
  storageBucket: "prk-smiles.firebasestorage.app",
  messagingSenderId: "96495423870",
  appId: "1:96495423870:web:c5ae43caf8a9b4681e232f",
  measurementId: "G-EL5LME26LR"
};

// Initialize Firebase
let app: FirebaseApp;
const apps = getApps();
if (!apps || apps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Firebase services
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

// Initialize Messaging (only in browser environment and if supported)
let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging is not supported in this environment:", error);
  }
}

export { app, analytics, messaging };
export default app;

