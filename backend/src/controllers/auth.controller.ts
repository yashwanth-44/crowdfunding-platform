import { Request, Response, NextFunction } from 'express';
import { AuthService, SignupInput, LoginInput } from '../services/auth.service';
import { authValidators } from '../validators/index';
import { successResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = authValidators.signup.parse(req.body);
      const result = await authService.signup(validated);
      res.status(201).json(successResponse(result, 'User registered successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = authValidators.login.parse(req.body);
      const result = await authService.login(validated);
      res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = authValidators.refreshToken.parse(req.body);
      const result = await authService.refreshTokens(refreshToken);
      res.status(200).json(successResponse(result, 'Token refreshed'));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(successResponse(userWithoutPassword, 'Profile retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const validated = authValidators.updateProfile.parse(req.body);
      const user = await authService.updateProfile(req.user.userId, validated);

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(successResponse(userWithoutPassword, 'Profile updated'));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const validated = authValidators.changePassword.parse(req.body);
      await authService.changePassword(req.user.userId, validated.oldPassword, validated.newPassword);

      res.status(200).json(successResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }
}
