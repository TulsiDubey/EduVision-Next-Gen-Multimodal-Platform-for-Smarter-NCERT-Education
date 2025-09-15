import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';

const classes = [
  { value: 'IX', label: 'Class IX' },
  { value: 'X', label: 'Class X' },
  { value: 'XI', label: 'Class XI' },
  { value: 'XII', label: 'Class XII' },
];

function ClassSelection() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser, userProfile, setUserProfile } = useAuth();

  const handleSelect = async (cls) => {
    if (!currentUser) {
      setError('You must be logged in.');
      return;
    }
    try {
      // Save to Firestore and context
      const updatedProfile = { ...userProfile, standard: cls, classSelected: true };
      setUserProfile(updatedProfile);
      // Optionally, update Firestore here
      // await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save class selection.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Choose Your Class
        </Typography>
        <Box mt={3}>
          <Grid container spacing={2} justifyContent="center">
            {classes.map((cls) => (
              <Grid item xs={6} sm={3} key={cls.value}>
                <Button
                  fullWidth
                  variant="contained"
                  color={'primary'}
                  onClick={() => handleSelect(cls.value)}
                  sx={{ height: 60 }}
                >
                  {cls.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
        {error && <Typography color="error" align="center" mt={2}>{error}</Typography>}
      </Paper>
    </Container>
  );
}

export default ClassSelection; 