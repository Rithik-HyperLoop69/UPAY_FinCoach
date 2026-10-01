# Production Deployment Guide
**Project:** AI Financial Health Coach + Cash-Flow Forecaster (upay Concept)

## 1. Prerequisites
- Node.js >= 20.x
- PostgreSQL >= 15 (or Docker)
- npm >= 9.x

## 2. Environment Configuration
Create a production `.env` in the root and in `backend/`:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5432/fincoach?schema=public"

JWT_SECRET="generate-a-strong-random-64-char-secret-key"
JWT_REFRESH_SECRET="generate-another-strong-random-64-char-secret"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

CLIENT_URL="https://your-fincoach-domain.com"
GEMINI_API_KEY="your-optional-google-gemini-key"
AI_PROVIDER="fallback" # or "gemini"

DEFAULT_CURRENCY="BDT"
DEFAULT_LOCALE="en-BD"
```

## 3. Database Migration & Seeding
```bash
# Push schema or deploy migrations
cd backend
npx prisma db push --skip-generate
npx prisma generate

# Seed realistic demo transactions & accounts
npm run db:seed
```

## 4. Production Build & Execution

### Backend
```bash
cd backend
npm run build
npm run start
```

### Frontend
```bash
cd frontend
npm run build
# Serve dist/ with Nginx, Caddy, or Cloudflare Pages
```

## 5. Docker Compose Deployment
To run the full stack with PostgreSQL, Backend, and Frontend containers:

```bash
docker-compose up -d --build
```
This starts:
- PostgreSQL on port 5432
- Backend API on port 5000
- Frontend static web container on port 80 / 5173

## 6. Health & Status Checks
Verify operational status:
```bash
curl http://localhost:5000/api/health
```
Expected output:
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "environment": "production",
    "currency": "BDT"
  }
}
```
