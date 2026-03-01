// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please add a name'] },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'], 
        minlength: 6,
        select: false // Ensures password isn't returned in general queries
    },
    
    // Profile info
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    
    // User preferences
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
        defaultPomodoroLength: { type: Number, default: 25 },
        defaultBreakLength: { type: Number, default: 5 },
        notifications: { type: Boolean, default: true },
        weekStartDay: { type: String, enum: ['sunday', 'monday'], default: 'monday' }
    },
    
    // Streak & Goals
    taskStreak: { type: Number, default: 0 },
    studyTimerStreak: { type: Number, default: 0 },
    dailyStudyGoalMinutes: { type: Number, default: 120 },
    lastStudyStreakDate: { type: String, default: null },
    
    // AI Analytics & Insights
    aiMetrics: {
        procrastinationRiskScore: { type: Number, default: 0 },
        burnoutRiskScore: { type: Number, default: 0 },
        lastBurnoutCheckDate: { type: Date },
        focusPatterns: {
            bestHours: [Number],
            bestDays: [String],
            optimalSessionMinutes: { type: Number, default: 45 }
        },
        productivityScore: { type: Number, default: 0 },
        estimationAccuracy: { type: Number, default: 0 },
        averageTaskDifficulty: { type: Number, default: 50 },
        totalFocusSessionsCompleted: { type: Number, default: 0 }
    },
    
    // Habit tracking
    habits: [{
        name: String,
        value: String,
        strength: { type: String, enum: ['strong', 'medium', 'developing'], default: 'developing' },
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Statistics
    stats: {
        totalTasksCompleted: { type: Number, default: 0 },
        totalFocusMinutes: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActiveDate: { type: Date }
    }
}, { timestamps: true });

// ENCRYPTION: Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// NEW: Method to compare entered password with hashed password in DB
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);