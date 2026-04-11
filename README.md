<div align="center">

# 🌾 Zamgrow Exchange

### Zambia's #1 Intelligent Agricultural Marketplace

**Connect. Trade. Grow.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://docker.com/)

</div>

---

## 📋 Overview

Zamgrow Exchange is a full-stack agricultural marketplace built specifically for Zambia, connecting **12,000+ farmers**, buyers, and agro-dealers across all 10 provinces. The platform features AI-powered price intelligence, mobile money integration, and real-time market data.

## ✨ Features

- 🤖 **AI Price Intelligence** — ML-powered price suggestions with confidence scores
- 📱 **Mobile Money Integration** — MTN, Airtel, and Zamtel payment support
- 🗺️ **Province Heatmap** — Interactive price visualization across Zambia's 10 provinces
- 💬 **Offer Negotiation** — Real-time chat-style offer/counter-offer system
- 🔔 **Price Alerts** — SMS notifications when target prices are reached
- 🛡️ **Verified Traders** — NRC and business registration verification
- 📊 **Market Dashboard** — 6-month price history charts with trend analysis
- 🌐 **PWA Support** — Works offline on any phone
- 👤 **Role-based Access** — Farmer, Buyer, Dealer, Admin roles
- 💎 **Subscription Tiers** — Free, Basic (K99), Pro (K249), Premium (K599)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (PWA)                    │
│         React 18 + TypeScript + TailwindCSS         │
│              Vite · Redux Toolkit · Port 3000        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                   Backend API                        │
│          Node.js + Express + TypeScript             │
│         Prisma ORM · Socket.IO · Port 3001          │
└───────┬──────────────────────────┬──────────────────┘
        │ Prisma                   │ HTTP
┌───────▼──────┐          ┌────────▼──────────────────┐
│  PostgreSQL  │          │     Pricing Engine        │
│  (Port 5432) │          │  Python FastAPI + NumPy   │
│    + Redis   │          │       Port 8000           │
│  (Port 6379) │          └───────────────────────────┘
└──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for pricing engine)

### With Docker Compose (Recommended)

```bash
git clone https://github.com/yourorg/zamgrow-exchange.git
cd zamgrow-exchange

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Access services:
# Frontend:       http://localhost:3000
# Backend API:    http://localhost:3001
# Pricing Engine: http://localhost:8000/docs
```

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev          # http://localhost:3001
```

**Pricing Engine:**
```bash
cd pricing-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

## 📁 Project Structure

```
zamgrow-exchange/
├── frontend/                 # React PWA (TypeScript)
│   ├── src/
│   │   ├── pages/            # 11 application pages
│   │   ├── components/       # Reusable UI components
│   │   ├── store/            # Redux Toolkit slices
│   │   └── services/         # API calls + mock data
│   └── Dockerfile
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── routes/           # 7 route modules
│   │   ├── middleware/       # Auth, rate limiting, credits
│   │   └── services/         # SMS, payment, notifications
│   ├── prisma/
│   │   └── schema.prisma     # 16 database models
│   └── Dockerfile
├── pricing-engine/           # Python FastAPI ML service
│   ├── main.py               # API routes
│   ├── pricing.py            # Price calculation engine
│   ├── models.py             # Pydantic schemas
│   └── Dockerfile
├── .github/workflows/ci.yml  # GitHub Actions CI/CD
└── docker-compose.yml        # All services
```

## 🔧 Environment Variables

| Variable | Service | Description | Default |
|----------|---------|-------------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection string | Required |
| `REDIS_URL` | Backend | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Backend | JWT signing secret | Required (change!) |
| `JWT_EXPIRES_IN` | Backend | Token expiry duration | `7d` |
| `PORT` | Backend | API server port | `3001` |
| `AFRICAS_TALKING_API_KEY` | Backend | SMS gateway API key | Optional |
| `PRICING_ENGINE_URL` | Backend | Pricing service URL | `http://localhost:8000` |
| `CORS_ORIGINS` | Backend | Allowed frontend origins | `http://localhost:3000` |

## 📡 API Reference

### Authentication
```
POST /api/v1/auth/register       - Register with phone + role
POST /api/v1/auth/otp/send       - Send OTP to phone
POST /api/v1/auth/otp/verify     - Verify OTP, get JWT token
POST /api/v1/auth/login          - Login with phone
```

### Listings
```
GET  /api/v1/listings            - Browse with filters
POST /api/v1/listings            - Create listing (1 credit)
GET  /api/v1/listings/:id        - Get listing detail
PUT  /api/v1/listings/:id        - Update listing
POST /api/v1/listings/:id/offers - Make offer
GET  /api/v1/listings/:id/offers - Get all offers
```

### Market
```
GET /api/v1/market/prices        - Price history data
GET /api/v1/market/heatmap       - Province price heatmap
```

### Pricing Engine (Port 8000)
```
GET /pricing/suggest             - AI price suggestion
GET /pricing/heatmap             - Province heatmap
GET /pricing/history             - Historical prices
GET /pricing/products            - List products
GET /pricing/market-summary      - Market overview
```

## 🌍 Zambia-Specific Data

- **10 Provinces** with districts (Central, Copperbelt, Eastern, Luapula, Lusaka, Muchinga, Northern, North-Western, Southern, Western)
- **10 Categories**: Cereals 🌾, Legumes 🫘, Vegetables 🥬, Fruits 🍊, Livestock 🐄, Fisheries 🐟, Dairy 🥛, Poultry 🐔, Root Crops 🍠, Cash Crops 🌿
- **40+ Products** with real ZMW pricing
- **Province pricing multipliers** reflecting actual supply/demand
- **Seasonal factors** calibrated to Zambia's agricultural calendar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ in Zambia 🇿🇲 | © 2024 Zamgrow Exchange
</div>
