# Database Architecture & Data Dictionary
**Project:** AI Financial Health Coach + Cash-Flow Forecaster

## Relational Models Overview

The application utilizes a relational database managed with Prisma ORM.

### Entity Relationship Summary

1. **User**: Authentication, profile credentials, role.
2. **FinancialProfile**: High-level behavioral indicators, risk preferences, monthly income targets.
3. **Category**: Income and expense categories (Food, Utilities, Transportation, Rent, Education, etc.).
4. **Transaction**: Granular financial movements (Income, Expense, Transfer) with merchant, payment method (upay, bKash, Bank, Cash), status, and recurrence indicators.
5. **Budget**: Monthly spending plans scoped by user and year-month.
6. **BudgetItem**: Category-specific spending limits and tracking.
7. **SavingsGoal**: Target amounts, current accumulated savings, target dates, and progress.
8. **ForecastPoint**: Persisted or computed projected cash flows (7-day, 30-day, 90-day).
9. **Alert**: Financial risk and achievement notifications (Budget warning, cash-flow warning, unusual spending).
10. **AIConversation & AIMessage**: Structured history of AI Financial Coach interactions.
11. **RefreshToken**: Cryptographic tokens for secure multi-device session management.

## Privacy & Scoping Constraint
Every transaction, budget, goal, forecast, and AI conversation strictly belongs to an authenticated user (`userId = session.user.id`). Cross-tenant access is prohibited at the repository layer.
