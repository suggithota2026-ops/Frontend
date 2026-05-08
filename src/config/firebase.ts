// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const raw = import.meta.env[key];
  if (typeof raw !== "string") return fallback;
  const t = raw.trim();
  return t.length > 0 ? t : fallback;
}

// Defaults match project suggi-thota-5a10e; override via Frontend/.env (VITE_*).
const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv("VITE_FIREBASE_API_KEY", "AIzaSyBKBsiRVHhSQM79Ru5i5MJYw8lDFJtm-0A"),
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN", "suggi-thota-5a10e.firebaseapp.com"),
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID", "suggi-thota-5a10e"),
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET", "suggi-thota-5a10e.firebasestorage.app"),
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "540616187955"),
  appId: readEnv("VITE_FIREBASE_APP_ID", "1:540616187955:web:24f244d7b7f4ea7f16c346"),
  measurementId: readEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-F16TGLQ2XV"),
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

