require('dotenv').config(); // 1. Load secrets FIRST
const express = require('express'); 
const cors = require('cors'); 
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 2. Connect to Database
connectDB(); 

const app = express(); 

// 3. MIDDLEWARE - Configure CORS for production
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.CLIENT_URL || 'http://localhost:5173'
        ].filter(Boolean);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json()); 

// 4. ROUTES
app.get('/', (req, res) => {
    res.json({
        service: 'FocusFlowAI API',
        status: 'operational',
        version: '3.0.0',
        ai_enabled: true,
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            stats: '/api/stats',
            users: '/api/users',
            ai: '/api/ai'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// 5. START SERVER
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`🚀 FocusFlowAI Server running on port ${PORT}`);
    console.log(`🤖 AI/ML Integration: Active - 12 Advanced AI Features`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});