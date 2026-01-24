// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    // Basic Task Info
    title: { 
        type: String, 
        required: [true, 'Please add a title'], 
        trim: true 
    },
    description: { type: String },
    
    // Status Logic
    status: { 
        type: String, 
        enum: ['todo', 'in-progress', 'completed'], 
        default: 'todo' 
    },

    // DATA FOR ML (The "Behavioral" data)
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    estimatedMinutes: { 
        type: Number, 
        default: 30 
    },
    actualMinutesSpent: { 
        type: Number, 
        default: 0 
    },
    
    // Time tracking for "Focus Decay" analysis
    startTime: { type: Date },
    completedAt: { type: Date },
    
    // Ownership
    user: {
        type: String, // We will link this to a real User ID in Phase 2
        required: true,
        default: "Guest_User"
    }
}, {
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Task', TaskSchema);