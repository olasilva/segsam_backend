import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from './db.js';
import authRoutes from './routes/auth.js';
import workRoutes from './routes/works.js';
import contactRoutes from './routes/contact.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/works', workRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', async (_, res) => {
  try {
    const { rows } = await sql`SELECT 1 as ok`;
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

export default app;