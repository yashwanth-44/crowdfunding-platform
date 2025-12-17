import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', (req, res, next) => authController.signup(req, res, next));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, (req, res, next) =>
  authController.getProfile(req as any, res, next)
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, (req, res, next) =>
  authController.updateProfile(req as any, res, next)
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password', authMiddleware, (req, res, next) =>
  authController.changePassword(req as any, res, next)
);

export default router;
