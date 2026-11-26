import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import your routes
import authRoutes from '../routes/auth.js';
import workRoutes from '../routes/works.js';
import contactRoutes from '../routes/contact.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

// --- MONGODB CONNECTION LOGIC ---
// This caches the connection so Vercel doesn't crash from opening too many connections
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware to ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    // If DB fails, we send the exact error so you know what's wrong in Vercel
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message,
      hint: 'Check your MONGO_URI in Vercel Environment Variables and ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas.'
    });
  }
});

// --- ROUTES ---
// Root route (so you don't get "Cannot GET /")
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'SegSam Paint Backend API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      works: '/api/works',
      contact: '/api/contact'
    }
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    ok: true, 
    message: 'Vercel is running the correct file!', 
    database: dbStatus 
  });
});

// Your custom routes
app.use('/api/auth', authRoutes);
app.use('/api/works', workRoutes);
app.use('/api/contact', contactRoutes);

// Export the app for Vercel
export default app;