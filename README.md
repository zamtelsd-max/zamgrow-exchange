# 🌾 Zamgrow Exchange

> **Zambia's #1 Intelligent Agricultural Marketplace**  
> Connect. Trade. Grow.

[![CI/CD](https://github.com/zamgrow/zamgrow-exchange/actions/workflows/ci.yml/badge.svg)](https://github.com/zamgrow/zamgrow-exchange/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)](https://fastapi.tiangolo.com/)

---

## 🚀 Overview

**Zamgrow Exchange** is a full-stack agricultural marketplace platform built specifically for Zambia. It connects farmers directly to buyers across all 10 provinces, eliminating middlemen and providing AI-powered pricing intelligence powered by XGBoost machine learning.

### The Problem We Solve

| Problem | Our Solution |
|---------|-------------|
| Fragmented supply chain | Unified national marketplace |
| Price information asymmetry | AI price suggestions + market heatmaps |
| Middlemen taking 30-40% margins | Direct buyer-seller connection |
| No Zambia-specific platform | Province/district data, ZMW currency, CAT timezone |
| Limited digital payment options | Airtel Money, MTN MoMo, Zamtel Money native |

---

## ✨ Key Features

### 🛒 Dual-Sided Marketplace
- **Sellers** post crop/livestock inventory with asking prices
- **Buyers** post procurement requests for suppliers to respond to
- First platform in Zambia to support both listing types

### 🤖 AI-Powered Pricing Engine
- Real-time price suggestions based on province, season, supply/demand
- XGBoost regression model trained on historical transactions
- Province price heatmap for all 10 provinces
- Configurable price alerts (notify when Maize in Eastern drops below K300)

### 📍 Hyper-Localized for Zambia
- All 10 provinces + 50+ districts
- Agroecological zones (I, IIa, IIb, III)
- GPS-based proximity search
- ZMW currency, CAT timezone, DD/MM/YYYY dates

### 💳 Mobile Money Native
- **Airtel Money** (48% market share) via `*778#`
- **MTN MoMo** (35% market share) via `*303#`
- **Zamtel Money** (17% market share) via `*115#`
- Visa/Mastercard via Paystack/Flutterwave

### 🔔 Real-Time Intelligence
- WebSocket live price updates (Socket.io)
- Push notifications (Firebase Cloud Messaging)
- SMS fallback for offline users (Africa's Talking)
- Weekly email market digests

### 💎 Credit & Subscription System
- 10 free credits on registration
- Monthly: **K20/month** — unlimited listings + offers
- Annual: **K300/year** — unlimited everything + data export
- Zero-credit state: can browse but can't initiate

---

## 📸 Screenshots

### Landing Page
Beautiful hero section with animated price ticker, province statistics, and clear CTAs.

### Browse Marketplace  
Filterable listing grid with real-time search, province/category filters, and dual list/grid views.

### Listing Detail
Full photo gallery, seller profile with ratings, AI price comparison widget, offer submission form.

### Market Intelligence
Province heatmap with color intensity, price trend charts (6-month history), configurable alerts.

### Dashboard
Stats widgets, listing management, offer inbox with accept/reject/counter actions, notifications.

### Admin Panel
KPI metrics, revenue charts, user management table with KYC verification workflow.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ZAMGROW EXCHANGE                          │
├──────────────────┬──────────────────┬──────────────────────┤
│  PRESENTATION    │   APPLICATION    │       DATA           │
│                  │                  │                      │
│  React.js 18+    │  Node.js 20+     │  PostgreSQL 15+      │
│  TypeScript      │  Express 4.x     │  Redis 7+            │
│  TailwindCSS     │  Prisma ORM      │  16 DB Tables        │
│  Redux Toolkit   │  Socket.io       │                      │
│  Recharts        │  JWT Auth        │  Python FastAPI      │
│  React Router v6 │  Bull.js Queue   │  XGBoost ML          │
│                  │                  │  Pandas ETL          │
│  PWA (Workbox)   │  Cloudinary CDN  │                      │
│  React Native    │  Africa's Talking│  AWS S3 Backups      │
│  Expo SDK        │  Firebase FCM    │                      │
└──────────────────┴──────────────────┴──────────────────────┘
```

### Microservices
- **Frontend** — React PWA + React Native apps
- **Backend API** — Modular monolith (Auth, Listings, Payments, Notifications)
- **Pricing Engine** — Standalone Python/FastAPI ML service

---

## 🗃️ Database Schema

16 PostgreSQL tables:
`users` · `provinces` · `districts` · `categories` · `products` · `listings` · `listing_photos` · `offers` · `transactions` · `subscriptions` · `payments` · `reviews` · `price_history` · `notifications` · `price_alerts` · `watchlist` · `credits_log`

---

## 🚦 Quick Start

### Prerequisites
- Node.js 22+
- Python 3.11+
- Docker & Docker Compose
- Git

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/zamgrow/zamgrow-exchange.git
cd zamgrow-exchange

# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start all services
docker compose up -d

# Open in browser
open http://localhost:3000
```

All services start automatically:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs | http://localhost:3001/api/docs |
| Pricing Engine | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Option 2: Manual Development

```bash
# 1. Start databases
docker compose up postgres redis -d

# 2. Backend
cd backend
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev

# 3. Pricing Engine (new terminal)
cd pricing-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🔌 API Reference

Full interactive docs available at `/api/docs` (Swagger UI).

### Authentication
```bash
# Send OTP
POST /api/v1/auth/otp/send
{ "phone": "+260971234567" }

# Verify OTP
POST /api/v1/auth/otp/verify
{ "phone": "+260971234567", "otp": "123456" }

# Register
POST /api/v1/auth/register
{ "name": "Joseph Mwale", "phone": "+260971234567", "role": "SELLER", "provinceId": 3 }
```

### Listings
```bash
# Browse with filters
GET /api/v1/listings?category=Cereals&province=Eastern&type=SELL&price_min=200&price_max=400

# Get single listing
GET /api/v1/listings/:id

# Create listing (authenticated)
POST /api/v1/listings
Authorization: Bearer <token>
{ "type": "SELL", "productName": "Maize", "quantity": 500, "unit": "50kg Bag", "priceZmw": 310, "provinceId": 3 }
```

### AI Pricing
```bash
# Get price suggestion
GET /api/v1/pricing/suggest?product_id=maize&province_id=3

# Response:
{
  "suggested_price": 310.50,
  "avg_market_price": 315.00,
  "lowest_price": 280.00,
  "highest_price": 360.00,
  "confidence_score": 0.87,
  "data_points": 142,
  "trend": "UP",
  "change_percent": 3.2
}
```

### Payments
```bash
# Initiate subscription
POST /api/v1/payments/subscribe
{ "plan": "MONTHLY", "method": "AIRTEL", "phone": "+260971234567" }
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `AT_API_KEY` | Africa's Talking API key | `abc123` |
| `CLOUDINARY_CLOUD_NAME` | Image CDN | `my-cloud` |
| `MTN_MOMO_API_KEY` | MTN MoMo key | `xyz789` |
| `AIRTEL_CLIENT_ID` | Airtel Money client ID | `def456` |
| `SENDGRID_API_KEY` | Email service | `SG.xxx` |
| `PRICING_ENGINE_URL` | ML service URL | `http://pricing:8000` |

---

## 📱 Mobile Apps

React Native (Expo) apps for Android and iOS:

```bash
cd mobile  # React Native app
npm install
npx expo start

# Build for production
npx expo build:android
npx expo build:ios
```

**Minimum requirements:**
- Android 8.0 (API 26+)
- iOS 14.0+

---

## 🤖 AI Pricing Engine

The standalone Python/FastAPI microservice powers all price intelligence:

```bash
cd pricing-engine
pip install -r requirements.txt
uvicorn main:app --reload

# Docs at http://localhost:8000/docs
```

**Model details:**
- Primary: XGBoost Regressor
- Fallback: Weighted Moving Average (< 30 data points)
- Features: `product_id, province_id, month, season, active_listings, weather_index`
- Retraining: Weekly, Sundays 02:00 CAT (Bull.js scheduled job)

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run build   # Build check

# Backend
cd backend
npm run build   # TypeScript compilation
curl http://localhost:3001/health  # Health check

# Pricing Engine
cd pricing-engine
curl "http://localhost:8000/pricing/suggest?product_id=maize&province_id=3"
```

---

## 🚀 Deployment

### Production Stack
- **Frontend** → Vercel / Netlify
- **Backend** → Railway / AWS ECS / DigitalOcean
- **Database** → PostgreSQL (AWS RDS or Railway)
- **Redis** → Upstash / Railway Redis
- **Images** → Cloudinary CDN
- **Pricing Engine** → Railway / AWS ECS

### Docker Production Build

```bash
# Build all images
docker compose -f docker-compose.prod.yml build

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| API Latency (p95) | < 200ms |
| First Contentful Paint (3G) | < 3.0s |
| WebSocket Latency | < 500ms |
| Concurrent Users (MVP) | 10,000 |
| Uptime SLA | 99.9% |

---

## 🛡️ Security

- HTTPS/TLS 1.3 enforced
- JWT access tokens (15-min expiry) + HTTP-only refresh cookies (7-day)
- Bcrypt password hashing (work factor 12)
- AES-256 PII encryption at rest (NRC numbers)
- Rate limiting: 100 req/min/IP
- Prisma ORM (parameterized queries — SQL injection prevention)
- Strict CSP headers, DOM sanitization (XSS prevention)
- OWASP Top 10 compliance

---

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- Core auth (Phone/OTP)
- Listing CRUD (Buy & Sell)
- Search and browse
- Mobile money integration
- Credit/subscription system
- Admin panel

### Phase 2 🔄
- Pricing Engine deployment
- Offer/counter-offer system
- Reviews and ratings
- Push notifications
- Native Android/iOS release

### Phase 3 📋
- Bemba, Nyanja, Tonga, Lozi localization
- CSV/Excel data export
- Advanced analytics
- Logistics integration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m 'feat: add new feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 👥 Team

Built by the Zamgrow Exchange team. Designed for Zambian farmers and agribusiness.

**Contact:** hello@zamgrow.co.zm | +260 211 123 456  
**Location:** Cairo Road, Lusaka, Zambia

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

<div align="center">
  <strong>🇿🇲 Made for Zambia, by Zambia</strong><br>
  <em>Connecting farmers to markets since 2025</em>
</div>
