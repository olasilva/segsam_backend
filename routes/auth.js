import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = Router();

// One-time setup — remove or protect after running once
router.post('/register', async (req, res) => {
  const { email, password, setupKey } = req.body;
  if (setupKey !== process.env.SETUP_KEY) return res.status(403).json({ error: 'Forbidden' });
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ email, passwordHash });
  res.json({ id: admin._id });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export default router;