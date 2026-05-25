# SnapLink — URL Shortener with Analytics

> This project is a part of a hackathon run by https://katomaran.com

A full-stack URL shortener with real-time analytics, custom aliases, QR codes, and more. Built for the **Katomaran Hackathon (March 2026)**.

---

## 🚀 Live Demo

> Record your Loom/YouTube demo link here after recording.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  BROWSER                     │
│  React (Vite) SPA                           │
│  ─ Auth pages (Login / Signup)              │
│  ─ Dashboard (manage short URLs)            │
│  ─ Analytics page (charts + visit log)      │
│  ─ Public Stats page (no auth)              │
└──────────────┬──────────────────────────────┘
               │ REST API (Axios + JWT)
               ▼
┌─────────────────────────────────────────────┐
│         Node.js + Express Server            │
│                                             │
│  POST  /api/auth/register                   │
│  POST  /api/auth/login                      │
│  GET   /api/auth/me                         │
│  POST  /api/urls          (create)          │
│  GET   /api/urls          (list own URLs)   │
│  DELETE /api/urls/:id                       │
│  PATCH  /api/urls/:id     (edit dest)       │
│  GET   /api/urls/:id/analytics              │
│  GET   /api/urls/:code/public-stats         │
│  GET   /:shortCode        (redirect + log)  │
│                                             │
│  Middleware: JWT auth, rate limiting,       │
│  Helmet, CORS, error handler                │
└──────────────┬──────────────────────────────┘
               │ Mongoose ODM
               ▼
┌─────────────────────────────────────────────┐
│                 MongoDB                      │
│  users   — auth credentials (bcrypt hashed)│
│  urls    — short URLs, click count, expiry  │
│  visits  — per-click analytics records      │
└─────────────────────────────────────────────┘
```

---

## ✅ Features

### Mandatory
- ✅ User signup and login (bcrypt + JWT)
- ✅ Protected dashboard routes
- ✅ Each user manages only their own URLs
- ✅ URL shortening with unique 7-char codes
- ✅ Server-side 302 redirect
- ✅ URL validation before shortening
- ✅ Dashboard: view all URLs, original/short/date/clicks
- ✅ Delete URLs
- ✅ Copy short URL button
- ✅ Click count tracking
- ✅ Visit timestamps
- ✅ Analytics page: total clicks, last visited, recent history

### Bonus
- ✅ Custom aliases for short URLs
- ✅ QR code generation (downloadable PNG)
- ✅ Expiry date for links
- ✅ Daily click trend chart (recharts BarChart)
- ✅ Edit destination URL
- ✅ Public stats page (`/stats/:shortCode`)
- ✅ Geolocation analytics (country/city via ip-api.com)
- ✅ Country breakdown pie chart

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom design system, dark mode) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Short codes | nanoid |
| URL validation | validator.js |
| Charts | recharts |
| QR codes | qrcode.react |
| HTTP client | Axios |
| Icons | lucide-react |
| Dates | date-fns |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd url-shortener
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Edit .env if needed (VITE_API_URL)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## 📋 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_jwt_key
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

---

## 🤔 Assumptions Made

1. Short URLs use the **backend server** as the base URL (e.g., `http://localhost:5000/abc1234`) since the redirect must be server-side.
2. Geolocation is done via the free `ip-api.com` API — best effort, failures are silently ignored.
3. Passwords must be ≥ 6 characters. No password recovery flow (out of scope).
4. Analytics data is stored indefinitely (no auto-purge).
5. The `nanoid` package v3 is used (CommonJS compatible with `require()`).

---

## 🧠 AI Planning Document

### Tools Used
- **Antigravity (AI agent by Google DeepMind)** — used for full application generation
  - Prompted to plan architecture, DB schema, API design, and folder structure
  - Generated all backend and frontend code
  - Provided detailed implementation plan as artifact

### Planning Steps
1. Read and analyzed hackathon problem statement PDF
2. Created architecture diagram and DB schema
3. Planned API endpoints, middleware, and folder structure
4. Generated backend code: models, controllers, routes, middleware
5. Generated frontend code: design system, pages, components
6. Integrated routing, auth context, and API client
7. Added bonus features: QR codes, charts, expiry, geolocation, public stats

---

## 📸 Sample Output

> Add screenshots, DB entries, and logs here after recording the demo video.

---

## 🎥 Demo Video

> Add Loom or YouTube link here.

---

> This project is a part of a hackathon run by https://katomaran.com
