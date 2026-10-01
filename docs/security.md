# Security Architecture & Hardening Report
**Project:** AI Financial Health Coach + Cash-Flow Forecaster

## 1. Authentication & Session Management
- **Password Security:** Passwords are hashed with bcrypt utilizing 10 salt rounds before storage. Plain-text passwords are never logged or persisted.
- **JWT Architecture:** Dual-token strategy with short-lived Access Tokens (1 day) and Refresh Tokens (7 days). Tokens contain cryptographically unique UUIDs (`jti`) to prevent replay or collision vulnerabilities.
- **Token Invalidation:** Logout invalidates the active refresh token in the database. Token rotation is enforced during refresh.

## 2. Strict User Isolation & Authorization
- **Multi-Tenant Data Isolation:** Every query on `Transaction`, `Budget`, `SavingsGoal`, `ForecastPoint`, `Alert`, and `AIConversation` enforces strict user scoping:
  ```sql
  WHERE userId = authenticatedUser.id
  ```
- No client-supplied `userId` parameter is ever trusted for authorization.
- System categories are marked immutable and cannot be deleted by end users.

## 3. Input Validation & Type Safety
- All incoming requests are strictly validated at the controller edge using Zod schemas (`validateBody`, `validateQuery`, `validateParams`).
- Malformed inputs, negative balances, and non-numeric amounts are rejected with `400 VALIDATION_ERROR` before database execution.
- ORM parameterized queries via Prisma prevent SQL injection vulnerabilities.

## 4. Network & Rate Limiting Controls
- **Helmet:** Enforces security headers (Content-Security-Policy, X-DNS-Prefetch-Control, Strict-Transport-Security, X-Frame-Options).
- **CORS:** Restricts cross-origin resource sharing to the trusted `CLIENT_URL`.
- **Rate Limiters:**
  - Standard API Limiter: 300 requests / 15 minutes.
  - Authentication Limiter: 20 login/register attempts / 15 minutes.
  - AI Coach Limiter: 30 prompts / minute.

## 5. AI Safety & Privacy Isolation Layer
- **No Direct Database Access:** The AI service has zero direct connectivity to the database or Prisma client.
- **Sanitized Snapshot:** The `ContextBuilder` aggregates an authenticated snapshot containing only necessary summary metrics.
- **Deterministic Fallback:** Guarantees zero downtime and prevents unauthorized data exfiltration if external AI providers fail.
