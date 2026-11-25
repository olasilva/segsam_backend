import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

// Small JSON-file store: plenty for a portfolio site. Writes are queued and atomic.
const file = path.join(config.dataDir, 'db.json');
const state = { works: [], inquiries: [] };
let queue = Promise.resolve();

function save() {
  queue = queue.then(async () => {
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2));
    await fs.rename(tmp, file);
  });
  return queue;
}

export async function initDb() {
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.mkdir(config.uploadDir, { recursive: true });
  try {
    const saved = JSON.parse(await fs.readFile(file, 'utf8'));
    state.works = saved.works || [];
    state.inquiries = saved.inquiries || [];
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    await save();
  }
}

export const db = {
  get works() { return state.works; },
  get inquiries() { return state.inquiries; },
  save,
};
