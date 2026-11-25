import 'dotenv/config';
import path from 'node:path';

const required = ['JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  dataDir: path.resolve(process.env.DATA_DIR || './data'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
};
