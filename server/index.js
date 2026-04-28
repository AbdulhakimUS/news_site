const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const xss = require('xss');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tbgj_super_secret_jwt_key_2024';

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── PostgreSQL ───────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://journalistssite.netlify.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts' } });
app.use('/api/', apiLimiter);

// ─── DB Init ──────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      logo_url TEXT DEFAULT '',
      brand_name TEXT DEFAULT 'The Best Generations Journal',
      tg_link TEXT DEFAULT '',
      insta_link TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      photo_path TEXT DEFAULT '',
      hashtags TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      title_uz TEXT DEFAULT '', author_info_uz TEXT DEFAULT '', abstract_uz TEXT DEFAULT '', keywords_uz TEXT DEFAULT '', introduction_uz TEXT DEFAULT '', literature_review_uz TEXT DEFAULT '', methodology_uz TEXT DEFAULT '', analysis_results_uz TEXT DEFAULT '', conclusion_uz TEXT DEFAULT '', references_uz TEXT DEFAULT '',
      title_ru TEXT DEFAULT '', author_info_ru TEXT DEFAULT '', abstract_ru TEXT DEFAULT '', keywords_ru TEXT DEFAULT '', introduction_ru TEXT DEFAULT '', literature_review_ru TEXT DEFAULT '', methodology_ru TEXT DEFAULT '', analysis_results_ru TEXT DEFAULT '', conclusion_ru TEXT DEFAULT '', references_ru TEXT DEFAULT '',
      title_en TEXT DEFAULT '', author_info_en TEXT DEFAULT '', abstract_en TEXT DEFAULT '', keywords_en TEXT DEFAULT '', introduction_en TEXT DEFAULT '', literature_review_en TEXT DEFAULT '', methodology_en TEXT DEFAULT '', analysis_results_en TEXT DEFAULT '', conclusion_en TEXT DEFAULT '', references_en TEXT DEFAULT ''
    );
  `);

  const s = await pool.query('SELECT id FROM settings WHERE id = 1');
  if (s.rows.length === 0) {
    await pool.query('INSERT INTO settings (id, brand_name) VALUES (1, $1)', ['The Best Generations Journal']);
  }

  const a = await pool.query('SELECT id FROM admins WHERE username = $1', ['nuriddinova']);
  if (a.rows.length === 0) {
    const hashed = bcrypt.hashSync('nuriddinova', 12);
    await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['nuriddinova', hashed]);
  }

  console.log('✅ PostgreSQL connected and initialized');
}

initDB().catch(console.error);

// ─── Multer + Cloudinary ──────────────────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'tbgj',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`,
  }),
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const sanitize = (val) => (typeof val === 'string' ? xss(val.trim()) : val);

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  const r = await pool.query('SELECT * FROM settings WHERE id = 1');
  res.json(r.rows[0] || {});
});

