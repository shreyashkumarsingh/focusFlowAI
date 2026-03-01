// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile,
  updatePreferences,
  getPreferences,
  updateStudyGoal,
  completeStudySession
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.put('/study-goal', protect, updateStudyGoal);
router.put('/study-session-complete', protect, completeStudySession);

module.exports = router;
