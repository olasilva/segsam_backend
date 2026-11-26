import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Vercel is running the correct file!' });
});

export default app;