import React from 'react';
import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

function SubjectContent({ content }) {
  if (!content || !content.title) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" color="error">
          No Content Available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {content.title}
      </Typography>
      <List>
        {content.topics.map((topic, index) => (
          <ListItem key={index}>
            <ListItemText primary={topic} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default SubjectContent;