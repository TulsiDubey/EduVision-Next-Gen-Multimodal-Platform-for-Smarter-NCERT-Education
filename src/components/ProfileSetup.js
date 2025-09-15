import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert,
  Paper
} from '@mui/material';
import '../styles/AuthBackground.css';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../../src/firebase';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';

const standards = [
  { value: 'IX', label: 'Class IX' },
  { value: 'X', label: 'Class X' },
  { value: 'XI', label: 'Class XI' },
  { value: 'XII', label: 'Class XII' },
];
const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];

function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setUserProfile } = useAuth();
  // Try to get name from location state (from signup)
  const initialName = location.state?.name || '';
  const [name, setName] = useState(initialName);
  const [standard, setStandard] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !standard || selectedSubjects.length === 0) {
      setError('Please fill all fields.');
      return;
    }
    if (!currentUser) {
      setError('You must be logged in.');
      return;
    }
    try {
      const profileData = { name, standard, subjects: selectedSubjects, profileCompleted: true };
      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      setUserProfile(profileData);
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      // Save to backend as well
      await axios.post('http://localhost:5000/api/profile', {
        uid: currentUser.uid,
        name,
        email: currentUser.email,
        standard,
        subjects: selectedSubjects,
        profileCompleted: true
      });
      navigate('/choose-class', { replace: true });
    } catch (err) {
      setError('Failed to save profile.');
    }
  };

  return (
    <div className="auth-background">
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Complete Your Profile
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="standard-label">Standard</InputLabel>
              <Select
                labelId="standard-label"
                id="standard"
                value={standard}
                label="Standard"
                onChange={(e) => setStandard(e.target.value)}
              >
                {standards.map((std) => (
                  <MenuItem key={std.value} value={std.value}>{std.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="subjects-label">Subjects</InputLabel>
              <Select
                labelId="subjects-label"
                id="subjects"
                multiple
                value={selectedSubjects}
                onChange={(e) => setSelectedSubjects(e.target.value)}
                input={<OutlinedInput label="Subjects" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    <Checkbox checked={selectedSubjects.indexOf(subject) > -1} />
                    <ListItemText primary={subject} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save & Continue
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default ProfileSetup;