import { User, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { PasswordUtil } from '../utils/password';
import { JWTUtil, JWTPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw AppError.conflict('Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        roles: input.roles,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive || user.isBlocked) {
      throw AppError.forbidden('Account is inactive or blocked', 'ACCOUNT_INACTIVE');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = JWTUtil.verifyRefreshToken(refreshToken);

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive || user.isBlocked) {
        throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        },
        ...tokens,
      };
    } catch (error) {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token', 'INVALID_TOKEN');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }

    const isPasswordValid = await PasswordUtil.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Current password is incorrect', 'INVALID_PASSWORD');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  private generateTokens(user: User) {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: JWTUtil.generateAccessToken(payload),
      refreshToken: JWTUtil.generateRefreshToken(payload),
    };
  }
}
