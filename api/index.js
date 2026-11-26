import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// 1. Import ALL your routes
import authRoutes from '../routes/auth.js';
import workRoutes from '../routes/works.js';
import contactRoutes from '../routes/contact.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

// DB Connection
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

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Root route
app.get('/', (req, res) => res.json({ status: 'online' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 2. Mount ALL your routes
app.use('/api/auth', authRoutes);
app.use('/api/works', workRoutes);
app.use('/api/contact', contactRoutes);

export default app;