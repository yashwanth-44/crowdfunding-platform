import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authMiddleware, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();
const campaignController = new CampaignController();

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign
 * @access  Private - CAMPAIGN_CREATOR
 */
router.post(
  '/',
  authMiddleware,
  requireRole('CAMPAIGN_CREATOR'),
  (req, res, next) => campaignController.createCampaign(req as any, res, next)
);

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns with filters
 * @access  Public
 */
router.get('/', optionalAuth, (req, res, next) =>
  campaignController.getCampaigns(req, res, next)
);

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get campaign by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => campaignController.getCampaign(req, res, next));

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update campaign
 * @access  Private - Campaign Creator
 */
router.put('/:id', authMiddleware, (req, res, next) =>
  campaignController.updateCampaign(req as any, res, next)
);

/**
 * @route   POST /api/campaigns/:id/publish
 * @desc    Publish campaign
 * @access  Private - Campaign Creator
 */
router.post('/:id/publish', authMiddleware, (req, res, next) =>
  campaignController.publishCampaign(req as any, res, next)
);

/**
 * @route   POST /api/campaigns/:id/cancel
 * @desc    Cancel campaign
 * @access  Private - Campaign Creator
 */
router.post('/:id/cancel', authMiddleware, (req, res, next) =>
  campaignController.cancelCampaign(req as any, res, next)
);

/**
 * @route   GET /api/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Public
 */
router.get('/:id/stats', (req, res, next) =>
  campaignController.getCampaignStats(req, res, next)
);

export default router;
