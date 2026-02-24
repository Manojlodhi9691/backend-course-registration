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
// ✅ DYNAMIC CORS (Handles all your Vercel preview and production URLs)
// ✅ FLEXIBLE CORS: Handles all Vercel previews and your local machine
const allowedOrigins = [
  "https://frontend-course-registration.vercel.app", // Your main domain
  "http://localhost:5173"                           // Your local machine
];

// ✅ FLEXIBLE CORS: Handles all Vercel previews and your local machine
const allowedOrigins = [
  "https://frontend-course-registration.vercel.app", // Your main domain
  "http://localhost:5173"                           // Your local machine
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // 2. Allow any origin that ends with ".vercel.app" (Dynamic Previews)
    // 3. Allow your specifically listed origins
    if (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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