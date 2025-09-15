import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Grid, Paper, Link } from '@mui/material';

const AR_IMAGES = [
  {
    label: "Electric Charges and Fields (1)",
    file: "app1 (1).png",
    module: "Electric Charges and Fields"
  },
  {
    label: "Electric Charges and Fields (2)",
    file: "app2 (1).png",
    module: "Electric Charges and Fields"
  },
  {
    label: "Coulomb's Law",
    file: "coulombs law (1).jpg",
    module: "Coulomb's Law"
  },
  {
    label: "Electric Potential",
    file: "elec pos (1).png",
    module: "Electric Potential"
  },
  {
    label: "Electric Flux",
    file: "Electric-Flux (1).jpg",
    module: "Electric Flux"
  },
  {
    label: "Gaussian Surface",
    file: "Gaussian-surface (1).jpg",
    module: "Gauss's Law / Gaussian Surface"
  }
];

const APK_LINK = "/backend/phy12.apk";
const IMAGE_BASE = "/backend/AR_images/";

function ARVisualizationModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>AR Visualization for Physics Modules</DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>How to Use AR Visualization</Typography>
          <Typography variant="body1" paragraph>
            1. <b>Download and install the AR app:</b> <Link href={APK_LINK} download>Download APK</Link><br/>
            2. Open the app on your Android device.<br/>
            3. Select the module you want to visualize.<br/>
            4. Scan the corresponding image below with your device’s camera.<br/>
            5. Watch the 3D/AR visualization appear on your screen!<br/>
          </Typography>
        </Paper>
        <Typography variant="h6" gutterBottom>AR Images for Scanning</Typography>
        <Grid container spacing={2}>
          {AR_IMAGES.map((img, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>{img.module}</Typography>
                <img
                  src={IMAGE_BASE + encodeURIComponent(img.file)}
                  alt={img.label}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>{img.label}</Typography>
                <Link href={IMAGE_BASE + encodeURIComponent(img.file)} download style={{ display: 'block', marginTop: 8 }}>
                  Download Image
                </Link>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ARVisualizationModal; 