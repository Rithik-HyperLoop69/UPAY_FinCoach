# upay FinCoach — AI Financial Health Coach + Cash-Flow Forecaster

> **"Your Money, Understood & Forecasted."**
> A production-quality fintech web application concept designed around **upay** (United Commercial Bank MFS, Bangladesh), focused on customer financial health, cash-flow forecasting, savings behavior, and personalized AI guidance.

---

## 🌟 Technical Differentiators

1. **AI Financial Health Coach (Context-Grounded)**
   - Strict unidirectional privacy isolation: The AI never touches the raw database.
   - Operates with structured financial snapshots (`ContextBuilder`).
   - Anti-hallucination compliance adhering strictly to **Observed Fact**, **Forecast Projection**, and **Actionable Suggestion**.
   - Resilient dual-adapter architecture with Google Gemini API & Deterministic Rule-Based Fallback.

2. **Explainable Cash-Flow Forecaster (7D / 30D / 90D)**
   - Multi-horizon deterministic forecasting engine.
   - Weighted historical inflows & discretionary outflows.
   - Automatic recurring payment detection (House rent, Link3 broadband, DESCO electricity, mobile recharges, Netflix, savings DPS).
   - Early cash-flow shortage and liquidity dip detection with actionable remediation warnings.

3. **Continuous Financial Health Loop**
   ```text
   TRACK ──▶ UNDERSTAND ──▶ FORECAST ──▶ ALERT ──▶ COACH ──▶ ACT ──▶ TRACK AGAIN
   ```

4. **100% Transparent Financial Health Score (0 - 100)**
   - Documented, explainable components:
     - Savings Behavior (0 - 25 pts)
     - Budget Adherence (0 - 25 pts)
     - Cash-Flow Stability (0 - 25 pts)
     - Goal Progress (0 - 25 pts)

5. **Bangladesh Context & Simulated upay MFS Ecosystem**
   - Currency: Bangladeshi Taka (BDT / `৳`).
   - Simulated upay digital wallet integration (`UpayPaymentAdapter`): Mobile recharge, merchant checkout, bill payment, and high-yield digital DPS deposits.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router, TanStack Query |
| **Backend** | Node.js, Express, TypeScript, Zod, JWT, bcryptjs, Helmet, Rate Limiter |
| **Database & ORM** | Prisma ORM, SQLite (local zero-dependency out-of-the-box) / PostgreSQL (production) |
| **AI Layer** | Google Gemini API adapter + Deterministic Rule-Based Fallback Engine |
| **Testing** | Vitest, Supertest (27 automated integration & unit tests) |

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### 2. Install Dependencies
```bash
# In the root repository directory:
npm run install:all
```

### 3. Setup Database & Seed Realistic Demo Data
```bash
cd backend
npx prisma db push
npm run db:seed
```

### 4. Run Both Backend & Frontend Simultaneously
From the root repository directory:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demo Credentials

Use the pre-seeded account to immediately explore 4+ months of realistic Bangladesh transactions, budgets, goals, and forecasts:

- **Email:** `demo@upay.com`
- **Password:** `Password123!`
- *(Or click the **"Use Pre-Seeded Demo Account"** button on the Login page)*

---

## 📂 Project Structure

```text
ai-financial-health-coach/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Relational schema (User, Transaction, Budget, Goal, Alert, etc.)
│   │   └── seed.ts             # 60+ realistic multi-month Bangladesh transactions
│   ├── src/
│   │   ├── config/             # Database singleton & validated environment configs
│   │   ├── middleware/         # Auth JWT, rate limiters, logging, error handling, Zod validation
│   │   ├── modules/
│   │   │   ├── auth/           # Registration, login, token rotation, profile management
│   │   │   ├── transactions/   # CRUD ledger, filtering, pagination, upay payment metadata
│   │   │   ├── categories/     # System defaults & custom user categories
│   │   │   ├── budgets/        # Monthly limits, category tracking, threshold warnings
│   │   │   ├── goals/          # Savings goals, progress, deposits, completion projections
│   │   │   ├── analytics/      # Financial Health Score (0-100), trends, breakdowns
│   │   │   ├── forecast/       # BasicForecastEngine, recurring detection, shortage risks
│   │   │   ├── ai-coach/       # ContextBuilder, Gemini & Fallback adapters, safety prompts
│   │   │   ├── alerts/         # Notification feeds, read states, severity tags
│   │   │   └── payments/       # UpayPaymentAdapter & mock provider abstraction
│   │   ├── routes/             # Central API router
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entry point
│   └── tests/                  # 27 automated integration tests
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Typed fetch API client with auto-token handling
│   │   ├── context/            # AuthContext provider
│   │   ├── components/
│   │   │   ├── ui/             # Buttons, Cards, Badges, Modals, Spinners
│   │   │   ├── layout/         # Sidebar, Header, DashboardLayout
│   │   │   ├── charts/         # CashFlowChart, SpendingPieChart
│   │   │   └── transactions/   # AddTransactionModal
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Transactions,
│   │   │                       # Analytics, Forecast, Budgets, Goals, Coach, Alerts, Reports, Profile
│   │   └── utils/              # BDT currency formatters & date helpers
│   ├── index.html
│   └── tailwind.config.js
│
├── docs/                       # Architectural and technical documentation
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── forecasting.md
│   ├── ai-coach.md
│   ├── security.md
│   └── deployment.md
│
├── docker-compose.yml          # Production multi-container orchestration
├── package.json                # Monorepo task runner
└── README.md
```

---

## 🧪 Testing

Run the full automated test suite covering all modules:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **Authentication:** Registration, login, token rotation, password hashing, unauthorized rejections.
- **Transactions:** CRUD operations, filtering, pagination, upay simulated metadata attachment.
- **Financial Analytics:** Total income, expenses, savings rate, transparent health score.
- **Forecasting:** Weighted averages, recurring obligation detection, shortage risk detection.
- **Budgets & Goals:** Category tracking, deposit actions, estimated completion dates.
- **AI Coach:** ContextBuilder sanitization, prompt templates, rule-based fallback, safety guidelines.
- **Alerts:** Unread notifications, mark-as-read, severity filters.

---

## 🔒 Security & Privacy Practices

- **Strict Tenant Isolation:** Every single database query strictly filters by `WHERE userId = authenticatedUser.id`.
- **Zero Raw DB Access for AI:** AI Coach receives only sanitized, summarized snapshots.
- **Safe Logging:** Sensitive headers, passwords, and tokens are scrubbed from server logs.
- **Defense in Depth:** Helmet headers, CORS restrictions, Zod input validation schemas, and Express rate limiting on sensitive routes.

---

## 📄 License & Disclaimer

This project is a concept prototype designed for fintech research and technical validation in Bangladesh. It is not an official banking service of United Commercial Bank (UCB) unless explicitly certified. All simulated transactions and financial analytics are generated for demonstration and educational purposes.
