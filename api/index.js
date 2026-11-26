import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import workRoutes from '../routes/works.js'; // ONLY WORKS ROUTE

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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

// Only use Works route
app.use('/api/works', workRoutes);

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'Works route is fine' });
});

export default app;