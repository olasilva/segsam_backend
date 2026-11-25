import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { config } from './config.js';

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.uploadDir),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (EXT[file.mimetype]) return cb(null, true);
    const err = new Error('Only JPG, PNG or WebP images are allowed.');
    err.status = 400;
    cb(err);
  },
});

// Accepts "/uploads/name.jpg" urls or multer file objects. basename() blocks path tricks.
export async function deleteUploads(items = []) {
  await Promise.all(
    items.map(async (item) => {
      const name = path.basename(typeof item === 'string' ? item : item.filename || '');
      if (!name) return;
      try { await fs.unlink(path.join(config.uploadDir, name)); } catch { /* already gone */ }
    })
  );
}
