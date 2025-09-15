import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, RadioGroup, FormControlLabel, Radio, Box } from '@mui/material';
import axios from 'axios';
import Leaderboard from './Leaderboard';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

function QuizModal({ open, onClose, questions = [], moduleTitle, user, subject, standard }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    // Always pick 10 questions (randomly if more)
    let q = questions || [];
    if (q.length > 10) {
      q = q.sort(() => 0.5 - Math.random()).slice(0, 10);
    }
    setQuizQuestions(q);
  }, [questions, open]);

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[current] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < quizQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      const finalScore = quizQuestions.reduce((acc, q, idx) => acc + (answers[idx] === q.correct ? 1 : 0), 0);
      setScore(finalScore);
      setShowScore(true);
      submitQuiz(finalScore);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setAnswers([]);
    setShowScore(false);
    setScore(0);
    setLeaderboard([]);
    setStreak(0);
  };

  const submitQuiz = async (finalScore) => {
    if (!user) return;
    const quiz_id = `${subject}_${moduleTitle}`;
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        user_id: user.uid,
        user_name: user.name,
        quiz_id,
        subject,
        standard,
        score: finalScore,
        total_questions: quizQuestions.length
      });
      setStreak(res.data.streak);
      fetchLeaderboard();
    } catch (err) {}
  };

  const fetchLeaderboard = async () => {
    const quiz_id = `${subject}_${moduleTitle}`;
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/leaderboard', {
        params: { quiz_id, subject, standard }
      });
      setLeaderboard(res.data);
    } catch (err) {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{moduleTitle ? `${moduleTitle} Quiz` : 'Quiz'}</DialogTitle>
      <DialogContent>
        {showScore ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h5">Your Score: {score} / {quizQuestions.length}</Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mr: 1 }}>
                🔥 Streak: {streak} days
              </Typography>
              <Tooltip title="Your daily streak increases if you complete at least one quiz each day. Missing a day resets your streak.">
                <InfoIcon color="action" fontSize="small" />
              </Tooltip>
            </Box>
            <Leaderboard leaderboard={leaderboard} currentUser={user} />
            <Button onClick={handleRestart} sx={{ mt: 2 }}>Restart Quiz</Button>
          </Box>
        ) : quizQuestions.length > 0 ? (
          <Box>
            <Typography variant="subtitle1" mb={2}>Q{current + 1}. {quizQuestions[current].question}</Typography>
            <RadioGroup
              value={answers[current] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            >
              {quizQuestions[current].options.map((opt, idx) => (
                <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </Box>
        ) : (
          <Typography>No questions available.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!showScore && quizQuestions.length > 0 && (
          <Button onClick={handleNext} disabled={!answers[current]}>Next</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default QuizModal;