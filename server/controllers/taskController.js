// server/controllers/taskcontroller.js

const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    // We sort by -1 to show the newest tasks first
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', detail: err.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, estimatedMinutes, actualMinutesSpent, startTime, completedAt, user } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      estimatedMinutes,
      actualMinutesSpent,
      startTime,
      completedAt,
      user,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task', detail: err.message });
  }
};

// @desc    Update a task (e.g., mark as completed or add time spent)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    // { new: true } returns the updated document instead of the old one
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update task', detail: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', detail: err.message });
  }
};

module.exports = { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask 
};