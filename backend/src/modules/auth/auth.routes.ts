import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticateToken } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();
const controller = new AuthController();

// Public routes (Rate limited)
router.post('/register', authLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authLimiter, validateBody(loginSchema), controller.login);
router.post('/refresh', validateBody(refreshTokenSchema), controller.refreshToken);

// Protected routes
router.post('/logout', authenticateToken, controller.logout);
router.get('/me', authenticateToken, controller.getMe);
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), controller.updateProfile);
router.put('/password', authenticateToken, validateBody(changePasswordSchema), controller.changePassword);
router.post('/connect-upay', authenticateToken, controller.connectUpay);

export default router;
