import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { requireAuth } from '../middleware.js';

const router = Router();
const adminHash = bcrypt.hashSync(config.adminPassword, 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const ok = email === config.adminEmail && bcrypt.compareSync(password, adminHash);
  if (!ok) return res.status(401).json({ error: 'Email or password is incorrect.' });
  const token = jwt.sign({ role: 'admin', email }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, email });
});

router.get('/me', requireAuth, (req, res) => res.json({ email: req.admin.email }));

export default router;
