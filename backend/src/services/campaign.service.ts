import { Campaign, CampaignStatus, CampaignCategory, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { cacheDelete, cacheDeletePattern, cacheGet, cacheSet, cacheKeys } from '../config/redis';
import { AppError } from '../utils/errors';

export interface CreateCampaignInput {
  title: string;
  description: string;
  category: CampaignCategory;
  goalAmount: number;
  startDate: string;
  endDate: string;
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  goalAmount?: number;
  endDate?: string;
}

export interface CampaignFilter {
  status?: CampaignStatus;
  category?: CampaignCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export class CampaignService {
  async createCampaign(creatorId: string, input: CreateCampaignInput): Promise<Campaign> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (endDate <= startDate) {
      throw AppError.badRequest('End date must be after start date', 'INVALID_DATE_RANGE');
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        goalAmount: input.goalAmount,
        creatorId,
        startDate,
        endDate,
        status: 'DRAFT',
      },
    });

    // Clear cache
    await cacheDeletePattern('campaigns:*');

    return campaign;
  }

  async updateCampaign(campaignId: string, creatorId: string, input: UpdateCampaignInput): Promise<Campaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    if (campaign.creatorId !== creatorId) {
      throw AppError.forbidden('You can only edit your own campaigns', 'FORBIDDEN');
    }

    if (campaign.status !== 'DRAFT') {
      throw AppError.badRequest('Only draft campaigns can be edited', 'INVALID_STATUS');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: input,
    });

    // Clear cache
    await cacheDelete(cacheKeys.campaign(campaignId));
    await cacheDeletePattern('campaigns:*');

    return updated;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    // Try cache first
    const cached = await cacheGet<Campaign>(cacheKeys.campaign(id));
    if (cached) return cached;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (campaign) {
      await cacheSet(cacheKeys.campaign(id), campaign);
    }

    return campaign;
  }

  async getCampaigns(filter: CampaignFilter): Promise<{ campaigns: Campaign[]; total: number }> {
    const { status, category, search, page = 1, limit = 20 } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    return { campaigns, total };
  }

  async publishCampaign(campaignId: string, creatorId: string): Promise<Campaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    if (campaign.creatorId !== creatorId) {
      throw AppError.forbidden('You can only publish your own campaigns', 'FORBIDDEN');
    }

    if (campaign.status !== 'DRAFT') {
      throw AppError.badRequest('Only draft campaigns can be published', 'INVALID_STATUS');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'ACTIVE' },
    });

    await cacheDelete(cacheKeys.campaign(campaignId));
    await cacheDeletePattern('campaigns:*');

    return updated;
  }

  async cancelCampaign(campaignId: string, creatorId: string): Promise<Campaign> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    if (campaign.creatorId !== creatorId) {
      throw AppError.forbidden('You can only cancel your own campaigns', 'FORBIDDEN');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    });

    await cacheDelete(cacheKeys.campaign(campaignId));
    await cacheDeletePattern('campaigns:*');

    return updated;
  }

  async getCampaignStats(campaignId: string) {
    const campaign = await this.getCampaignById(campaignId);

    if (!campaign) {
      throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    const donations = await prisma.donation.findMany({
      where: { campaignId },
    });

    const totalDonors = donations.length;
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const progressPercentage = (totalRaised / campaign.goalAmount) * 100;

    return {
      goalAmount: campaign.goalAmount,
      totalRaised,
      totalDonors,
      progressPercentage,
      daysRemaining: Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    };
  }

  async updateCampaignProgress(campaignId: string): Promise<void> {
    const donations = await prisma.donation.findMany({
      where: { campaignId },
    });

    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = donations.length;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (campaign) {
      const progressPercentage = (totalRaised / campaign.goalAmount) * 100;

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          currentAmount: totalRaised,
          raisedAmount: totalRaised,
          totalDonors,
          progressPercentage,
        },
      });

      await cacheDelete(cacheKeys.campaign(campaignId));
    }
  }
}
