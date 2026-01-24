require('dotenv').config(); // 1. Load secrets FIRST
const express = require('express'); 
const cors = require('cors'); 
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes'); //Import the routes
// 2. Connect to Database (Now it can see the MONGO_URI)
connectDB(); 

const app = express(); 

// 3. MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 
app.use('/api/tasks', taskRoutes);
// 4. ROUTES
app.get('/', (req, res) => {
    res.send('FocusFlow API is officially online.');
});

// 5. START SERVER
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server is purring on port ${PORT}`);
});