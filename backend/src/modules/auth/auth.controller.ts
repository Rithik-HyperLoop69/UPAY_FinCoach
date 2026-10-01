import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      return sendSuccess(res, tokens, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;
      await this.authService.logout(refreshToken, userId);
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const user = await this.authService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const user = await this.authService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.authService.changePassword(req.user.userId, req.body);
      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  };

  connectUpay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const { walletNumber } = req.body;
      const user = await this.authService.connectUpayWallet(req.user.userId, walletNumber);
      return sendSuccess(res, user, 'upay wallet linked successfully');
    } catch (error) {
      next(error);
    }
  };
}
