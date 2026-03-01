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
    dueDate: { type: Date },
    
    // Categories and Tags
    category: {
        type: String,
        enum: ['work', 'personal', 'health', 'learning', 'other'],
        default: 'other'
    },
    tags: [{
        type: String,
        trim: true
    }],
    
    // Enhanced features
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'none'],
        default: 'none'
    },
    notes: { type: String },
    subtasks: [{
        title: String,
        completed: { type: Boolean, default: false }
    }],
    
    // Focus sessions tracking
    focusSessions: [{
        startedAt: Date,
        duration: Number, // in minutes
        completed: Boolean
    }],
    
    // Ownership
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

// Index for better query performance
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, category: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);