import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import transactionRoutes from '../modules/transactions/transaction.routes';
import categoryRoutes from '../modules/categories/category.routes';
import budgetRoutes from '../modules/budgets/budget.routes';
import goalRoutes from '../modules/goals/goal.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import forecastRoutes from '../modules/forecast/forecast.routes';
import coachRoutes from '../modules/ai-coach/aiCoach.routes';
import alertRoutes from '../modules/alerts/alert.routes';

const apiRouter = Router();

// Mount modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/transactions', transactionRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/forecast', forecastRoutes);
apiRouter.use('/coach', coachRoutes);
apiRouter.use('/alerts', alertRoutes);

// Root API Welcome & metadata
apiRouter.get('/', (req, res) => {
  res.json({
    name: 'upay FinCoach API',
    tagline: 'AI Financial Health Coach + Cash-Flow Forecaster',
    version: '1.0.0',
    documentation: '/docs',
    currency: 'BDT (৳)',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      analytics: '/api/analytics',
      forecast: '/api/forecast',
      budgets: '/api/budgets',
      goals: '/api/goals',
      alerts: '/api/alerts',
      coach: '/api/coach',
    },
  });
});

export default apiRouter;
