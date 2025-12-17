import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service';
import { campaignValidators } from '../validators/index';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const campaignService = new CampaignService();

export class CampaignController {
  async createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const validated = campaignValidators.create.parse(req.body);
      const campaign = await campaignService.createCampaign(req.user.userId, validated);

      res.status(201).json(successResponse(campaign, 'Campaign created successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const validated = campaignValidators.update.parse(req.body);
      const campaign = await campaignService.updateCampaign(id, req.user.userId, validated);

      res.status(200).json(successResponse(campaign, 'Campaign updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await campaignService.getCampaignById(id);

      if (!campaign) {
        return next(new Error('Campaign not found'));
      }

      res.status(200).json(successResponse(campaign, 'Campaign retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, category, search, page = '1', limit = '20' } = req.query;

      const { campaigns, total } = await campaignService.getCampaigns({
        status: status as any,
        category: category as any,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.status(200).json(
        paginatedResponse(
          campaigns,
          total,
          parseInt(page as string),
          parseInt(limit as string),
          'Campaigns retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async publishCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const campaign = await campaignService.publishCampaign(id, req.user.userId);

      res.status(200).json(successResponse(campaign, 'Campaign published successfully'));
    } catch (error) {
      next(error);
    }
  }

  async cancelCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const campaign = await campaignService.cancelCampaign(id, req.user.userId);

      res.status(200).json(successResponse(campaign, 'Campaign cancelled successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getCampaignStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await campaignService.getCampaignStats(id);

      res.status(200).json(successResponse(stats, 'Campaign stats retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
