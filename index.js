
require('dotenv').config();
const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
 // Loads your .env file

// Import Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Parses incoming JSON requests
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Allows React to talk to Node
app.use(cookieParser()); // Allows server to read cookies (if using them)

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
// --- DATABASE CONNECTION ---
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT,'0.0.0.0' ,() => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err);
    });