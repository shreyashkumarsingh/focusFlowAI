// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const {
  getComprehensiveInsights,
  getProcrastinationRisk,
  getFocusPatterns,
  getDifficultyScore,
  generateSchedule,
  getFocusCoach,
  breakDownTask,
  getBurnoutAnalysis,
  recommendResources,
  getHabitAnalysis,
  getMemoryRetention,
  getDeadlineRisk,
  getKnowledgeGaps,
  generateAdaptiveExam,
  getAIDashboard
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protected AI routes
router.get('/insights', protect, getComprehensiveInsights);
router.get('/dashboard', protect, getAIDashboard);
router.get('/procrastination', protect, getProcrastinationRisk);
router.get('/focus-patterns', protect, getFocusPatterns);
router.get('/burnout', protect, getBurnoutAnalysis);
router.get('/habits', protect, getHabitAnalysis);
router.get('/memory-retention', protect, getMemoryRetention);
router.get('/deadline-risk', protect, getDeadlineRisk);
router.get('/knowledge-gaps', protect, getKnowledgeGaps);

router.post('/difficulty-score', protect, getDifficultyScore);
router.post('/schedule', protect, generateSchedule);
router.post('/focus-coach', protect, getFocusCoach);
router.post('/breakdown-task', protect, breakDownTask);
router.post('/recommend-resources', protect, recommendResources);
router.post('/adaptive-exam', protect, generateAdaptiveExam);

module.exports = router;
