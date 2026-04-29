/**
 * The Best Generations Journal - Express Server
 * Handles: Auth, Articles CRUD, Settings, File Uploads
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const multer = require('multer');
const xss = require('xss');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tbgj_super_secret_jwt_key_2024';

// ─── Uploads Directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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
app.use('/uploads', express.static(uploadsDir));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts' } });
app.use('/api/', apiLimiter);

// ─── SQLite Database Setup ────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'tbgj.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    logo_url TEXT DEFAULT '',
    brand_name TEXT DEFAULT 'The Best Generations Journal',
    tg_link TEXT DEFAULT '',
    insta_link TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_path TEXT DEFAULT '',
    hashtags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Uzbek
    title_uz TEXT DEFAULT '',
    author_info_uz TEXT DEFAULT '',
    abstract_uz TEXT DEFAULT '',
    keywords_uz TEXT DEFAULT '',
    introduction_uz TEXT DEFAULT '',
    literature_review_uz TEXT DEFAULT '',
    methodology_uz TEXT DEFAULT '',
    analysis_results_uz TEXT DEFAULT '',
    conclusion_uz TEXT DEFAULT '',
    references_uz TEXT DEFAULT '',
    -- Russian
    title_ru TEXT DEFAULT '',
    author_info_ru TEXT DEFAULT '',
    abstract_ru TEXT DEFAULT '',
    keywords_ru TEXT DEFAULT '',
    introduction_ru TEXT DEFAULT '',
    literature_review_ru TEXT DEFAULT '',
    methodology_ru TEXT DEFAULT '',
    analysis_results_ru TEXT DEFAULT '',
    conclusion_ru TEXT DEFAULT '',
    references_ru TEXT DEFAULT '',
    -- English
    title_en TEXT DEFAULT '',
    author_info_en TEXT DEFAULT '',
    abstract_en TEXT DEFAULT '',
    keywords_en TEXT DEFAULT '',
    introduction_en TEXT DEFAULT '',
    literature_review_en TEXT DEFAULT '',
    methodology_en TEXT DEFAULT '',
    analysis_results_en TEXT DEFAULT '',
    conclusion_en TEXT DEFAULT '',
    references_en TEXT DEFAULT ''
  );
`);

// ─── Seed Initial Data ────────────────────────────────────────────────────────
const seedDB = db.transaction(() => {
  // Settings row
  const settingsRow = db.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!settingsRow) {
    db.prepare('INSERT INTO settings (id, brand_name) VALUES (1, ?)').run('The Best Generations Journal');
  }

  // Admin user
  const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('nuriddinova');
  if (!adminExists) {
    const hashed = bcrypt.hashSync('nuriddinova', 12);
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('nuriddinova', hashed);
  }

  // Sample articles (Lorem Ipsum placeholders)
  const articleCount = db.prepare('SELECT COUNT(*) as c FROM articles').get().c;
  if (articleCount === 0) {
    const loremTitle = {
      uz: 'Lorem Ipsum Sarlavha',
      ru: 'Lorem Ipsum Заголовок',
      en: 'Lorem Ipsum Header',
    };
    const loremText = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.';
    const loremAuthor = { uz: 'Muallif Ma\'lumoti', ru: 'Информация об авторе', en: 'Author Information' };
    
    const hashtagSets = [
      '["ilm","tadqiqot","tarix"]',
      '["ilm","fan","zamonaviy"]',
      '["tarix","madaniyat","meros"]',
      '["fan","texnologiya","innovatsiya"]',
      '["tadqiqot","metodologiya","tahlil"]',
      '["madaniyat","san\'at","adabiyot"]',
    ];

    const insertArticle = db.prepare(`
      INSERT INTO articles (hashtags, title_uz, author_info_uz, abstract_uz, keywords_uz, introduction_uz, literature_review_uz, methodology_uz, analysis_results_uz, conclusion_uz, references_uz,
        title_ru, author_info_ru, abstract_ru, keywords_ru, introduction_ru, literature_review_ru, methodology_ru, analysis_results_ru, conclusion_ru, references_ru,
        title_en, author_info_en, abstract_en, keywords_en, introduction_en, literature_review_en, methodology_en, analysis_results_en, conclusion_en, references_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < 6; i++) {
      insertArticle.run(
        hashtagSets[i],
        `${loremTitle.uz} ${i + 1}`, loremAuthor.uz, loremText, 'ilm, tadqiqot', loremText, loremText, loremText, loremText, loremText, '1. Lorem Ipsum Reference',
        `${loremTitle.ru} ${i + 1}`, loremAuthor.ru, loremText, 'наука, исследование', loremText, loremText, loremText, loremText, loremText, '1. Lorem Ipsum Reference',
        `${loremTitle.en} ${i + 1}`, loremAuthor.en, loremText, 'science, research', loremText, loremText, loremText, loremText, loremText, '1. Lorem Ipsum Reference',
      );
    }
  }
});

seedDB();

// ─── Multer File Upload ───────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tbgj',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
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

// ─── Sanitize Helper ─────────────────────────────────────────────────────────
const sanitize = (val) => (typeof val === 'string' ? xss(val.trim()) : val);

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/settings
app.get('/api/settings', (req, res) => {
  const s = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(s || {});
});

// GET /api/articles — list with pagination
app.get('/api/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const total = db.prepare('SELECT COUNT(*) as c FROM articles').get().c;
  const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  const parsed = articles.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') }));
  res.json({ articles: parsed, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/articles/featured — newest article
app.get('/api/articles/featured', (req, res) => {
  const article = db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT 1').get();
  if (!article) return res.json(null);
  res.json({ ...article, hashtags: JSON.parse(article.hashtags || '[]') });
});

// GET /api/articles/:id
app.get('/api/articles/:id', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found' });
  res.json({ ...article, hashtags: JSON.parse(article.hashtags || '[]') });
});

// GET /api/articles/:id/recommendations
app.get('/api/articles/:id/recommendations', (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json([]);
  const tags = JSON.parse(article.hashtags || '[]');
  if (!tags.length) return res.json([]);

  const all = db.prepare('SELECT * FROM articles WHERE id != ?').all(req.params.id);
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

// GET /api/search
app.get('/api/search', (req, res) => {
  const q = sanitize(req.query.q || '');
  const lang = req.query.lang || 'uz';
  if (!q) return res.json([]);

  const results = db.prepare(`
    SELECT * FROM articles 
    WHERE title_${lang} LIKE ? OR abstract_${lang} LIKE ? OR keywords_${lang} LIKE ?
    ORDER BY created_at DESC LIMIT 20
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);

  res.json(results.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') })));
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(sanitize(username));
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

// GET /api/admin/articles — all articles for admin
app.get('/api/admin/articles', requireAuth, (req, res) => {
  const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
  res.json(articles.map(a => ({ ...a, hashtags: JSON.parse(a.hashtags || '[]') })));
});

// POST /api/admin/articles
app.post('/api/admin/articles', requireAuth, upload.single('photo'), (req, res) => {
  const data = req.body;
  const langs = ['uz', 'ru', 'en'];
  const fields = ['title', 'author_info', 'abstract', 'keywords', 'introduction', 'literature_review', 'methodology', 'analysis_results', 'conclusion', 'references'];

  const cols = langs.flatMap(l => fields.map(f => `${f}_${l}`));
  const vals = langs.flatMap(l => fields.map(f => sanitize(data[`${f}_${l}`] || '')));

  const hashtags = JSON.stringify(
    (data.hashtags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  );
  const photo_path = req.file ? req.file.path : '';

  const stmt = db.prepare(`
    INSERT INTO articles (photo_path, hashtags, ${cols.join(', ')})
    VALUES (?, ?, ${cols.map(() => '?').join(', ')})
  `);
  const result = stmt.run(photo_path, hashtags, ...vals);
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...article, hashtags: JSON.parse(article.hashtags) });
});

// PUT /api/admin/articles/:id
app.put('/api/admin/articles/:id', requireAuth, upload.single('photo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const data = req.body;
  const langs = ['uz', 'ru', 'en'];
  const fields = ['title', 'author_info', 'abstract', 'keywords', 'introduction', 'literature_review', 'methodology', 'analysis_results', 'conclusion', 'references'];

  const updates = langs.flatMap(l => fields.map(f => `${f}_${l} = ?`));
  const vals = langs.flatMap(l => fields.map(f => sanitize(data[`${f}_${l}`] || '')));

  const hashtags = JSON.stringify(
    (data.hashtags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  );
  const photo_path = req.file ? req.file.path : existing.photo_path;

  db.prepare(`UPDATE articles SET photo_path = ?, hashtags = ?, ${updates.join(', ')} WHERE id = ?`)
    .run(photo_path, hashtags, ...vals, req.params.id);

  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  res.json({ ...article, hashtags: JSON.parse(article.hashtags) });
});

// DELETE /api/admin/articles/:id
app.delete('/api/admin/articles/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found' });

  // Delete photo file
  if (article.photo_path) {
    const filePath = path.join(__dirname, '..', article.photo_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PUT /api/admin/settings
app.put('/api/admin/settings', requireAuth, upload.single('logo'), (req, res) => {
  const { brand_name, tg_link, insta_link } = req.body;
  const logo_url = req.file ? req.file.path : req.body.logo_url;

  db.prepare('UPDATE settings SET brand_name = ?, tg_link = ?, insta_link = ?, logo_url = ? WHERE id = 1')
    .run(sanitize(brand_name || ''), sanitize(tg_link || ''), sanitize(insta_link || ''), sanitize(logo_url || ''));

  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`✅ TBGJ Server running on http://localhost:${PORT}`));
