import { Router } from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middleware/auth.js'; // Added verifyToken

const router = Router();

const msgSchema = new mongoose.Schema({
  name: String, 
  email: String, 
  phone: String, 
  message: String,
  read: { type: Boolean, default: false } // Added read status
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', msgSchema);

// Public: Submit a message
router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json({ ok: true, id: msg._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: Get all messages for the dashboard
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Mark message as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: req.body.read });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Delete a message
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;