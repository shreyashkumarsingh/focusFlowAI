// server/controllers/taskController.js
const Task = require('../models/Task');

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    // We only find tasks where the 'user' field matches the ID of the person logged in
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', detail: err.message });
  }
};

// @desc    Create a new task for the logged-in user
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, estimatedMinutes } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      estimatedMinutes,
      user: req.user.id // Assign the task to the person who is logged in
    });
    
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create task', detail: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }
    
    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update task', detail: err.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Make sure the user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', detail: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };