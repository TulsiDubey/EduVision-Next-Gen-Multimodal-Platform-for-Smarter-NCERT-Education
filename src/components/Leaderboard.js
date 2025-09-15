import React from 'react';
import { Box, Typography, Avatar, Stack, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const coinColors = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

function Leaderboard({ leaderboard = [], currentUser }) {
  if (!leaderboard.length) return null;
  // Find current user in leaderboard
  const userIdx = leaderboard.findIndex(e => e.user_name === currentUser?.name);
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Leaderboard
      </Typography>
      <Stack spacing={2} alignItems="center">
        {leaderboard.map((entry, idx) => (
          <Box key={idx} display="flex" alignItems="center" width="100%" justifyContent="center"
            sx={{
              bgcolor: idx === 0 ? '#fff8e1' : idx === 1 ? '#f5f5f5' : idx === 2 ? '#fbe9e7' : (currentUser && entry.user_name === currentUser.name ? '#e3f2fd' : 'inherit'),
              borderRadius: 2,
              p: 1,
              boxShadow: idx < 3 ? 2 : 0,
              border: (currentUser && entry.user_name === currentUser.name) ? '2px solid #1976d2' : 'none',
            }}
          >
            {entry.coin_type && (
              <EmojiEventsIcon sx={{ color: coinColors[entry.coin_type], mr: 1 }} />
            )}
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {entry.user_name ? entry.user_name[0].toUpperCase() : '?'}
            </Avatar>
            <Typography variant="body1" sx={{ minWidth: 120 }}>{entry.user_name}</Typography>
            <Typography variant="body2" sx={{ ml: 2, fontWeight: 'bold' }}>{entry.score} pts</Typography>
            {currentUser && entry.user_name === currentUser.name && (
              <Chip label="You" color="primary" size="small" sx={{ ml: 2 }} />
            )}
          </Box>
        ))}
        {/* If user not in top 10, show their position */}
        {currentUser && userIdx === -1 && (
          <Box mt={2} display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2">Your position: Not in top 10</Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default Leaderboard; 