import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';
import Leaderboard from './Leaderboard';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

function Quiz({ open, onClose, subject, topic, user, standard }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && subject && topic) {
      fetchQuestions();
    }
    // eslint-disable-next-line
  }, [open, subject, topic]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/generate', {
        subject,
        module_title: topic
      });
      setQuestions(res.data);
    } catch (err) {
      setQuestions([]);
    }
    setLoading(false);
  };

  const progress = (currentQuestion / (questions.length || 1)) * 100;

  const handleAnswerSelect = (event) => {
    setSelectedAnswer(parseInt(event.target.value));
  };

  const handleNext = () => {
    if (selectedAnswer === getCorrectIndex()) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
      submitQuiz(score + (selectedAnswer === getCorrectIndex() ? 1 : 0));
    }
  };

  const getCorrectIndex = () => {
    const q = questions[currentQuestion];
    if (!q) return -1;
    if (typeof q.correctAnswer === 'number') return q.correctAnswer;
    if (typeof q.correct === 'string') return q.options.findIndex(opt => opt === q.correct);
    return -1;
  };

  const submitQuiz = async (finalScore) => {
    if (!user) return;
    const quiz_id = `${subject}_${topic}`;
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        user_id: user.uid,
        user_name: user.name,
        quiz_id,
        subject,
        standard,
        score: finalScore,
        total_questions: questions.length
      });
      setStreak(res.data.streak);
      fetchLeaderboard();
    } catch (err) {
      // handle error
    }
  };

  const fetchLeaderboard = async () => {
    const quiz_id = `${subject}_${topic}`;
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/leaderboard', {
        params: { quiz_id, subject, standard }
      });
      setLeaderboard(res.data);
    } catch (err) {}
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setLeaderboard([]);
    setStreak(0);
    setQuestions([]);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Loading Quiz...</DialogTitle>
        <DialogContent>
          <Typography>Loading questions, please wait...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!questions.length) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Quiz Not Available</DialogTitle>
        <DialogContent>
          <Typography>
            Quiz questions for this topic are not available yet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          {topic} - Quiz
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
      </DialogTitle>
      <DialogContent>
        {!showResults ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1">
                {questions[currentQuestion].question}
              </Typography>
            </Paper>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select your answer:</FormLabel>
              <RadioGroup
                value={selectedAnswer}
                onChange={handleAnswerSelect}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Quiz Completed!
            </Typography>
            <Typography variant="h6">
              Your Score: {score} out of {questions.length}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mr: 1 }}>
                🔥 Streak: {streak} days
              </Typography>
              <Tooltip title="Your daily streak increases if you complete at least one quiz each day. Missing a day resets your streak.">
                <InfoIcon color="action" fontSize="small" />
              </Tooltip>
            </Box>
            <Leaderboard leaderboard={leaderboard} currentUser={user} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!showResults ? (
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            variant="contained"
          >
            {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default Quiz; 