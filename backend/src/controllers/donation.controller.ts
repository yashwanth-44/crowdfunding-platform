import { Request, Response, NextFunction } from 'express';
import { DonationService } from '../services/donation.service';
import { donationValidators } from '../validators/index';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

const donationService = new DonationService();

export class DonationController {
  async createDonation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { campaignId } = req.params;
      const validated = donationValidators.create.parse(req.body);

      // TODO: Integrate with Stripe to process payment
      const donation = await donationService.createDonation(
        req.user.userId,
        campaignId,
        validated
      );

      res.status(201).json(successResponse(donation, 'Donation created successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async getCampaignDonations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { campaignId } = req.params;
      const donations = await donationService.getDonationsByCampaign(campaignId);

      res.status(200).json(successResponse(donations, 'Donations retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUserDonations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { page = '1', limit = '20' } = req.query;
      const { donations, total } = await donationService.getDonationsByUser(
        req.user.userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(
        paginatedResponse(
          donations,
          total,
          parseInt(page as string),
          parseInt(limit as string),
          'User donations retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserTotalDonated(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const total = await donationService.getTotalDonatedAmount(req.user.userId);

      res.status(200).json(
        successResponse({ total }, 'Total donated amount retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
