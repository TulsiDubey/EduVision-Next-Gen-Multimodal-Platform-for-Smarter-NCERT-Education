import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, Box, Paper, TextField, IconButton, Typography, CircularProgress,
  List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup,
  Fade, Button
} from '@mui/material';
import { Send as SendIcon, Science as ScienceIcon, Biotech as BiotechIcon, Close as CloseIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 600, height: '80vh', bgcolor: 'background.paper',
  boxShadow: 24, borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

function ChatbotModal({ open, onClose, subjects = [] }) {
  const [subject, setSubject] = useState(subjects[0]?.toLowerCase() || 'chemistry');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
      setMessages([{
        id: Date.now(),
        text: `Hi! Ask me anything about ${capitalizedSubject}.`,
        sender: 'system'
      }]);
      setInput('');
    }
  }, [open, subject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', subject: subject }),
        credentials: 'include'
      })
        .then(res => setServerStatus(res.ok ? 'connected' : 'error'))
        .catch(() => setServerStatus('error'));
    }
  }, [open, subject]);

  const handleSubjectChange = (event, newSubject) => {
    if (newSubject !== null) {
      setSubject(newSubject);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { id: Date.now(), text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, subject: subject }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setServerStatus('connected');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.response || "I'm sorry, I didn't get a valid response.",
        sender: 'bot'
      }]);
    } catch (err) {
      setServerStatus('error');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Sorry, I couldn't connect to the server: ${err.message}. Please check if the backend is running.`,
        sender: 'bot',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSubjectIcon = (subj) => {
    const lowerSubj = subj.toLowerCase();
    if (lowerSubj === 'biology') return <BiotechIcon fontSize="small" />;
    if (lowerSubj === 'physics') return <ScienceIcon fontSize="small" />;
    if (lowerSubj === 'maths') return <CalculateIcon fontSize="small" />;
    return <ScienceIcon fontSize="small" />;
  };

  const handleRetry = async () => {
    setServerStatus('unknown');
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', subject: subject }),
        credentials: 'include'
      });
      setServerStatus(response.ok ? 'connected' : 'error');
    } catch {
      setServerStatus('error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} disableAutoFocus inert={open ? undefined : ''}>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>Chatbot Assistant</Typography>
              <CircleIcon fontSize="small" sx={{ color: serverStatus === 'connected' ? 'green' : serverStatus === 'error' ? 'red' : 'grey.400' }} />
            </Box>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Paper>

          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup value={subject} exclusive onChange={handleSubjectChange} size="small" aria-label="subject selector">
              {(subjects.length > 0 ? subjects : ['Chemistry', 'Biology', 'Physics', 'Maths']).map((subj) => (
                <ToggleButton key={subj} value={subj.toLowerCase()} sx={{ textTransform: 'capitalize' }}>
                  {getSubjectIcon(subj)}
                  <span style={{ marginLeft: '8px' }}>{subj}</span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((msg) => (
              <ListItem key={msg.id} sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : (msg.sender === 'bot' ? 'flex-start' : 'center'),
                p: 0, mb: 1.5,
              }}>
                {msg.sender === 'system' ? (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{msg.text}</Typography>
                ) : (
                  <Paper elevation={2} sx={{
                    p: 1.5, maxWidth: '80%',
                    bgcolor: msg.error ? 'error.light' : (msg.sender === 'user' ? 'primary.main' : 'background.default'),
                    color: msg.error ? 'error.contrastText' : (msg.sender === 'user' ? 'primary.contrastText' : 'text.primary'),
                    borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  }}>
                    <ListItemText primary={<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>} />
                    {msg.error && (
                      <Button onClick={handleRetry} size="small" color="error" sx={{ mt: 1 }}>
                        Retry Connection
                      </Button>
                    )}
                  </Paper>
                )}
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ justifyContent: 'flex-start', p: 0, mb: 1.5 }}>
                <Paper elevation={2} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: '20px 20px 20px 5px' }}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} /> Typing...
                  </Typography>
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                inputProps={{ 'aria-label': 'Chat input' }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                sx={{ p: 1.5 }}
                aria-label="Send message"
              >
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export default ChatbotModal;