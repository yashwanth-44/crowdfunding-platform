import { Donation, Transaction, TransactionType } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { CampaignService } from './campaign.service';

const campaignService = new CampaignService();

export interface CreateDonationInput {
  amount: number;
  isAnonymous: boolean;
  message?: string;
}

export class DonationService {
  async createDonation(
    donorId: string,
    campaignId: string,
    input: CreateDonationInput,
    stripeTxId?: string
  ): Promise<Donation> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    if (campaign.status !== 'ACTIVE') {
      throw AppError.badRequest('Campaign is not active', 'CAMPAIGN_INACTIVE');
    }

    if (campaign.endDate < new Date()) {
      throw AppError.badRequest('Campaign has ended', 'CAMPAIGN_EXPIRED');
    }

    // Create donation within transaction
    const donation = await prisma.$transaction(async (tx) => {
      const newDonation = await tx.donation.create({
        data: {
          donorId,
          campaignId,
          amount: input.amount,
          isAnonymous: input.isAnonymous,
          message: input.message,
          stripeTxId,
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          type: TransactionType.DONATION,
          status: 'COMPLETED',
          amount: input.amount,
          userId: donorId,
          referenceId: campaignId,
          referenceType: 'campaign',
          stripeTxId,
          description: `Donation to campaign: ${campaign.title}`,
        },
      });

      // Update campaign stats
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          raisedAmount: { increment: input.amount },
          currentAmount: { increment: input.amount },
          totalDonors: { increment: 1 },
          progressPercentage: ((campaign.raisedAmount + input.amount) / campaign.goalAmount) * 100,
        },
      });

      return newDonation;
    });

    // Update cache
    await campaignService.updateCampaignProgress(campaignId);

    return donation;
  }

  async getDonationsByCampaign(campaignId: string, limit = 50): Promise<Donation[]> {
    return prisma.donation.findMany({
      where: { campaignId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getDonationsByUser(donorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { donorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      }),
      prisma.donation.count({ where: { donorId } }),
    ]);

    return { donations, total };
  }

  async getTotalDonatedAmount(donorId: string): Promise<number> {
    const result = await prisma.donation.aggregate({
      where: { donorId },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }
}
