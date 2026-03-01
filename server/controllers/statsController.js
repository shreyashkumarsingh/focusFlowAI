// server/controllers/statsController.js
const Task = require('../models/Task');
const User = require('../models/User');
const axios = require('axios');

// @desc    Get user statistics and analytics
// @route   GET /api/stats/overview
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all tasks for the user
    const tasks = await Task.find({ user: userId });
    
    // Calculate basic stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    
    // Calculate time stats
    const totalFocusMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutesSpent || 0), 0);
    const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    // Category breakdown
    const categoryStats = {};
    tasks.forEach(task => {
      const cat = task.category || 'other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, completed: 0 };
      }
      categoryStats[cat].total++;
      if (task.status === 'completed') categoryStats[cat].completed++;
    });
    
    // Priority breakdown
    const priorityStats = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
    
    res.json({
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionRate: parseFloat(completionRate),
        totalFocusMinutes,
        totalEstimatedMinutes,
        totalFocusHours: (totalFocusMinutes / 60).toFixed(1)
      },
      categoryStats,
      priorityStats,
      recentActivity: {
        tasksCreated: recentTasks.length,
        tasksCompleted: recentTasks.filter(t => t.status === 'completed').length
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch statistics', detail: err.message });
  }
};

// @desc    Get ML-powered burnout analysis
// @route   GET /api/stats/burnout
const getBurnoutAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId });
    
    // Call ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/analyze`, {
      tasks: tasks.map(t => ({
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutesSpent: t.actualMinutesSpent,
        priority: t.priority
      }))
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('ML Service Error:', err.message);
    res.status(500).json({ 
      message: 'Failed to analyze burnout risk',
      detail: err.message,
      fallback: {
        risk_level: 'unknown',
        risk_score: 0,
        factors: ['ML service unavailable']
      }
    });
  }
};

// @desc    Get productivity insights from ML
// @route   GET /api/stats/insights
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId });
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/insights`, {
      tasks: tasks.map(t => ({
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutesSpent: t.actualMinutesSpent,
        priority: t.priority
      }))
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('ML Service Error:', err.message);
    res.json({ 
      insights: ['Keep working to unlock AI-powered insights!']
    });
  }
};

// @desc    Get task prediction
// @route   POST /api/stats/predict
const predictTaskDuration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estimatedMinutes, priority } = req.body;
    
    const tasks = await Task.find({ user: userId, status: 'completed' });
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/predict`, {
      task: { estimatedMinutes, priority },
      history: tasks.map(t => ({
        estimatedMinutes: t.estimatedMinutes,
        actualMinutesSpent: t.actualMinutesSpent,
        priority: t.priority,
        status: t.status
      }))
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('ML Service Error:', err.message);
    res.json({
      predicted_minutes: req.body.estimatedMinutes || 30,
      confidence: 'low',
      suggestion: 'ML service unavailable'
    });
  }
};

// @desc    Get productivity trends over time
// @route   GET /api/stats/trends
const getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const tasks = await Task.find({ 
      user: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    // Group tasks by day
    const dailyStats = {};
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          created: 0,
          completed: 0,
          focusMinutes: 0
        };
      }
      dailyStats[date].created++;
      if (task.status === 'completed') {
        dailyStats[date].completed++;
        dailyStats[date].focusMinutes += task.actualMinutesSpent || 0;
      }
    });
    
    res.json({ trends: dailyStats });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trends', detail: err.message });
  }
};

module.exports = {
  getOverview,
  getBurnoutAnalysis,
  getInsights,
  predictTaskDuration,
  getTrends
};
