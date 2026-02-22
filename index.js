
require('dotenv').config();


const mongoose = require('mongoose');require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ✅ Middleware
app.use(express.json());

app.use(cors({
  // Replace the URL below with your actual LIVE Frontend URL from Vercel
  origin: "https://frontend-course-registration-o1qgsivzt-manojlodhi9691s-projects.vercel.app/", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(cookieParser());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

// ✅ Root Route (IMPORTANT)
app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running");
    });

  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });

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