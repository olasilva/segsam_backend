import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@segsam.com';
    const password = 'SegsamPassword2026!'; // <-- CHANGE THIS TO YOUR DESIRED PASSWORD

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save to database
    await Admin.create({ email, passwordHash });
    console.log('✅ Admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

createAdmin();