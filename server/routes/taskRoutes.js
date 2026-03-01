// server/routes/taskroutes.js
const express = require('express');
const router = express.Router();
const { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask 
} = require('../controllers/taskController');

// 1. Import the guard
const { protect } = require('../middleware/authMiddleware');

// 2. Add 'protect' to any route you want to keep private
// Now, a user MUST be logged in to do any of these
router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

module.exports = router;