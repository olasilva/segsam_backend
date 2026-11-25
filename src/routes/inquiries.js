import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { db } from '../db.js';
import { asyncHandler, requireAuth } from '../middleware.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages from this connection. Please try again later or call us.' },
});

// Public: contact / quote form
router.post('/', contactLimiter, asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot: bots fill this in
  const name = String(b.name || '').trim().slice(0, 100);
  const phone = String(b.phone || '').trim().slice(0, 30);
  const email = String(b.email || '').trim().slice(0, 120);
  const service = String(b.service || '').trim().slice(0, 60);
  const message = String(b.message || '').trim().slice(0, 3000);
  if (!name) return res.status(400).json({ error: 'Enter your name.' });
  if (!phone && !email) return res.status(400).json({ error: 'Enter a phone number or email so we can reply.' });
  if (!message) return res.status(400).json({ error: 'Tell us a little about the job.' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'That email address looks incorrect.' });

  db.inquiries.push({ id: randomUUID(), name, phone, email, service, message, read: false, createdAt: new Date().toISOString() });
  await db.save();
  res.status(201).json({ ok: true });
}));

// Admin
router.get('/', requireAuth, (req, res) => {
  res.json([...db.inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.patch('/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const item = db.inquiries.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Message not found.' });
  item.read = req.body?.read !== false;
  await db.save();
  res.json(item);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const i = db.inquiries.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Message not found.' });
  db.inquiries.splice(i, 1);
  await db.save();
  res.json({ ok: true });
}));

export default router;
