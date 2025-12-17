import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and ADMIN role
router.use(authMiddleware, requireRole('ADMIN'));

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private - ADMIN
 */
router.get('/stats', (req, res, next) =>
  adminController.getDashboardStats(req as any, res, next)
);

/**
 * @route   GET /api/admin/campaigns/pending
 * @desc    Get pending campaigns
 * @access  Private - ADMIN
 */
router.get('/campaigns/pending', (req, res, next) =>
  adminController.getPendingCampaigns(req, res, next)
);

/**
 * @route   POST /api/admin/campaigns/:id/approve
 * @desc    Approve a campaign
 * @access  Private - ADMIN
 */
router.post('/campaigns/:id/approve', (req, res, next) =>
  adminController.approveCampaign(req as any, res, next)
);

/**
 * @route   POST /api/admin/campaigns/:id/reject
 * @desc    Reject a campaign
 * @access  Private - ADMIN
 */
router.post('/campaigns/:id/reject', (req, res, next) =>
  adminController.rejectCampaign(req as any, res, next)
);

/**
 * @route   GET /api/admin/loans/pending
 * @desc    Get pending loans
 * @access  Private - ADMIN
 */
router.get('/loans/pending', (req, res, next) =>
  adminController.getPendingLoans(req, res, next)
);

/**
 * @route   POST /api/admin/users/:userId/block
 * @desc    Block a user
 * @access  Private - ADMIN
 */
router.post('/users/:userId/block', (req, res, next) =>
  adminController.blockUser(req as any, res, next)
);

/**
 * @route   POST /api/admin/users/:userId/unblock
 * @desc    Unblock a user
 * @access  Private - ADMIN
 */
router.post('/users/:userId/unblock', (req, res, next) =>
  adminController.unblockUser(req as any, res, next)
);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private - ADMIN
 */
router.get('/audit-logs', (req, res, next) =>
  adminController.getAuditLogs(req, res, next)
);

export default router;
