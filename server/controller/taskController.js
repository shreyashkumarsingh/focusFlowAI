// server/controllers/taskController.js
const Task = require('../models/Task'); // Import our Task blueprint

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find(); // Find ALL tasks in the DB
        res.status(200).json(tasks);     // Send them back as JSON
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        // req.body contains the data sent from the frontend/Postman
        const newTask = await Task.create(req.body); 
        res.status(201).json(newTask); // 201 means "Created successfully"
    } catch (error) {
        res.status(400).json({ message: "Invalid Data", error: error.message });
    }
};
// At the bottom of taskController.js
module.exports = { getTasks, createTask };