import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { initDb } from './db.js';
import { errorHandler } from './middleware.js';
import authRoutes from './routes/auth.js';
import workRoutes from './routes/works.js';
import inquiryRoutes from './routes/inquiries.js';

await initDb();

const app = express();
app.set('trust proxy', 1); // correct client IPs behind a host's proxy (rate limiting)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // lets the React site load /uploads images
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: '100kb' }));

app.use('/uploads', express.static(config.uploadDir, { maxAge: '30d', immutable: true }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/works', workRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);

app.listen(config.port, () => console.log(`SegSam Paint API running on http://localhost:${config.port}`));
