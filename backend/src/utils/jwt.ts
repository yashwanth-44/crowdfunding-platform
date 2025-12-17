import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

export class JWTUtil {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret as string, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret as string, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret as string) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}
