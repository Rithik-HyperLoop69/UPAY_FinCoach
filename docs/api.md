# API Documentation & Contracts
**Project:** AI Financial Health Coach + Cash-Flow Forecaster

## Base URL
`/api`

## Response Format Standard

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "details": null
  }
}
```

## Core API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /register`: Create a new user account & initial financial profile.
- `POST /login`: Authenticate and issue JWT Access and Refresh tokens.
- `POST /refresh`: Renew expired access tokens.
- `POST /logout`: Invalidate refresh token session.
- `GET /me`: Fetch authenticated user profile & preferences.
- `PUT /profile`: Update income, risk tolerance, and profile settings.
- `PUT /password`: Update user password.

### 2. Transactions (`/api/transactions`)
- `GET /`: List paginated, filterable transactions (by date range, type, category, search query).
- `POST /`: Record a new transaction (Income, Expense, Transfer) with upay/bKash/Bank metadata.
- `GET /:id`: Retrieve transaction details.
- `PUT /:id`: Update transaction.
- `DELETE /:id`: Remove transaction.

### 3. Financial Analytics (`/api/analytics`)
- `GET /summary`: Core financial KPIs (Total balance, monthly income, monthly expenses, net savings, savings rate).
- `GET /health-score`: Transparent 0-100 score with factor weights (Savings Behavior, Budget Adherence, Cash-Flow Stability, Goal Progress).
- `GET /spending-breakdown`: Category distribution and month-over-month shifts.
- `GET /trends`: Monthly income vs expense time-series trends.

### 4. Cash-Flow Forecast (`/api/forecast`)
- `GET /`: Retrieve 7-day, 30-day, and 90-day cash flow projections, confidence metrics, and recurring obligations.
- `POST /generate`: Trigger dynamic recomputation with latest transaction patterns.
- `GET /risks`: Detected risks (potential shortages, accelerated spending, unusual expense).

### 5. Budgets (`/api/budgets`)
- `GET /`: Retrieve active monthly budgets and category utilization.
- `POST /`: Define or update category limits.
- `DELETE /:id`: Remove budget item.

### 6. Savings Goals (`/api/goals`)
- `GET /`: Retrieve user goals with progress percentages and estimated completion dates.
- `POST /`: Create new savings target.
- `PUT /:id`: Update target or deposit funds.
- `DELETE /:id`: Delete goal.

### 7. AI Financial Health Coach (`/api/coach`)
- `POST /chat`: Interact with AI coach receiving structured, authenticated financial context.
- `GET /conversations`: Retrieve conversation history.
- `GET /context-preview`: View the exact structured data payload provided to the coach.

### 8. Alerts & Notifications (`/api/alerts`)
- `GET /`: List active financial notifications (budget warnings, forecast risks, reminders).
- `PUT /:id/read`: Mark alert as acknowledged.
- `PUT /read-all`: Mark all alerts as read.
