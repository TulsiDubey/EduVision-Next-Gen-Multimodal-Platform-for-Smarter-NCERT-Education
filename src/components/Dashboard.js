import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  MenuBook as BiologyIcon,
  Calculate as CalculateIcon,
  WbSunny as WbSunnyIcon,
  Nightlight as NightlightIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Leaderboard from './Leaderboard';
import Fab from '@mui/material/Fab';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { biologyXII, chemistryXII, physicsXII } from './moduleData';
import { biologyXI, chemistryXI, physicsXI } from './moduleData11.js';
import { useThemeMode } from '../contexts/ThemeContext';
import VisualizationModal from './VisualizationModal';
import QuizModal from './QuizModal';
import ChatbotModal from './ChatbotModal';
import ExploreModal from './ExploreModal';
import ARVisualizationModal from './ARVisualizationModal';

const allClassModules = {
  'XI': {
    'Chemistry': chemistryXI,
    'Physics': physicsXI,
    'Biology': biologyXI
  },
  'XII': {
    'Chemistry': chemistryXII,
    'Physics': physicsXII,
    'Biology': biologyXII
  }
};

const moduleImages = {
  // Class XII Images
  'The Solid State': 'https://picsum.photos/seed/solidstate/800/600',
  'Solutions': 'https://picsum.photos/seed/solutions/800/600',
  'Electrochemistry': 'https://picsum.photos/seed/electrochemistry/800/600',
  'Chemical Kinetics': 'https://picsum.photos/seed/chemkinetics/800/600',
  'Surface Chemistry': 'https://picsum.photos/seed/surfacechem/800/600',
  'General Principles and Processes of Isolation of Elements': 'https://picsum.photos/seed/metallurgy/800/600',
  'The p-Block Elements': 'https://picsum.photos/seed/pblock/800/600',
  'The d-and f-Block Elements': 'https://picsum.photos/seed/dfblock/800/600',
  'Coordination Compounds': 'https://picsum.photos/seed/coordination/800/600',
  'Haloalkanes and Haloarenes': 'https://picsum.photos/seed/haloalkanes/800/600',
  'Alcohols, Phenols and Ethers': 'https://picsum.photos/seed/alcohols/800/600',
  'Aldehydes, Ketones and Carboxylic Acids': 'https://picsum.photos/seed/aldehydes/800/600',
  'Amines': 'https://picsum.photos/seed/amines/800/600',
  'Biomolecules': 'https://picsum.photos/seed/biomolecules/800/600',
  'Polymers': 'https://picsum.photos/seed/polymers/800/600',
  'Chemistry in Everyday Life': 'https://picsum.photos/seed/chemlife/800/600',
  'Sexual Reproduction in Flowering Plants': 'https://picsum.photos/seed/plantrepro/800/600',
  'Human Reproduction': 'https://picsum.photos/seed/humanrepro/800/600',
  'Reproductive Health': 'https://picsum.photos/seed/reprohealth/800/600',
  'Principles of Inheritance and Variation': 'https://picsum.photos/seed/inheritance/800/600',
  'Molecular Basis of Inheritance': 'https://picsum.photos/seed/molecularinheritance/800/600',
  'Evolution': 'https://picsum.photos/seed/evolution/800/600',
  'Human Health and Disease': 'https://picsum.photos/seed/healthdisease/800/600',
  'Strategies for Enhancement in Food Production': 'https://picsum.photos/seed/foodproduction/800/600',
  'Microbes in Human Welfare': 'https://picsum.photos/seed/microbes/800/600',
  'Biotechnology: Principles and Processes': 'https://picsum.photos/seed/biotechprinciples/800/600',
  'Biotechnology and Its Applications': 'https://picsum.photos/seed/biotechapps/800/600',
  'Organisms and Populations': 'https://picsum.photos/seed/organismspopulations/800/600',
  'Ecosystem': 'https://picsum.photos/seed/ecosystem/800/600',
  'Biodiversity and Conservation': 'https://picsum.photos/seed/biodiversity/800/600',
  'Environmental Issues': 'https://picsum.photos/seed/enviroissues/800/600',
  'Electric Charges and Fields': 'https://picsum.photos/seed/electriccharges/800/600',
  'Electrostatic Potential and Capacitance': 'https://picsum.photos/seed/electrostatics/800/600',
  'Current Electricity': 'https://picsum.photos/seed/currentelectricity/800/600',
  'Moving Charges and Magnetism': 'https://picsum.photos/seed/magnetism/800/600',
  'Magnetism and Matter': 'https://picsum.photos/seed/magnetismmatter/800/600',
  'Electromagnetic Induction': 'https://picsum.photos/seed/eminduction/800/600',
  'Alternating Current': 'https://picsum.photos/seed/acurrent/800/600',
  'Electromagnetic Waves': 'https://picsum.photos/seed/emwaves/800/600',
  'Ray Optics and Optical Instruments': 'https://picsum.photos/seed/rayoptics/800/600',
  'Wave Optics': 'https://picsum.photos/seed/waveoptics/800/600',
  'Dual Nature of Radiation and Matter': 'https://picsum.photos/seed/dualnature/800/600',
  'Atoms': 'https://picsum.photos/seed/atoms/800/600',
  'Nuclei': 'https://picsum.photos/seed/nuclei/800/600',
  'Semiconductor Electronics: Materials, Devices and Simple Circuits': 'https://picsum.photos/seed/semiconductors/800/600',
  'Communication Systems': 'https://picsum.photos/seed/commsystems/800/600',
  // Class XI Images
  'Some Basic Concepts of Chemistry': 'https://picsum.photos/seed/chembasics/800/600',
  'Structure of Atom': 'https://picsum.photos/seed/atomstructure/800/600',
  'Classification of Elements and Periodicity in Properties': 'https://picsum.photos/seed/periodictable/800/600',
  'Chemical Bonding and Molecular Structure': 'https://picsum.photos/seed/chembonding/800/600',
  'States of Matter': 'https://picsum.photos/seed/statesmatter/800/600',
  'Thermodynamics': 'https://picsum.photos/seed/thermo/800/600',
  'Equilibrium': 'https://picsum.photos/seed/equilibrium/800/600',
  'Redox Reactions': 'https://picsum.photos/seed/redox/800/600',
  'Hydrogen': 'https://picsum.photos/seed/hydrogen/800/600',
  'The s-Block Elements': 'https://picsum.photos/seed/sblock/800/600',
  'Organic Chemistry: Some Basic Principles and Techniques': 'https://picsum.photos/seed/orgbasics/800/600',
  'Hydrocarbons': 'https://picsum.photos/seed/hydrocarbons/800/600',
  'Environmental Chemistry': 'https://picsum.photos/seed/envchem/800/600',
  'Physical World': 'https://picsum.photos/seed/physworld/800/600',
  'Units and Measurement': 'https://picsum.photos/seed/units/800/600',
  'Motion in a Straight Line': 'https://picsum.photos/seed/motionline/800/600',
  'Motion in a Plane': 'https://picsum.photos/seed/motionplane/800/600',
  'Laws of Motion': 'https://picsum.photos/seed/lawsmotion/800/600',
  'Work, Energy and Power': 'https://picsum.photos/seed/workenergy/800/600',
  'System of Particles and Rotational Motion': 'https://picsum.photos/seed/rotation/800/600',
  'Gravitation': 'https://picsum.photos/seed/gravity/800/600',
  'Mechanical Properties of Solids': 'https://picsum.photos/seed/mechsolids/800/600',
  'Mechanical Properties of Fluids': 'https://picsum.photos/seed/mechfluids/800/600',
  'Thermal Properties of Matter': 'https://picsum.photos/seed/thermalprops/800/600',
  'Kinetic Theory': 'https://picsum.photos/seed/kinetictheory/800/600',
  'Oscillations': 'https://picsum.photos/seed/oscillations/800/600',
  'Waves': 'https://picsum.photos/seed/waves/800/600',
  'The Living World': 'https://picsum.photos/seed/livingworld/800/600',
  'Biological Classification': 'https://picsum.photos/seed/bioclass/800/600',
  'Plant Kingdom': 'https://picsum.photos/seed/plantkingdom/800/600',
  'Animal Kingdom': 'https://picsum.photos/seed/animalkingdom/800/600',
  'Morphology of Flowering Plants': 'https://picsum.photos/seed/morphology/800/600',
  'Anatomy of Flowering Plants': 'https://picsum.photos/seed/anatomy/800/600',
  'Structural Organisation in Animals': 'https://picsum.photos/seed/animalorg/800/600',
  'Cell: The Unit of Life': 'https://picsum.photos/seed/cell/800/600',
  'Cell Cycle and Cell Division': 'https://picsum.photos/seed/celldivision/800/600',
  'Transport in Plants': 'https://picsum.photos/seed/planttransport/800/600',
  'Mineral Nutrition': 'https://picsum.photos/seed/mineralnutrition/800/600',
  'Photosynthesis in Higher Plants': 'https://picsum.photos/seed/photosynthesis/800/600',
  'Respiration in Plants': 'https://picsum.photos/seed/plantresp/800/600',
  'Plant Growth and Development': 'https://picsum.photos/seed/plantgrowth/800/600',
  'Digestion and Absorption': 'https://picsum.photos/seed/digestion/800/600',
  'Breathing and Exchange of Gases': 'https://picsum.photos/seed/breathing/800/600',
  'Body Fluids and Circulation': 'https://picsum.photos/seed/circulation/800/600',
  'Excretory Products and their Elimination': 'https://picsum.photos/seed/excretion/800/600',
  'Locomotion and Movement': 'https://picsum.photos/seed/locomotion/800/600',
  'Neural Control and Coordination': 'https://picsum.photos/seed/neural/800/600',
  'Chemical Coordination and Integration': 'https://picsum.photos/seed/chemicalcoord/800/600',
};

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('Chemistry');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [visualizationOpen, setVisualizationOpen] = useState(false);
  const [visualizationLinks, setVisualizationLinks] = useState([]);
  const [visualizationTitle, setVisualizationTitle] = useState('');
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreModule, setExploreModule] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardQuiz, setLeaderboardQuiz] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const [importantOpen, setImportantOpen] = useState(false);
  const [importantLoading, setImportantLoading] = useState(false);
  const [importantTopics, setImportantTopics] = useState('');
  const [importantError, setImportantError] = useState('');
  const [pyqOpen, setPyqOpen] = useState(false);
  const [pyqLoading, setPyqLoading] = useState(false);
  const [pyqs, setPyqs] = useState('');
  const [pyqError, setPyqError] = useState('');
  const [currentModule, setCurrentModule] = useState(null);
  const [arOpen, setArOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userProfile: authUserProfile, logout, isInitialized } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  useEffect(() => {
    const loadProfileAndModules = async () => {
      try {
        if (!isInitialized) return;
        if (!currentUser) {
          navigate('/login', { replace: true });
          return;
        }

        const profileData = authUserProfile || {};
        setUserProfile(profileData);

        const availableSubjects = profileData.subjects || ['Chemistry', 'Physics', 'Biology', 'Maths'];
        setSubjects(availableSubjects);

        if (!availableSubjects.includes(selectedSubject)) {
          setSelectedSubject(availableSubjects[0] || 'Chemistry');
        }

        const standard = profileData.standard || 'XII';
        const currentModules = allClassModules[standard]?.[selectedSubject] || [];
        setModules(currentModules);

        if (currentUser) {
          await Promise.all([fetchProgress(), fetchStreak()]);
        }
      } catch (error) {
        setError(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndModules();
  }, [currentUser, authUserProfile, navigate, selectedSubject, isInitialized]);

  const handleSubjectChange = (event, newSubject) => {
    if (newSubject) {
      setLoading(true);
      setSelectedSubject(newSubject);
    }
  };

  const handleVisualize = (mod) => {
    if (mod.visualizationLinks && mod.visualizationLinks.length > 0) {
      setVisualizationLinks(mod.visualizationLinks);
      setVisualizationTitle(mod.title);
      setVisualizationOpen(true);
    }
  };

  const handleQuiz = async (mod) => {
    setQuizOpen(true);
    setQuizTitle(mod.title);
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/generate', {
        subject: selectedSubject.toLowerCase(),
        module_title: mod.title
      }, { withCredentials: true });
      setQuizQuestions(res.data);
    } catch (err) {
      setQuizQuestions([]);
      setError('Failed to load quiz questions.');
    }
  };

  const handleExplore = (mod) => {
    setExploreModule(mod);
    setExploreOpen(true);
  };

  const handleLogout = async () => {
    try {
      setError('');
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(`Failed to log out: ${err.message}`);
    }
  };

  const handleChatbotOpen = () => {
    setChatbotOpen(true);
  };

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physics': return <ScienceIcon />;
      case 'chemistry': return <BiotechIcon />;
      case 'biology': return <BiologyIcon />;
      case 'maths': return <CalculateIcon />;
      default: return <ScienceIcon />;
    }
  };

  const getModuleIcon = (icon) => {
    if (icon === 'flask') return <BiotechIcon color="primary" />;
    if (icon === 'dna') return <BiologyIcon color="success" />;
    if (icon === 'atom') return <ScienceIcon color="secondary" />;
    return null;
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/progress', {
        params: { user_id: currentUser.uid },
        withCredentials: true
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/streak', {
        params: { user_id: currentUser.uid },
        withCredentials: true
      });
      setStreak(res.data.streak);
    } catch (err) {
      console.error('Failed to fetch streak:', err);
    }
  };

  const openLeaderboard = async (quiz_id, subject, standard) => {
    setLeaderboardQuiz({ quiz_id, subject, standard });
    setShowLeaderboard(true);
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/leaderboard', {
        params: { quiz_id, subject, standard },
        withCredentials: true
      });
      setLeaderboardData(res.data);
    } catch (err) {
      setLeaderboardData([]);
      setError('Failed to load leaderboard.');
    }
  };

  const closeLeaderboard = () => {
    setShowLeaderboard(false);
    setLeaderboardQuiz(null);
    setLeaderboardData([]);
  };

  const handleOpenExplanation = async (subject, moduleTitle) => {
    setExplanationOpen(true);
    setExplanationLoading(true);
    setExplanation('');
    setExplanationError('');
    setCurrentModule(moduleTitle);
    try {
      const res = await axios.post('http://localhost:5000/api/module/explanation', {
        subject: subject.toLowerCase(),
        module_title: moduleTitle
      }, { withCredentials: true });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanationError('Could not fetch explanation.');
    }
    setExplanationLoading(false);
  };

  const handleOpenImportant = async (subject, moduleTitle) => {
    setImportantOpen(true);
    setImportantLoading(true);
    setImportantTopics('');
    setImportantError('');
    setCurrentModule(moduleTitle);
    try {
      const res = await axios.post('http://localhost:5000/api/module/important_topics', {
        subject: subject.toLowerCase(),
        module_title: moduleTitle
      }, { withCredentials: true });
      setImportantTopics(res.data.important_topics);
    } catch (err) {
      setImportantError('Could not fetch important topics.');
    }
    setImportantLoading(false);
  };

  const handleOpenPyq = async (subject, moduleTitle) => {
    setPyqOpen(true);
    setPyqLoading(true);
    setPyqs('');
    setPyqError('');
    setCurrentModule(moduleTitle);
    try {
      const res = await axios.post('http://localhost:5000/api/module/previous_year_questions', {
        subject: subject.toLowerCase(),
        module_title: moduleTitle
      }, { withCredentials: true });
      setPyqs(res.data.previous_year_questions);
    } catch (err) {
      setPyqError('Could not fetch previous year questions.');
    }
    setPyqLoading(false);
  };

  if (!isInitialized || loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading Dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  if (!userProfile) {
    return null;
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: mode === 'dark' ? '#181818' : '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Welcome, {userProfile?.name || 'Student'}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="inline-flex" alignItems="center" ml={1}>
              <span role="img" aria-label="streak">🔥</span> {streak}
              <Tooltip title="Your daily streak increases if you complete at least one quiz each day. Missing a day resets your streak.">
                <InfoIcon color="action" fontSize="small" sx={{ ml: 0.5 }} />
              </Tooltip>
            </Box>
            <Button
              startIcon={mode === 'dark' ? <WbSunnyIcon /> : <NightlightIcon />}
              onClick={toggleTheme}
              variant="outlined"
              color="secondary"
            >
              {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button variant="contained" color="primary" onClick={handleChatbotOpen}>
              Chatbot
            </Button>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>
        <Box mb={2}>
          <Typography variant="h5" color="textSecondary">
            Class: {userProfile?.standard || 'XII'} | Subjects: {subjects.join(', ')}
          </Typography>
        </Box>
        <Tabs
          value={selectedSubject}
          onChange={handleSubjectChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ mb: 3 }}
        >
          {subjects.map((subject) => (
            <Tab key={subject} value={subject} label={subject} icon={getSubjectIcon(subject)} />
          ))}
        </Tabs>

        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Modules</Typography>
          <Grid container spacing={3}>
            {modules.map((mod, idx) => (
              <Grid item xs={12} sm={6} md={4} key={mod.id || idx}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 6,
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-8px) scale(1.03)', boxShadow: 12 },
                    background: mode === 'dark' ? '#23272f' : '#fff',
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      background: `url(${moduleImages[mod.title] || 'https://picsum.photos/seed/default/800/600'}) center/cover no-repeat`,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getModuleIcon(mod.icon)}
                      <Typography variant="h6" fontWeight="bold">{mod.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" mb={1}>{mod.summary}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-around', px: 2, pb: 2, mt: 'auto' }}>
                    <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
                      <Button onClick={() => handleOpenExplanation(selectedSubject, mod.title)} variant="outlined">Module Explanation</Button>
                      <Button onClick={() => handleOpenImportant(selectedSubject, mod.title)} variant="outlined">Important Topics</Button>
                      <Button onClick={() => handleOpenPyq(selectedSubject, mod.title)} variant="outlined">Previous Year Questions</Button>
                      <Button onClick={() => openLeaderboard(`${selectedSubject}_${mod.title}`, selectedSubject, userProfile?.standard)} variant="outlined">View Leaderboard</Button>
                      <Button onClick={() => handleQuiz(mod)} variant="contained" color="primary">Take Quiz</Button>
                      {mod.visualizationLinks && mod.visualizationLinks.length > 0 && (
                        <Button onClick={() => handleVisualize(mod)} variant="outlined">Visualize</Button>
                      )}
                      {selectedSubject === 'Physics' && (
                        <Button onClick={() => setArOpen(true)} variant="outlined" color="success">
                          View in AR
                        </Button>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} title={quizTitle} questions={quizQuestions} />
        <VisualizationModal open={visualizationOpen} onClose={() => setVisualizationOpen(false)} title={visualizationTitle} urls={visualizationLinks} />
        <ChatbotModal open={chatbotOpen} onClose={() => setChatbotOpen(false)} subjects={subjects} />
        <ExploreModal open={exploreOpen} onClose={() => setExploreOpen(false)} module={exploreModule} subject={selectedSubject} />
        <ARVisualizationModal open={arOpen} onClose={() => setArOpen(false)} />
        <Dialog open={showLeaderboard} onClose={closeLeaderboard} maxWidth="sm" fullWidth>
          <DialogTitle>Leaderboard for {leaderboardQuiz?.quiz_id}</DialogTitle>
          <DialogContent>
            <Leaderboard leaderboard={leaderboardData} currentUser={currentUser} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeLeaderboard}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={explanationOpen} onClose={() => setExplanationOpen(false)} maxWidth="md" fullWidth inert={explanationOpen ? undefined : ''}>
          <DialogTitle>Module Explanation - {currentModule}</DialogTitle>
          <DialogContent>
            {explanationLoading ? (
              <CircularProgress />
            ) : explanationError ? (
              <Typography color="error">{explanationError}</Typography>
            ) : (
              <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default', mb: 2 }}>
                <Typography variant="h6" gutterBottom>Explanation</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                  {explanation}
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExplanationOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={importantOpen} onClose={() => setImportantOpen(false)} maxWidth="md" fullWidth inert={importantOpen ? undefined : ''}>
          <DialogTitle>Important Topics - {currentModule}</DialogTitle>
          <DialogContent>
            {importantLoading ? <CircularProgress /> : importantError ? <Typography color="error">{importantError}</Typography> : <Box component="pre">{importantTopics}</Box>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportantOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={pyqOpen} onClose={() => setPyqOpen(false)} maxWidth="md" fullWidth inert={pyqOpen ? undefined : ''}>
          <DialogTitle>Previous Year Questions - {currentModule}</DialogTitle>
          <DialogContent>
            {pyqLoading ? <CircularProgress /> : pyqError ? <Typography color="error">{pyqError}</Typography> : <Box component="pre">{pyqs}</Box>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPyqOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Fab
        color="primary"
        aria-label="leaderboard"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}
        onClick={() => setShowLeaderboard(true)}
        inert={showLeaderboard ? '' : undefined}
      >
        <EmojiEventsIcon />
      </Fab>
    </div>
  );
}

export default Dashboard;