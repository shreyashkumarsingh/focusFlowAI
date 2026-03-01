// server/controllers/userController.js
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', detail: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const updates = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updates.name = trimmedName;
    }

    if (bio !== undefined) {
      updates.bio = String(bio);
    }

    if (avatar !== undefined) {
      updates.avatar = String(avatar);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No profile fields provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update profile', detail: err.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
const updatePreferences = async (req, res) => {
  try {
    const existingUser = await User.findById(req.user.id).select('preferences');

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};

    if (req.body.theme !== undefined) {
      const allowedThemes = ['light', 'dark', 'auto'];
      if (!allowedThemes.includes(req.body.theme)) {
        return res.status(400).json({ message: 'Invalid theme value' });
      }
      updates['preferences.theme'] = req.body.theme;
    }

    if (req.body.defaultPomodoroLength !== undefined) {
      const pomodoroLength = Number(req.body.defaultPomodoroLength);
      if (!Number.isFinite(pomodoroLength) || pomodoroLength < 1 || pomodoroLength > 60) {
        return res.status(400).json({ message: 'defaultPomodoroLength must be a number between 1 and 60' });
      }
      updates['preferences.defaultPomodoroLength'] = pomodoroLength;
    }

    if (req.body.defaultBreakLength !== undefined) {
      const breakLength = Number(req.body.defaultBreakLength);
      if (!Number.isFinite(breakLength) || breakLength < 1 || breakLength > 30) {
        return res.status(400).json({ message: 'defaultBreakLength must be a number between 1 and 30' });
      }
      updates['preferences.defaultBreakLength'] = breakLength;
    }

    if (req.body.notifications !== undefined) {
      if (typeof req.body.notifications !== 'boolean') {
        return res.status(400).json({ message: 'notifications must be a boolean' });
      }
      updates['preferences.notifications'] = req.body.notifications;
    }

    if (req.body.weekStartDay !== undefined) {
      const allowedWeekStartDays = ['sunday', 'monday'];
      if (!allowedWeekStartDays.includes(req.body.weekStartDay)) {
        return res.status(400).json({ message: 'Invalid weekStartDay value' });
      }
      updates['preferences.weekStartDay'] = req.body.weekStartDay;
    }

    if (Object.keys(updates).length === 0) {
      const currentPreferences = existingUser.preferences || {
        theme: 'light',
        defaultPomodoroLength: 25,
        defaultBreakLength: 5,
        notifications: true,
        weekStartDay: 'monday'
      };
      return res.json({ preferences: currentPreferences });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('preferences');

    res.json({
      preferences: user?.preferences || {
        theme: 'light',
        defaultPomodoroLength: 25,
        defaultBreakLength: 5,
        notifications: true,
        weekStartDay: 'monday'
      }
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update preferences', detail: err.message });
  }
};

// @desc    Get user preferences
// @route   GET /api/users/preferences
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure preferences object exists
    if (!user.preferences) {
      user.preferences = {
        theme: 'light',
        defaultPomodoroLength: 25,
        defaultBreakLength: 5,
        notifications: true,
        weekStartDay: 'monday'
      };
      await user.save();
    }
    
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch preferences', detail: err.message });
  }
};

// @desc    Update daily study goal
// @route   PUT /api/users/study-goal
const updateStudyGoal = async (req, res) => {
  try {
    const { dailyStudyGoalMinutes } = req.body;
    
    if (!dailyStudyGoalMinutes || dailyStudyGoalMinutes < 1) {
      return res.status(400).json({ message: 'Valid dailyStudyGoalMinutes is required' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.dailyStudyGoalMinutes = dailyStudyGoalMinutes;
    await user.save();
    
    res.json({ 
      dailyStudyGoalMinutes: user.dailyStudyGoalMinutes,
      message: 'Study goal updated successfully'
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update study goal', detail: err.message });
  }
};

// @desc    Complete study session and update streak
// @route   PUT /api/users/study-session-complete
const completeStudySession = async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only add streak if not already completed today
    if (user.lastStudyStreakDate !== date) {
      user.studyTimerStreak += 1;
      user.lastStudyStreakDate = date;
      await user.save();
    }
    
    res.json({ 
      studyTimerStreak: user.studyTimerStreak,
      lastStudyStreakDate: user.lastStudyStreakDate
    });
  } catch (err) {
    res.status(400).json({ message: 'Failed to complete study session', detail: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  getPreferences,
  updateStudyGoal,
  completeStudySession
};
