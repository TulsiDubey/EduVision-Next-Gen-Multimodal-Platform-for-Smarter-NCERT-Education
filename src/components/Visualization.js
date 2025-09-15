import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const visualizationAPIs = {
  chemistry: [
   /* {
      name: 'MolView',
      url: 'https://molview.org/',
      description: 'Interactive molecular visualization',
    },*/
    {
      name: 'ChemTube3D',
      url: 'https://www.chemtube3d.com/',
      description: '3D molecular structures and animations',
    },/*
    {
      name: 'VChem3D',
      url: 'https://vchem3d.univ-tlse3.fr/',
      description: 'Virtual chemistry laboratory',
    },*/
  ],
  biology: [
    {
      name: 'Visible Body',
      url: 'https://www.visiblebody.com/learn/biology',
      description: 'Interactive biology models and animations',
    },
   /* {
      name: 'Smart Biology',
      url: 'https://www.smart-biology.com/',
      description: 'Biology learning resources and visualizations',
    },*/
  ],
  physics: [
    {/*
      name: 'PhET',
      url: 'https://phet.colorado.edu/',
      description: 'Interactive physics simulations',
    */},
    {
      name: 'oPhysics',
      url: 'https://ophysics.com/',
      description: 'Physics simulations and visualizations',
    },
  ],
};

function Visualization({ open, onClose, subject, topic }) {
  const [selectedAPI, setSelectedAPI] = useState('');

  useEffect(() => {
    if (subject && visualizationAPIs[subject]) {
      setSelectedAPI(visualizationAPIs[subject][0].url);
    }
  }, [subject]);

  const handleAPIChange = (event) => {
    setSelectedAPI(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {topic} - Visualization
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Visualization Tool</InputLabel>
            <Select
              value={selectedAPI}
              onChange={handleAPIChange}
              label="Select Visualization Tool"
            >
              {visualizationAPIs[subject]?.map((api) => (
                <MenuItem key={api.url} value={api.url}>
                  {api.name} - {api.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 'calc(100% - 80px)',
            border: '1px solid #ccc',
            borderRadius: 1,
          }}
        >
          <iframe
            src={selectedAPI}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Visualization"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Visualization; 