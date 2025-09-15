import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, enableNetwork, disableNetwork } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { CircularProgress, Typography } from '@mui/material';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Firebase services
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (!auth || !db) {
          throw new Error('Firebase services not initialized');
        }
        console.log('Firebase services ready');
        setIsInitialized(true);
      } catch (error) {
        console.error('Firebase initialization error:', error.message);
        setError('Failed to initialize authentication. Please refresh the page.');
      }
    };

    initializeFirebase();
  }, []);

  // Handle online/offline state
  useEffect(() => {
    if (!isInitialized) return;

    const handleOnline = async () => {
      setIsOnline(true);
      try {
        await enableNetwork(db);
        console.log('Firestore online');
      } catch (error) {
        console.error('Enable network error:', error.message);
      }
    };

    const handleOffline = async () => {
      setIsOnline(false);
      try {
        await disableNetwork(db);
        console.log('Firestore offline');
      } catch (error) {
        console.error('Disable network error:', error.message);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInitialized]);

  const loadUserProfile = useCallback(async (user) => {
    if (!user) return null;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log('Loaded profile:', profileData);
        return profileData;
      }
      console.log('No profile found for user:', user.uid);
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error.code, error.message);
      if (!isOnline) {
        setError('No internet connection. Please check your connection.');
      } else {
        setError('Failed to load user profile.');
      }
      return null;
    }
  }, [isOnline]);

  // Handle auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await loadUserProfile(user);
          setCurrentUser(user);
          setUserProfile(profile);
          console.log('Auth state changed: User logged in', { uid: user.uid, profile });
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          localStorage.removeItem('userProfile');
          console.log('Auth state changed: No user');
        }
      } catch (error) {
        console.error('Auth state change error:', error.message);
        setError('Failed to authenticate. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isInitialized, loadUserProfile]);

  async function signup(email, password, name) {
    if (!isInitialized) {
      throw new Error('Authentication service not initialized');
    }

    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your connection.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const profileData = {
        name,
        email,
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), profileData);
      setUserProfile(profileData);
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      console.log('Signup profile created:', profileData);

      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      setError(`Signup failed: ${error.message}`);
      throw error;
    }
  }

  async function login(email, password) {
    if (!isInitialized) {
      throw new Error('Authentication service not initialized');
    }

    try {
      if (!isOnline) {
        throw new Error('No internet connection. Please check your connection.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadUserProfile(userCredential.user);
      setUserProfile(profile);
      console.log('Login successful:', { uid: userCredential.user.uid, profile });
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      setError(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async function logout() {
    if (!isInitialized) {
      throw new Error('Authentication service not initialized');
    }
    try {
      await signOut(auth);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error.code, error.message);
      setError(`Logout failed: ${error.message}`);
      throw error;
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    setError,
    setUserProfile,
    isOnline,
    isInitialized,
    signup,
    login,
    logout,
    db,
  };

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing authentication...</Typography>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}