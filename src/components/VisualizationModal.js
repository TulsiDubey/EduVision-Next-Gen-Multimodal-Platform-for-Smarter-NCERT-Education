import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const getSiteName = (url) => {
  if (url.includes('molview')) return 'MolView';
  if (url.includes('chemtube3d')) return 'ChemTube3D';
  if (url.includes('vchem3d')) return 'VChem3D';
  if (url.includes('phet.colorado.edu')) return 'PhET';
  if (url.includes('visiblebody.com')) return 'Visible Body';
  return 'Source';
};

function VisualizationModal({ open, onClose, title, urls }) {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (urls && urls.length > 0) {
      setTabValue(0);
      setSelectedUrl(urls[0]);
    } else {
      setSelectedUrl('');
    }
  }, [urls]);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [selectedUrl]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedUrl(urls[newValue]);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title || 'Visualization'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="visualization source tabs">
            {urls?.map((url, index) => (
              <Tab key={index} label={getSiteName(url)} />
            ))}
          </Tabs>
          {selectedUrl && (
            <Button
              href={selectedUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              size="small"
            >
              Open in new tab
            </Button>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, position: 'relative', height: '70vh' }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Connection Refused
              </Typography>
              <Typography variant="body1" gutterBottom>
                This content cannot be displayed here due to security restrictions.
              </Typography>
              <Button
                href={selectedUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<OpenInNewIcon />}
              >
                Open in Original Site
              </Button>
            </Box>
          )}
          {selectedUrl && (
            <iframe
              src={selectedUrl}
              title="Visualization"
              width="100%"
              height="100%"
              style={{ border: 'none', display: error ? 'none' : 'block' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default VisualizationModal;