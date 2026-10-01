# AI Financial Health Coach Specification
**Project:** AI Financial Health Coach + Cash-Flow Forecaster

## 1. Core Architecture
The AI Coach operates with a strict, unidirectional security isolation layer:
- The AI never has direct access to the database or SQL/ORM layer.
- An intermediary `ContextBuilder` aggregates an authenticated, sanitized, and structured financial snapshot from the Analytics and Forecasting services.
- The AI Service interface communicates with an AI Provider Adapter (Google Gemini 1.5/2.0 API or Deterministic Rule-Based Fallback Adapter).

## 2. Safety & Compliance Rules
1. **Disclaimer:** The coach is an analytical companion and educational tool, not a certified financial or tax advisor.
2. **Anti-Hallucination:** The coach is forbidden from inventing transactions, guessing unprovided balances, or projecting fabricated income.
3. **Structured Response Formatting:**
   - **Observed:** Concrete facts derived from recent transactions and analytics.
   - **Forecast:** Projections calculated by the forecasting engine with noted assumptions.
   - **Suggestion:** Actionable, risk-conscious behavioral improvements.
4. **Resilient Fallback Mode:** In the absence of an external API key or during network disruptions, the system executes the Deterministic Rule-Based Fallback Coach seamlessly, maintaining 100% operational availability.
