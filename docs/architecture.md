# Architecture & System Design
**Project:** AI Financial Health Coach + Cash-Flow Forecaster (upay Concept)

## 1. High-Level Architecture Overview

The system is structured as a modular monolith adhering to clean architecture principles:

```text
                    ┌─────────────────────────┐
                    │      FRONTEND           │
                    │ React + TypeScript +    │
                    │ Vite + Tailwind + Query │
                    └────────────┬────────────┘
                                 │
                           REST API / JSON
                                 │
                    ┌────────────▼────────────┐
                    │      BACKEND CORE       │
                    │ Express + TypeScript    │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
  Auth Service          Financial Services          AI Coach
 (JWT, Passwords)   (Transactions, Budgets, Goals)  (Interface/Adapter)
         │                       │                       │
         │                       ▼                       ▼
         │               Analytics Engine         AI Context Builder
         │            (Health Score, Savings)            │
         │                       │                       ▼
         │                       ▼                  AI Provider
         │                Forecast Engine         (Gemini/Fallback)
         │          (Weighted Avg, Recurring)
         │                       │
         ▼                       ▼
   PostgreSQL / SQLite Database with Prisma ORM
```

## 2. Core Product Loop

```text
TRACK ──▶ UNDERSTAND ──▶ FORECAST ──▶ ALERT ──▶ COACH ──▶ ACT ──▶ TRACK AGAIN
```

## 3. Technology Stack Justification
- **Backend:** Node.js with Express and TypeScript for type safety, modular routing, and clean separation of concerns.
- **Data Layer:** Prisma ORM for relational schema integrity, migrations, and developer ergonomics.
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts for financial visualization, Lucide icons, TanStack React Query for cached server state.
- **AI Layer:** Decoupled adapter pattern allowing seamless switching between Google Gemini API and a deterministic rule-based financial coach fallback.
