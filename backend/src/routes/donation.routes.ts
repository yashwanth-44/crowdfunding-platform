import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const donationController = new DonationController();

/**
 * @route   POST /api/donations/campaign/:campaignId
 * @desc    Donate to a campaign
 * @access  Private
 */
router.post('/campaign/:campaignId', authMiddleware, (req, res, next) =>
  donationController.createDonation(req as any, res, next)
);

/**
 * @route   GET /api/donations/campaign/:campaignId
 * @desc    Get donations for a campaign
 * @access  Public
 */
router.get('/campaign/:campaignId', (req, res, next) =>
  donationController.getCampaignDonations(req, res, next)
);

/**
 * @route   GET /api/donations/user/history
 * @desc    Get user's donation history
 * @access  Private
 */
router.get('/user/history', authMiddleware, (req, res, next) =>
  donationController.getUserDonations(req as any, res, next)
);

/**
 * @route   GET /api/donations/user/total
 * @desc    Get total amount user has donated
 * @access  Private
 */
router.get('/user/total', authMiddleware, (req, res, next) =>
  donationController.getUserTotalDonated(req as any, res, next)
);

export default router;
