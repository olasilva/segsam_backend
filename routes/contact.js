import { Router } from 'express';
import mongoose from 'mongoose';
const router = Router();

const msgSchema = new mongoose.Schema({
  name: String, email: String, phone: String, message: String,
}, { timestamps: true });
const Message = mongoose.models.Message || mongoose.model('Message', msgSchema);

router.post('/', async (req, res) => {
  const msg = await Message.create(req.body);
  res.status(201).json({ ok: true, id: msg._id });
});

export default router;