app.get('/api/articles', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const total = (await pool.query('SELECT COUNT(*) as c FROM articles')).rows[0].c;
  const articles = (await pool.query('SELECT * FROM articles ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])).rows;
  res.json({ articles: articles.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') })), total, page, pages: Math.ceil(total / limit) });
});

app.get('/api/articles/featured', async (req, res) => {
  const r = await pool.query('SELECT * FROM articles ORDER BY created_at DESC LIMIT 1');
  if (!r.rows[0]) return res.json(null);
  const a = r.rows[0];
  res.json({ ...a, hashtags: JSON.parse(a.hashtags || '[]') });
});

app.get('/api/articles/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  const a = r.rows[0];
  res.json({ ...a, hashtags: JSON.parse(a.hashtags || '[]') });
});

app.get('/api/articles/:id/recommendations', async (req, res) => {
  const r = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
  if (!r.rows[0]) return res.json([]);
  const tags = JSON.parse(r.rows[0].hashtags || '[]');
  if (!tags.length) return res.json([]);
  const all = (await pool.query('SELECT * FROM articles WHERE id != $1', [req.params.id])).rows;
  const recommendations = all
    .map(a => {
      const aTags = JSON.parse(a.hashtags || '[]');
      const matches = tags.filter(t => aTags.includes(t)).length;
      return { ...a, hashtags: aTags, _matches: matches };
    })
    .filter(a => a._matches > 0)
    .sort((a, b) => b._matches - a._matches)
    .slice(0, 6);
  res.json(recommendations);
});

app.get('/api/search', async (req, res) => {
  const q = sanitize(req.query.q || '');
  const lang = req.query.lang || 'uz';
  if (!q) return res.json([]);
  const results = await pool.query(
    `SELECT * FROM articles WHERE title_${lang} ILIKE $1 OR abstract_${lang} ILIKE $1 OR keywords_${lang} ILIKE $1 ORDER BY created_at DESC LIMIT 20`,
    [`%${q}%`]
  );
  res.json(results.rows.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') })));
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────
app.post('/api/admin/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const r = await pool.query('SELECT * FROM admins WHERE username = $1', [sanitize(username)]);
  const admin = r.rows[0];
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

app.get('/api/admin/articles', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
  res.json(r.rows.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') })));
});

app.post('/api/admin/articles', requireAuth, upload.single('photo'), async (req, res) => {
  const data = req.body;
  const langs = ['uz', 'ru', 'en'];
  const fields = ['title', 'author_info', 'abstract', 'keywords', 'introduction', 'literature_review', 'methodology', 'analysis_results', 'conclusion', 'references'];
  const cols = langs.flatMap(l => fields.map(f => `${f}_${l}`));
  const vals = langs.flatMap(l => fields.map(f => sanitize(data[`${f}_${l}`] || '')));
  const hashtags = JSON.stringify(
    (data.hashtags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  );
  const photo_path = req.file ? req.file.path : '';
  const placeholders = cols.map((_, i) => `$${i + 3}`).join(', ');
  const r = await pool.query(
    `INSERT INTO articles (photo_path, hashtags, ${cols.join(', ')}) VALUES ($1, $2, ${placeholders}) RETURNING *`,
    [photo_path, hashtags, ...vals]
  );
  const a = r.rows[0];
  res.json({ ...a, hashtags: JSON.parse(a.hashtags) });
});

app.put('/api/admin/articles/:id', requireAuth, upload.single('photo'), async (req, res) => {
  const existing = (await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id])).rows[0];
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const data = req.body;
  const langs = ['uz', 'ru', 'en'];
  const fields = ['title', 'author_info', 'abstract', 'keywords', 'introduction', 'literature_review', 'methodology', 'analysis_results', 'conclusion', 'references'];
  const cols = langs.flatMap(l => fields.map(f => `${f}_${l}`));
  const vals = langs.flatMap(l => fields.map(f => sanitize(data[`${f}_${l}`] || '')));
  const hashtags = JSON.stringify(
    (data.hashtags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  );
  const photo_path = req.file ? req.file.path : existing.photo_path;
  const updates = cols.map((c, i) => `${c} = $${i + 3}`).join(', ');
  const r = await pool.query(
    `UPDATE articles SET photo_path = $1, hashtags = $2, ${updates} WHERE id = $${cols.length + 3} RETURNING *`,
    [photo_path, hashtags, ...vals, req.params.id]
  );
  const a = r.rows[0];
  res.json({ ...a, hashtags: JSON.parse(a.hashtags) });
});

app.delete('/api/admin/articles/:id', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
  const article = r.rows[0];
  if (!article) return res.status(404).json({ error: 'Not found' });
  if (article.photo_path) {
    const publicId = article.photo_path.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    cloudinary.uploader.destroy(publicId).catch(console.error);
  }
  await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

app.put('/api/admin/settings', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    const { brand_name, tg_link, insta_link } = req.body;
    const logo_url = req.file ? req.file.path : req.body.logo_url;
    await pool.query(
      'UPDATE settings SET brand_name = $1, tg_link = $2, insta_link = $3, logo_url = $4 WHERE id = 1',
      [sanitize(brand_name || ''), sanitize(tg_link || ''), sanitize(insta_link || ''), sanitize(logo_url || '')]
    );
    const r = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ TBGJ Server running on http://localhost:${PORT}`));
