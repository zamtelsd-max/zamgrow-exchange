# Zamgrow Exchange — Live Deployment Guide

This guide takes you from zero to fully live in ~30 minutes.

---

## Step 1 — Database (Neon PostgreSQL) — FREE

1. Go to **https://neon.tech** → Sign up (free)
2. Click **New Project** → name it `zamgrow`
3. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.aws.neon.tech/zamgrow?sslmode=require`)
4. Save it — you'll need it in Step 2

---

## Step 2 — Backend (Railway) — FREE tier

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select `zamtelsd-max/zamgrow-exchange`
4. Set **Root Directory** to `backend`
5. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (paste from Neon Step 1) |
| `JWT_SECRET` | any long random string |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://zamtelsd-max.github.io,https://depcxnwq.gensparkclaw.com` |
| `AT_API_KEY` | (from Africa's Talking — Step 4) |
| `AT_USERNAME` | `sandbox` (for now) |

6. Railway auto-deploys. Note your URL: `https://zamgrow-api.up.railway.app`

---

## Step 3 — Run Database Migrations

Once Railway is live, open the Railway **Shell** tab and run:

```bash
npx prisma db push
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
// Seed zones
const zones = [
  { name: 'Lusaka Zone', province: 'Lusaka' },
  { name: 'Copperbelt Zone', province: 'Copperbelt' },
  { name: 'Northern Zone', province: 'Northern' },
  { name: 'Eastern Zone', province: 'Eastern' },
  { name: 'Southern Zone', province: 'Southern' },
  { name: 'Western Zone', province: 'Western' },
  { name: 'Luapula Zone', province: 'Luapula' },
  { name: 'Muchinga Zone', province: 'Muchinga' },
  { name: 'North-Western Zone', province: 'North-Western' },
  { name: 'Central Zone', province: 'Central' },
];
Promise.all(zones.map(z => p.zone.upsert({ where: { name: z.name }, update: {}, create: z })))
  .then(() => console.log('Zones seeded!'))
  .catch(console.error)
  .finally(() => p.\$disconnect());
"
```

Or call the API endpoint (once HSD user exists):
```
POST https://zamgrow-api.up.railway.app/api/v1/sales/setup/zones
Authorization: Bearer <hsd-token>
```

---

## Step 4 — SMS OTP (Africa's Talking)

1. Go to **https://africastalking.com** → Create account
2. Go to **SMS → Alphanumeric Sender IDs** → request `ZAMGROW`
3. Go to **API Key** → copy your key
4. Add to Railway env vars: `AT_API_KEY`, `AT_USERNAME`
5. For testing: use `AT_USERNAME=sandbox` (free sandbox, test numbers only)
6. For live: top up Africa's Talking account with airtime credits (~$5 goes far)

---

## Step 5 — Mobile Money Payments

### Option A: DPO Pay (recommended for Zambia)
1. Go to **https://dpogroup.com** → Contact sales for Zambia account
2. Supports: Airtel Money Zambia, MTN MoMo Zambia
3. Add `PAYMENT_COMPANY_TOKEN` to Railway

### Option B: Flutterwave
1. Go to **https://flutterwave.com** → Create business account
2. Supports Airtel Zambia + card payments
3. Add `FLW_SECRET_KEY` to Railway

---

## Step 6 — Connect Frontend to Live Backend

1. In your repo, create `frontend/.env.production`:
   ```
   VITE_API_URL=https://zamgrow-api.up.railway.app/api/v1
   ```
2. Rebuild and redeploy:
   ```bash
   cd frontend && npm run build
   cp -r dist ../docs
   git add -A && git commit -m "chore: connect to live backend" && git push
   ```

---

## Step 7 — Create First HSD User

Call the register endpoint to create Patricia Mumba (HSD):

```bash
curl -X POST https://zamgrow-api.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Patricia Mumba",
    "phone": "+260977000001",
    "role": "hsd",
    "province": "Lusaka"
  }'
```

Then log in:
```bash
curl -X POST https://zamgrow-api.up.railway.app/api/v1/auth/otp/request \
  -d '{"phone": "+260977000001"}'
# Enter OTP from SMS, then:
curl -X POST https://zamgrow-api.up.railway.app/api/v1/auth/otp/verify \
  -d '{"phone": "+260977000001", "code": "123456"}'
```

---

## Step 8 — Create ZBMs and TDRs

Use the HSD token to create ZBM accounts for each zone. Example:

```bash
# Create ZBM for Lusaka Zone
curl -X POST https://zamgrow-api.up.railway.app/api/v1/auth/register \
  -d '{"name":"Mwewa Chanda","phone":"+260977100001","role":"zbm","province":"Lusaka"}'

# Assign ZBM to zone (call as admin/hsd)
# Then TDRs register and get assigned to zones by ZBM
```

---

## Architecture Summary

```
Browser (GitHub Pages / Cloudflare)
    │
    ├── Frontend: React + TypeScript (zamtelsd-max.github.io/zamgrow-exchange)
    │       └── VITE_API_URL → Railway
    │
    ├── Backend: Node.js + Express (Railway)
    │       ├── /api/v1/auth  → OTP via Africa's Talking
    │       ├── /api/v1/sales → TDR/ZBM/HSD performance
    │       ├── /api/v1/payments → DPO/Flutterwave
    │       └── → PostgreSQL (Neon)
    │
    └── Database: PostgreSQL (Neon — free serverless)
```

---

## Cost Summary (Monthly)

| Service | Cost |
|---------|------|
| Neon PostgreSQL | FREE (0.5GB) |
| Railway backend | FREE (500hr/month) |
| GitHub Pages frontend | FREE |
| Africa's Talking SMS | ~$0.01/SMS |
| DPO Pay / Flutterwave | 1.5–3% per transaction |
| **Total fixed cost** | **$0/month** |
