import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/AuthBackground.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isInitialized, error: authError } = useAuth();
  const navigate = useNavigate();

  if (!isInitialized) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Initializing...
          </Typography>
        </Box>
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const timeout = setTimeout(() => {
        setError('Request timed out. Please check your connection and try again.');
        setLoading(false);
      }, 10000);

      const loginResult = await login(email, password);
      const user = loginResult && loginResult.user ? loginResult.user : loginResult;
      if (!user || !user.uid) {
        throw new Error('Login failed: No user returned from authentication.');
      }
      // Directly go to dashboard after login
      navigate('/dashboard', { replace: true });

      clearTimeout(timeout);
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      setError(`Failed to log in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
            {(error || authError) && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error || authError}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/signup')}
                disabled={loading}
              >
                Don't have an account? Sign Up
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
}

export default Login;