// server/controllers/aiController.js
const User = require('../models/User');
const Task = require('../models/Task');

// Helper to call ML service
const callMLService = async (endpoint, data) => {
  try {
    const response = await fetch(`http://localhost:5001${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (err) {
    console.error(`ML Service error at ${endpoint}:`, err);
    return null;
  }
};

// @desc    Get comprehensive AI insights
// @route   GET /api/ai/insights
const getComprehensiveInsights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ userId: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Call multiple ML endpoints
    const [procrastination, burnout, focusPatterns, habits, breakdowns] = await Promise.all([
      callMLService('/procrastination-risk', { tasks, user_behavior: {} }),
      callMLService('/analyze', { tasks }),
      callMLService('/focus-patterns', { tasks }),
      callMLService('/analyze-habits', { tasks }),
      callMLService('/breakdown-task', { 
        title: tasks[0]?.title || '', 
        estimatedMinutes: tasks[0]?.estimatedMinutes || 60,
        history: tasks
      })
    ]);

    // Update user metrics
    user.aiMetrics.procrastinationRiskScore = procrastination?.score || 0;
    user.aiMetrics.burnoutRiskScore = burnout?.risk_score || 0;
    user.aiMetrics.focusPatterns = focusPatterns || {};
    user.aiMetrics.lastBurnoutCheckDate = new Date();
    
    await user.save();

    res.json({
      procrastination,
      burnout,
      focusPatterns,
      habits,
      taskBreakdown: breakdowns
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get insights', detail: err.message });
  }
};

// @desc    Get procrastination detection
// @route   GET /api/ai/procrastination
const getProcrastinationRisk = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    
    const result = await callMLService('/procrastination-risk', { 
      tasks,
      user_behavior: {}
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Procrastination analysis failed', detail: err.message });
  }
};

// @desc    Get focus patterns
// @route   GET /api/ai/focus-patterns
const getFocusPatterns = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    
    const result = await callMLService('/focus-patterns', { tasks });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Focus pattern analysis failed', detail: err.message });
  }
};

// @desc    Get adaptive difficulty for a task
// @route   POST /api/ai/difficulty-score
const getDifficultyScore = async (req, res) => {
  try {
    const { taskId } = req.body;
    const tasks = await Task.find({ userId: req.user.id });
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const result = await callMLService('/difficulty-score', {
      task,
      history: tasks
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Difficulty calculation failed', detail: err.message });
  }
};

// @desc    Generate optimized study schedule
// @route   POST /api/ai/schedule
const generateSchedule = async (req, res) => {
  try {
    const { availableHours = 4 } = req.body;
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ userId: req.user.id });

    const focusPatterns = user.aiMetrics.focusPatterns || {
      bestHours: [9, 14, 19],
      optimalSessionMinutes: 45
    };

    const result = await callMLService('/generate-schedule', {
      tasks,
      focus_patterns: focusPatterns,
      available_hours: availableHours
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Schedule generation failed', detail: err.message });
  }
};

// @desc    Get real-time focus coach message
// @route   POST /api/ai/focus-coach
const getFocusCoach = async (req, res) => {
  try {
    const { elapsedMinutes, difficultyScore } = req.body;
    const user = await User.findById(req.user.id);

    const focusPatterns = user.aiMetrics.focusPatterns || {
      optimalSessionMinutes: 45
    };

    const result = await callMLService('/focus-coach', {
      elapsed_minutes: elapsedMinutes,
      difficulty_score: difficultyScore,
      focus_patterns: focusPatterns
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Focus coach failed', detail: err.message });
  }
};

// @desc    Break down complex task
// @route   POST /api/ai/breakdown-task
const breakDownTask = async (req, res) => {
  try {
    const { title, estimatedMinutes } = req.body;
    const tasks = await Task.find({ userId: req.user.id });

    const result = await callMLService('/breakdown-task', {
      title,
      estimatedMinutes,
      history: tasks
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Task breakdown failed', detail: err.message });
  }
};

// @desc    Get burnout analysis
// @route   GET /api/ai/burnout
const getBurnoutAnalysis = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });

    const result = await callMLService('/analyze', { tasks });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Burnout analysis failed', detail: err.message });
  }
};

// @desc    Get learning resource recommendations
// @route   POST /api/ai/recommend-resources
const recommendResources = async (req, res) => {
  try {
    const { title, category, difficultyScore = 50 } = req.body;

    const result = await callMLService('/recommend-resources', {
      title,
      category,
      difficulty_score: difficultyScore
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Resource recommendation failed', detail: err.message });
  }
};

// @desc    Get habit analysis
// @route   GET /api/ai/habits
const getHabitAnalysis = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });

    const result = await callMLService('/analyze-habits', { tasks });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Habit analysis failed', detail: err.message });
  }
};

// @desc    Get memory retention analysis
// @route   GET /api/ai/memory-retention
const getMemoryRetention = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    const result = await callMLService('/memory-retention', { tasks });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Memory retention analysis failed', detail: err.message });
  }
};

// @desc    Get deadline miss risk simulation
// @route   GET /api/ai/deadline-risk
const getDeadlineRisk = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ userId: req.user.id });
    const dailyCapacityMinutes = user?.dailyStudyGoalMinutes || 120;

    const result = await callMLService('/deadline-simulation', {
      tasks,
      daily_capacity_minutes: dailyCapacityMinutes
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Deadline risk simulation failed', detail: err.message });
  }
};

// @desc    Get knowledge graph gap analysis
// @route   GET /api/ai/knowledge-gaps
const getKnowledgeGaps = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    const result = await callMLService('/knowledge-gaps', { tasks });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Knowledge gap analysis failed', detail: err.message });
  }
};

// @desc    Generate adaptive exam
// @route   POST /api/ai/adaptive-exam
const generateAdaptiveExam = async (req, res) => {
  try {
    const { questionCount = 8 } = req.body;
    const tasks = await Task.find({ userId: req.user.id });
    const result = await callMLService('/adaptive-exam', {
      tasks,
      question_count: questionCount
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Adaptive exam generation failed', detail: err.message });
  }
};

// @desc    Get AI dashboard data
// @route   GET /api/ai/dashboard
const getAIDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = await Task.find({ userId: req.user.id });

    // Fetch all analytics in parallel
    const [procrastination, burnout, focusPatterns, habits, resources, memoryRetention, deadlineRisk, knowledgeGaps, adaptiveExam] = await Promise.all([
      callMLService('/procrastination-risk', { tasks, user_behavior: {} }),
      callMLService('/analyze', { tasks }),
      callMLService('/focus-patterns', { tasks }),
      callMLService('/analyze-habits', { tasks }),
      callMLService('/recommend-resources', { 
        title: 'General Learning',
        category: 'learning',
        difficulty_score: 50
      }),
      callMLService('/memory-retention', { tasks }),
      callMLService('/deadline-simulation', {
        tasks,
        daily_capacity_minutes: user?.dailyStudyGoalMinutes || 120
      }),
      callMLService('/knowledge-gaps', { tasks }),
      callMLService('/adaptive-exam', { tasks, question_count: 5 })
    ]);

    res.json({
      user: {
        name: user.name,
        aiMetrics: user.aiMetrics,
        taskStreak: user.taskStreak,
        studyTimerStreak: user.studyTimerStreak
      },
      analytics: {
        procrastination,
        burnout,
        focusPatterns,
        habits,
        memoryRetention,
        deadlineRisk,
        knowledgeGaps,
        adaptiveExam
      },
      recommendations: resources,
      taskCount: tasks.length,
      completedCount: tasks.filter(t => t.status === 'completed').length
    });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard data failed', detail: err.message });
  }
};

module.exports = {
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
};
