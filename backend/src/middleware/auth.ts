import { Request, Response, NextFunction } from 'express';
import { JWTUtil, JWTPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  token?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = JWTUtil.verifyAccessToken(token);

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    next(AppError.unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('No user found'));
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JWTUtil.verifyAccessToken(token);
      req.user = payload;
      req.token = token;
    }
  } catch {
    // Silently fail - auth is optional
  }

  next();
}
