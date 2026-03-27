import 'dotenv/config'; // Modern way to handle dotenv in ES Modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// --- IMPORT ROUTES (Note the .js extension) ---
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

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
    // Allows requests with no origin (like mobile apps or curl) or matching origins
    if (!origin || origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// --- ROUTE HANDLERS ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

// --- SERVER & DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        
        // Only start listening if not in production (or if you aren't using a serverless host like Vercel for backend)
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err);
    });

// In ES Modules, we use export default
export default app;