import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { asyncHandler, requireAuth } from '../middleware.js';
import { upload, deleteUploads } from '../uploads.js';

const router = Router();
const MAX_IMAGES = 12;

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

function clean(body) {
  const title = String(body.title || '').trim();
  const category = String(body.category || 'Other').trim().slice(0, 40) || 'Other';
  const location = String(body.location || '').trim().slice(0, 100);
  const description = String(body.description || '').trim().slice(0, 4000);
  const completedAt = String(body.completedAt || '').trim().slice(0, 20);
  if (!title) return { error: 'Add a title for this work.' };
  if (title.length > 120) return { error: 'Keep the title under 120 characters.' };
  return { value: { title, category, location, description, completedAt } };
}

// Public: list works, newest first. ?category=Interior&limit=6
router.get('/', (req, res) => {
  const { category } = req.query;
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  let list = [...db.works].sort(newestFirst);
  if (category) list = list.filter((w) => w.category.toLowerCase() === String(category).toLowerCase());
  res.json(list.slice(0, limit));
});

router.get('/:id', (req, res) => {
  const work = db.works.find((w) => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Work not found.' });
  res.json(work);
});

router.post('/', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  const files = req.files || [];
  const parsed = clean(req.body);
  if (parsed.error) { await deleteUploads(files); return res.status(400).json({ error: parsed.error }); }
  if (!files.length) return res.status(400).json({ error: 'Add at least one image.' });

  const now = new Date().toISOString();
  const work = {
    id: randomUUID(),
    ...parsed.value,
    images: files.map((f) => `/uploads/${f.filename}`),
    createdAt: now,
    updatedAt: now,
  };
  db.works.push(work);
  await db.save();
  res.status(201).json(work);
}));

router.put('/:id', requireAuth, upload.array('images', MAX_IMAGES), asyncHandler(async (req, res) => {
  const files = req.files || [];
  const work = db.works.find((w) => w.id === req.params.id);
  if (!work) { await deleteUploads(files); return res.status(404).json({ error: 'Work not found.' }); }

  const parsed = clean(req.body);
  if (parsed.error) { await deleteUploads(files); return res.status(400).json({ error: parsed.error }); }

  let keep = work.images;
  if (req.body.keepImages !== undefined) {
    try {
      const wanted = JSON.parse(req.body.keepImages);
      keep = wanted.filter((u) => work.images.includes(u)); // keeps the order the admin chose
    } catch {
      await deleteUploads(files);
      return res.status(400).json({ error: 'Could not read the image list.' });
    }
  }
  const images = [...keep, ...files.map((f) => `/uploads/${f.filename}`)];
  if (!images.length) { await deleteUploads(files); return res.status(400).json({ error: 'A work needs at least one image.' }); }
  if (images.length > MAX_IMAGES) { await deleteUploads(files); return res.status(400).json({ error: `Use ${MAX_IMAGES} images or fewer.` }); }

  const removed = work.images.filter((u) => !keep.includes(u));
  Object.assign(work, parsed.value, { images, updatedAt: new Date().toISOString() });
  await db.save();
  await deleteUploads(removed);
  res.json(work);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const i = db.works.findIndex((w) => w.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Work not found.' });
  const [work] = db.works.splice(i, 1);
  await db.save();
  await deleteUploads(work.images);
  res.json({ ok: true });
}));

export default router;
