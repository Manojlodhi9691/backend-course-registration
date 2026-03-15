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


const allowedOrigins = [
  "https://frontend-course-registration.vercel.app", 
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin || origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));


app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err);
    });


module.exports = app;