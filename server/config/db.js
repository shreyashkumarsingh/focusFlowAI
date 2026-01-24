// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Fail fast if the connection string is missing
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set in .env');
        }

        // We use await because connecting to a cloud database takes time
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Stop the server if the database fails
    }
};

module.exports = connectDB;