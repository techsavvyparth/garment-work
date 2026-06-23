# 👗 Ladies Work Management System

A professional, production-ready **MERN Stack + PWA** application for managing piece-work / job-work for lady workers in garment, textile, and similar industries.

---

## 🌟 Features

| Module | Description |
|---|---|
| 🔐 **Auth** | JWT login, bcrypt password hashing, protected routes |
| 📊 **Dashboard** | Stats, monthly charts, pending payment cards |
| 👩 **Ladies Management** | Add/edit/delete workers, photo upload, search & filter |
| 📋 **Lady Detail Page** | Full work history, payment history, month-wise tabs |
| ✂️ **Work Entries** | Assign work, auto-total calculation, work types |
| 💳 **Payments** | Cash/UPI/Bank, partial/full pay, auto pending update |
| 📈 **Reports** | Pending report, monthly charts, work-type breakdown |
| 📄 **PDF Export** | Professional monthly reports with signature section |
| 📱 **WhatsApp Share** | Share work reports via WhatsApp |
| 🔌 **Offline Mode** | IndexedDB + Service Worker, works without internet |
| 📲 **PWA** | Install as mobile app, splash screen, home screen icon |
| ⚙️ **Settings** | Company profile, logo upload, password change |

---

## 🛠️ Tech Stack

```
Frontend:   React 18 + Vite + Tailwind CSS v4
Backend:    Node.js + Express.js
Database:   MongoDB Atlas (or local MongoDB)
Auth:       JWT + bcrypt
Charts:     Recharts
PDF:        jsPDF + jsPDF-AutoTable
Offline:    IndexedDB (idb) + Service Workers
Icons:      Lucide React
PWA:        Web App Manifest + SW
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

---

### Step 1: Clone / Download

```bash
# If using git:
git clone <your-repo-url>
cd ladies-work-system
```

---

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ladies-work-system
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
# Start backend (development)
npm run dev

# OR seed demo admin account first:
npm run seed
# Then start:
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend (development)
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 4: First Login

After seeding (`npm run seed` in backend):
- **Email:** `admin@example.com`
- **Password:** `admin123`

Or register a new account at `/register`.

---

## 📁 Project Structure

```
ladies-work-system/
├── backend/
│   ├── models/
│   │   ├── User.js          # Admin user schema
│   │   ├── Lady.js          # Worker schema
│   │   ├── Work.js          # Work entry schema
│   │   └── Payment.js       # Payment schema
│   ├── routes/
│   │   ├── auth.js          # Login, register, profile
│   │   ├── ladies.js        # CRUD for ladies
│   │   ├── work.js          # CRUD for work entries
│   │   ├── payments.js      # CRUD for payments
│   │   └── reports.js       # Dashboard, pending, charts
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── utils/
│   │   └── seed.js          # Demo data seeder
│   ├── server.js            # Express app entry point
│   └── .env.example
│
└── frontend/
    ├── public/
    │   ├── manifest.json    # PWA manifest
    │   ├── sw.js            # Service worker
    │   └── icon.svg         # App icon
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Reusable UI (Button, Input, Modal, Table...)
    │   │   ├── layout/      # Sidebar + Layout wrapper
    │   │   ├── ladies/      # LadyForm component
    │   │   ├── work/        # WorkForm component
    │   │   └── payments/    # PaymentForm component
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── LadiesPage.jsx
    │   │   ├── LadyDetailPage.jsx   ← Most important
    │   │   ├── WorkPage.jsx
    │   │   ├── PaymentsPage.jsx
    │   │   ├── ReportsPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── services/
    │   │   └── api.js        # Axios API client
    │   ├── utils/
    │   │   ├── pdfGenerator.js   # jsPDF report builder
    │   │   └── offlineDB.js      # IndexedDB helpers
    │   ├── App.jsx           # Router + providers
    │   ├── main.jsx          # Entry + SW registration
    │   └── index.css         # Tailwind + custom styles
    ├── vite.config.js
    └── .env.example
```

---

## 🌐 REST API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create admin account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Ladies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ladies` | List all ladies (with summary) |
| GET | `/api/ladies/:id` | Lady details + work + payments |
| POST | `/api/ladies` | Add lady |
| PUT | `/api/ladies/:id` | Update lady |
| DELETE | `/api/ladies/:id` | Delete lady + all records |

### Work
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/work` | List work entries |
| POST | `/api/work` | Add work entry |
| PUT | `/api/work/:id` | Update entry |
| DELETE | `/api/work/:id` | Delete entry |
| GET | `/api/work/types/list` | List all work types |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Add payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/dashboard` | Dashboard stats |
| GET | `/api/reports/lady/:id/monthly` | Monthly PDF data |
| GET | `/api/reports/pending` | All pending payments |

---

## 📄 PDF Report Features

Monthly PDF includes:
- ✅ Company name + logo
- ✅ Lady name, mobile, address
- ✅ Summary cards (Work / Paid / Pending)
- ✅ Complete work entries table
- ✅ Payment history table
- ✅ Signature section
- ✅ Page numbers
- ✅ Professional gradient header

Actions:
- 📥 **Download** — saves PDF file
- 🖨️ **Print** — opens print dialog
- 📱 **WhatsApp** — shares summary via WhatsApp

---

## 📲 PWA Installation

1. Open the app in Chrome on mobile
2. Tap the **"Add to Home Screen"** banner
3. The app installs like a native app
4. Works **offline** — data cached by Service Worker

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```
Set environment variable: `VITE_API_URL=https://your-backend.com/api`

### Backend (Railway/Render/Heroku)
```bash
cd backend
# Set env vars in hosting dashboard:
# MONGODB_URI, JWT_SECRET, FRONTEND_URL, NODE_ENV=production
npm start
```

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add database user
3. Copy connection string to `MONGODB_URI`
4. Whitelist IP (0.0.0.0/0 for any)

---

## 🎨 UI Design System

- **Color Palette:** Violet/Purple primary, Pink accent, Dark bg (#0F0A1E)
- **Style:** Glassmorphism cards, gradient buttons, smooth transitions
- **Typography:** Inter system font, clean hierarchy
- **Responsive:** Mobile-first, sidebar collapses on small screens
- **Dark Mode:** Always dark — optimized for long business use

---

## 🔒 Security

- JWT tokens with 30-day expiry
- bcrypt password hashing (12 rounds)
- Helmet.js security headers
- CORS configured for your domain
- All routes protected by `auth` middleware
- Data scoped per admin (multi-tenant ready)

---

## 📞 Support

Built for Indian garment/textile businesses.  
Supports ₹ Indian Rupee formatting throughout.

---

**Ladies Work Management System v1.0.0**  
Built with ❤️ using MERN Stack + PWA
