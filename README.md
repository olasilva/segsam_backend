# SegSam Paint: Backend (Node.js + Express)

API for the SegSam Paint website: works (portfolio posts with photos), quote requests, and admin login.

## Run locally
```bash
npm install
cp .env.example .env      # then edit .env (admin email/password, JWT_SECRET)
npm run dev               # http://localhost:5000
```

## Environment variables (.env)
| Variable | Purpose |
|---|---|
| `PORT` | Port to listen on (default 5000) |
| `CLIENT_ORIGIN` | URL of the React site, for CORS (comma separate for several) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The login used on the website's `/admin` page |
| `JWT_SECRET` | Long random string that signs login tokens |
| `DATA_DIR` / `UPLOAD_DIR` | Optional. Where `db.json` and uploaded photos are stored |

## API
| Method | Path | Access |
|---|---|---|
| GET | `/api/works?limit=6&category=Interior` | Public, newest first |
| GET | `/api/works/:id` | Public |
| POST | `/api/works` (multipart: title, category, location, completedAt, description, images[]) | Admin |
| PUT | `/api/works/:id` (same fields + `keepImages` JSON array of urls to keep, in order) | Admin |
| DELETE | `/api/works/:id` | Admin |
| POST | `/api/inquiries` | Public (quote form) |
| GET / PATCH `/:id/read` / DELETE `/:id` | `/api/inquiries` | Admin |
| POST | `/api/auth/login`, GET `/api/auth/me` | Login / check |

Photos: JPG, PNG or WebP, up to 12 per work and 12 MB each. The first photo is the cover.

## Deploying
- Data is a JSON file and photos are files on disk, so the host needs a **persistent disk/volume**.
  Point `DATA_DIR` and `UPLOAD_DIR` at it (Render disks, Railway volumes, a VPS folder, etc.).
  Without one, posts and photos are wiped on every redeploy.
- A ready-made `.env` is included (admin login and a generated JWT_SECRET). Keep it private, never upload it to GitHub, and change `ADMIN_PASSWORD` before launch.
- Set `CLIENT_ORIGIN` to the live website URL, and use a strong `ADMIN_PASSWORD` and `JWT_SECRET`.
- Run with `npm start`.
