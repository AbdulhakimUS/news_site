# 📰 The Best Generations Journal — News Portal

A professional, multi-lingual (UZ/RU/EN) academic journal news portal with a full admin panel.

---

## 🏗️ Project Structure

```
tbgj/
├── server/              # Node.js + Express backend
│   ├── index.js         # Main server (all routes, DB, security)
│   ├── tbgj.db          # SQLite database (auto-created on first run)
│   └── package.json
│
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── LangContext.jsx   # Language switcher (UZ/RU/EN)
│   │   │   └── AuthContext.jsx   # Admin auth state
│   │   ├── hooks/
│   │   │   └── useSettings.jsx   # Site settings context
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation + search + language switcher
│   │   │   ├── Footer.jsx        # Footer with social links
│   │   │   ├── ArticleCard.jsx   # FeaturedCard, MediumCard, SmallCard, Skeleton
│   │   │   ├── ArticleForm.jsx   # Multi-language article form (admin)
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # 4-section home page
│   │   │   ├── ArticlePage.jsx   # Full article + recommendations sidebar
│   │   │   ├── ArticlesPage.jsx  # Paginated article listing
│   │   │   ├── AboutPage.jsx     # About journal page
│   │   │   ├── SearchPage.jsx    # Search results
│   │   │   ├── AdminLoginPage.jsx
│   │   │   └── AdminPage.jsx     # Full CRUD dashboard + settings
│   │   ├── utils/
│   │   │   └── api.js            # Axios instance + helper functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind + custom component classes
│   └── package.json
│
├── uploads/             # Uploaded images (auto-created)
└── package.json         # Root with concurrent scripts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v8 or higher

### Step 1 — Install dependencies

```bash
# From the project root (tbgj/)
npm install          # installs concurrently
cd server && npm install
cd ../client && npm install
```

Or all at once:
```bash
npm run install:all
```

### Step 2 — Start development servers

```bash
# From project root — starts both server and client
npm run dev
```

Or separately:
```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 3000)
npm run dev:client
```

### Step 3 — Open in browser

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public portal |
| http://localhost:3000/admin-login | Admin login |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:5000/api/articles | API endpoint |

---

## 🔑 Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `nurddinova` |
| Password | `yurist123` |

> ⚠️ Change these after first login by editing `server/index.js` and re-running the server (the DB will use the hashed version stored at first run).

---

## 🌍 Language Support

- **Default:** Uzbek (UZ)
- **Supported:** Uzbek, Russian, English
- Switch languages using the **UZ / RU / EN** toggle in the top navbar
- All article fields are stored separately for each language

---

## 📋 Features

### Public Portal
- ✅ **Home Page** — Featured article + 4 distinct sections mirroring the wireframe
- ✅ **Article Detail** — Full article with all 10 academic sections + recommendations sidebar
- ✅ **Recommendation Engine** — Articles sharing hashtags shown in sidebar
- ✅ **Search** — Full-text search across title, abstract, and keywords
- ✅ **Language Switcher** — Instant switch between UZ/RU/EN
- ✅ **Responsive** — Mobile-first, works on all screen sizes
- ✅ **Back Button** — On every sub-page
- ✅ **No Image Placeholder** — Graceful fallback when no photo is uploaded
- ✅ **Lazy Loading** — Images load on demand for performance

### Admin Panel
- ✅ **Secure Login** — bcrypt password hashing + JWT tokens + rate limiting
- ✅ **Dashboard Stats** — Article count, monthly, images, tags
- ✅ **Article CRUD** — Create, Read, Update, Delete articles
- ✅ **Multi-Language Form** — Tab-based form with UZ/RU/EN fields
- ✅ **Image Upload** — Photo upload with preview (5MB limit)
- ✅ **Settings** — Change logo, brand name, Telegram & Instagram links
- ✅ **Slide-over Panel** — Clean UX for add/edit forms
- ✅ **Delete Confirmation** — Modal to prevent accidental deletes

### Security
- ✅ **helmet.js** — HTTP security headers
- ✅ **express-rate-limit** — 200 req/15min general, 10 req/15min for login
- ✅ **bcryptjs** — Password hashing (cost factor 12)
- ✅ **JWT** — Stateless admin auth (8h expiry)
- ✅ **XSS sanitization** — All user input sanitized with `xss` library
- ✅ **Parameterized queries** — SQL injection prevention via better-sqlite3

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary (Navy) | `#1a2b48` |
| Accent (Gold) | `#c5a059` |
| Background | `#faf8f4` (cream) |
| Display Font | Playfair Display (serif) |
| Body Font | DM Sans (sans-serif) |

---

## 📦 Production Build

```bash
# Build frontend
cd client && npm run build

# Serve frontend from Express (add to server/index.js):
# app.use(express.static(path.join(__dirname, '../client/dist')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));

# Start server only
npm start
```

---

## 🗄️ Database Schema

### settings
| Column | Type | Default |
|--------|------|---------|
| id | INTEGER PK | 1 |
| logo_url | TEXT | '' |
| brand_name | TEXT | 'The Best Generations Journal' |
| tg_link | TEXT | '' |
| insta_link | TEXT | '' |

### admins
| Column | Type |
|--------|------|
| id | INTEGER PK |
| username | TEXT UNIQUE |
| password | TEXT (bcrypt hash) |
| created_at | DATETIME |

### articles
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| photo_path | TEXT | Relative path to /uploads/ |
| hashtags | TEXT | JSON array string |
| created_at | DATETIME | Auto-set |
| title_uz/ru/en | TEXT | Per-language |
| author_info_uz/ru/en | TEXT | |
| abstract_uz/ru/en | TEXT | |
| keywords_uz/ru/en | TEXT | |
| introduction_uz/ru/en | TEXT | |
| literature_review_uz/ru/en | TEXT | |
| methodology_uz/ru/en | TEXT | |
| analysis_results_uz/ru/en | TEXT | |
| conclusion_uz/ru/en | TEXT | |
| references_uz/ru/en | TEXT | |

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Site settings |
| GET | `/api/articles` | Articles list (paginated) |
| GET | `/api/articles/featured` | Newest article |
| GET | `/api/articles/:id` | Single article |
| GET | `/api/articles/:id/recommendations` | Related articles by hashtag |
| GET | `/api/search?q=&lang=` | Full-text search |

### Admin (requires JWT Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login → returns JWT |
| GET | `/api/admin/articles` | All articles |
| POST | `/api/admin/articles` | Create article (multipart/form-data) |
| PUT | `/api/admin/articles/:id` | Update article |
| DELETE | `/api/admin/articles/:id` | Delete article + photo file |
| PUT | `/api/admin/settings` | Update site settings + logo |

---

## 🛠️ Customization

### Add a new language
1. Add to `LANGS` in `ArticleForm.jsx`
2. Add translations to `LangContext.jsx`
3. Add DB columns in `server/index.js` CREATE TABLE statement
4. Add to API insert/update queries

### Change admin password
```bash
# In Node.js REPL:
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your_new_password', 12));
# Then update the DB: UPDATE admins SET password = '...' WHERE username = 'nurddinova';
```

---

## 📝 License
Built for The Best Generations Journal. All rights reserved.
