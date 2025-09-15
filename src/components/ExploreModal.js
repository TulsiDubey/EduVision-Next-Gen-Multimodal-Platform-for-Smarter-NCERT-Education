import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider,
} from '@mui/material';
import { School as SchoolIcon, Science as ScienceIcon, Biotech as BiotechIcon } from '@mui/icons-material';

// A more robust icon function
const getSubjectIcon = (subject) => {
  switch (subject?.toLowerCase()) {
    case 'physics': return <SchoolIcon color="primary" />;
    case 'chemistry': return <ScienceIcon color="secondary" />;
    case 'biology': return <BiotechIcon color="success" />;
    default: return <SchoolIcon color="action" />;
  }
};

function ExploreModal({ open, onClose, module, subject }) {
  if (!module) return null;

  // Use the detailed explanation from the module data, with a fallback
  const explanation = module.detailedExplanation || `This module covers ${module.title} in detail, including key concepts and applications. Explore the resources below for interactive simulations and in-depth explanations.`;
  
  // Use the resource links directly from the module data
  const resources = module.resourceLinks || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {getSubjectIcon(subject)}
          <Typography variant="h5" component="div">
            {module.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {module.summary}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Detailed Explanation
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {explanation}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          External Resources
        </Typography>
        {resources.length > 0 ? (
          <List>
            {resources.map((resource, index) => (
              <ListItem key={index} disableGutters>
                <ListItemText
                  primary={
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer" variant="body1">
                      {resource.title}
                    </Link>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {`Source: ${resource.url.split('/')[2]}`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No external resources available for this module.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExploreModal;