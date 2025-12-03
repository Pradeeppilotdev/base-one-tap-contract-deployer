// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDn6JwY1x1X8dBh4oeNfW8CTAhm9GHpZQw",
  authDomain: "base-contract-deployer.firebaseapp.com",
  projectId: "base-contract-deployer",
  storageBucket: "base-contract-deployer.firebasestorage.app",
  messagingSenderId: "1037025966654",
  appId: "1:1037025966654:web:51bccbeb143ef63066af6f",
  measurementId: "G-M15LXYSR0C"
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db: Firestore = getFirestore(app);

export default app;

