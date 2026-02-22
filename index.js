require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS: Removed the trailing slash from the URL (Very Important!)
app.use(cors({
  origin: "https://frontend-course-registration-o1qgsivzt-manojlodhi9691s-projects.vercel.app", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

// Root Route for Vercel health check
app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

// --- DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        // Only start the server if DB connects
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err);
    });

// Export for Vercel Serverless
module.exports = app;