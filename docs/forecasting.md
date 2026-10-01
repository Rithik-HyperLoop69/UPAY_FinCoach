# Cash-Flow Forecasting Engine
**Project:** AI Financial Health Coach + Cash-Flow Forecaster

## 1. Overview
The Cash-Flow Forecaster is a central differentiator. Rather than relying on black-box or non-deterministic ML models initially, it employs an explainable, deterministic baseline algorithm that analyzes historical spending behavior, identifies recurring obligations, and computes weighted expectations.

## 2. Core Forecasting Logic

### Historical Aggregation & Weighting
```text
Recent Month (Month M-1):      Weight = 0.50
Previous Month (Month M-2):    Weight = 0.30
Older Month (Month M-3):       Weight = 0.20

Expected Baseline Monthly Income = ∑ (Monthly Income_i × Weight_i)
Expected Baseline Monthly Expense = ∑ (Monthly Expense_i × Weight_i)
```

### Recurring Obligation Detection
The engine identifies recurring transactions based on:
1. **Merchant / Category Consistency:** Matches recurring vendors (e.g., Grameenphone, Link3 Broadband, House Rent, Netflix).
2. **Amount Proximity:** Variance <= 10% between occurrences.
3. **Temporal Periodicity:** Occurrences separated by 25 to 35 days (monthly) or 6 to 8 days (weekly).
4. **Estimated Next Occurrence:** Extrapolated forward to determine liquidity drains in the projection window.

### Projection Horizons
- **7 Days:** High-granularity liquidity check for immediate obligations.
- **30 Days:** Core monthly cash-flow forecast and surplus/deficit estimation.
- **90 Days:** Medium-term financial trajectory and goal feasibility outlook.

### Confidence Scoring
- `< 1 month of data`: 0% confidence (Forecast deferred until sufficient data exists).
- `1 - 2 months of data`: 45% confidence (Basic estimate with low confidence indicator).
- `3 - 5 months of data`: 75% confidence (Standard confidence baseline).
- `6+ months of data`: 90%+ confidence (High historical confidence).
