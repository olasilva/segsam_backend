import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    req.admin = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

export function errorHandler(err, req, res, _next) {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Each image must be 12 MB or smaller.' });
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'You can upload up to 12 images per work.' });
  }
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
}
