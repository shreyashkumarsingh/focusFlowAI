// server/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getOverview, 
  getBurnoutAnalysis, 
  getInsights,
  predictTaskDuration,
  getTrends
} = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (require authentication)
router.get('/overview', protect, getOverview);
router.get('/burnout', protect, getBurnoutAnalysis);
router.get('/insights', protect, getInsights);
router.post('/predict', protect, predictTaskDuration);
router.get('/trends', protect, getTrends);

module.exports = router;
