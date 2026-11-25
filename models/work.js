import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Residential' }, // Residential | Commercial | Interior | Exterior
  imageUrl: { type: String, required: true },
  clientName: String,
  location: String,
  completedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Work', workSchema);