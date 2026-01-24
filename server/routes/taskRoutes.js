// server/routes/taskroutes.js
const express = require('express');
const router = express.Router();

// 1. Import all four controller functions
const { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask 
} = require('../controllers/taskController');

// 2. Route for the root path: /api/tasks
// GET /api/tasks -> Fetches all tasks
// POST /api/tasks -> Creates a new task
router.route('/')
    .get(getTasks)
    .post(createTask);

// 3. Route for specific tasks: /api/tasks/:id
// The ":id" is a placeholder for the MongoDB _id
// PUT /api/tasks/123 -> Updates task with ID 123
// DELETE /api/tasks/123 -> Deletes task with ID 123
router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;