import { Router } from 'express';
import Work from '../models/Work.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', async (_, res) => {
  const works = await Work.find().sort({ completedAt: -1 });
  res.json(works);
});
router.get('/:id', async (req, res) => {
  const work = await Work.findById(req.params.id);
  res.json(work);
});

// Protected (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const work = await Work.create(req.body);
    res.status(201).json(work);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.put('/:id', verifyToken, async (req, res) => {
  const work = await Work.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(work);
});
router.delete('/:id', verifyToken, async (req, res) => {
  await Work.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;