import { Router } from 'express';
import Work from '../models/Work.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config (stores file in memory temporarily)
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'segsam_works' }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    }).end(buffer);
  });
};

// Public
router.get('/', async (_, res) => {
  try {
    const works = await Work.find().sort({ completedAt: -1 });
    res.json(works);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    res.json(work);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Protected (admin) - ADDED upload.array('images', 10)
router.post('/', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    const workData = { ...req.body, images: imageUrls };
    const work = await Work.create(workData);
    res.status(201).json(work);
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
});

router.put('/:id', verifyToken, upload.array('images', 10), async (req, res) => {
  try {
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }

    const workData = { ...req.body };
    if (imageUrls.length > 0) {
      workData.images = imageUrls;
    }

    const work = await Work.findByIdAndUpdate(req.params.id, workData, { new: true });
    res.json(work);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Work.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;