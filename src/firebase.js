import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqVUpiBK9ai33MBz_-RosYtCUimXfYAL0",
  authDomain: "ncertvisualizationtool.firebaseapp.com",
  projectId: "ncertvisualizationtool",
  storageBucket: "ncertvisualizationtool.appspot.com",
  messagingSenderId: "154708621831",
  appId: "1:154708621831:web:9f532b2004e212958608a2"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  console.log('Initializing Firebase...');
  
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }

  // Initialize Firestore with persistent cache (modular API)
  db = initializeFirestore(app, { cache: 'persistent' });
  console.log('Firestore initialized with persistent cache');

  // Initialize Auth
  auth = getAuth(app);
  console.log('Auth initialized');
} catch (error) {
  console.error('Firebase initialization error:', error.code, error.message);
  throw error;
}

// Validate services
if (!app || !auth || !db) {
  throw new Error('Firebase services not properly initialized');
}

export { app, auth, db };