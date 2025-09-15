import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import ClassSelection from './components/ClassSelection';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';

const PrivateRoute = ({ children, requiresProfile = false }) => {
  const { currentUser, userProfile, loading, isInitialized } = useAuth();

  if (!isInitialized || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!currentUser) {
    console.log('No user, redirecting to /login'); // Debug
    return <Navigate to="/login" />;
  }

  if (requiresProfile && !userProfile?.profileCompleted) {
    console.log('Incomplete profile, redirecting to /profile-setup'); // Debug
    return <Navigate to="/profile-setup" />;
  }

  if (children.type === ProfileSetup && userProfile?.profileCompleted) {
    console.log('Profile completed, redirecting to /dashboard'); // Debug
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/profile-setup"
              element={
                <PrivateRoute>
                  <ProfileSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/choose-class"
              element={
                <PrivateRoute requiresProfile>
                  <ClassSelection />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute requiresProfile>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;