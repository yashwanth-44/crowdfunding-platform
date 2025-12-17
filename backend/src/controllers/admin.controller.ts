import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { successResponse } from '../utils/response';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';

export class AdminController {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        totalCampaigns,
        activeCampaigns,
        totalLoans,
        activeLoans,
        defaultedLoans,
        totalTransactions,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.campaign.count(),
        prisma.campaign.count({ where: { status: 'ACTIVE' } }),
        prisma.loan.count(),
        prisma.loan.count({ where: { status: 'ACTIVE' } }),
        prisma.loan.count({ where: { status: 'DEFAULTED' } }),
        prisma.transaction.count(),
      ]);

      const totalFundsRaised = await prisma.donation.aggregate({
        _sum: { amount: true },
      });

      const totalLoaned = await prisma.loanFunding.aggregate({
        _sum: { amount: true },
      });

      const stats = {
        totalUsers,
        totalCampaigns,
        activeCampaigns,
        totalLoans,
        activeLoans,
        defaultedLoans,
        defaultRate: totalLoans > 0 ? (defaultedLoans / totalLoans) * 100 : 0,
        totalFundsRaised: totalFundsRaised._sum.amount || 0,
        totalLoaned: totalLoaned._sum.amount || 0,
        totalTransactions,
      };

      res.status(200).json(successResponse(stats, 'Dashboard stats retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPendingCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: { status: 'DRAFT' },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(successResponse(campaigns, 'Pending campaigns retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async approveCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;

      const campaign = await prisma.campaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
      }

      const updated = await prisma.campaign.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          action: 'APPROVE_CAMPAIGN',
          adminId: req.user.userId,
          entityType: 'campaign',
          entityId: id,
          changes: JSON.stringify({ status: 'DRAFT -> ACTIVE' }),
        },
      });

      res.status(200).json(successResponse(updated, 'Campaign approved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async rejectCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const { reason } = req.body;

      const campaign = await prisma.campaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        throw AppError.notFound('Campaign not found', 'CAMPAIGN_NOT_FOUND');
      }

      const updated = await prisma.campaign.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await prisma.adminAuditLog.create({
        data: {
          action: 'REJECT_CAMPAIGN',
          adminId: req.user.userId,
          entityType: 'campaign',
          entityId: id,
          reason,
          changes: JSON.stringify({ status: 'DRAFT -> CANCELLED' }),
        },
      });

      res.status(200).json(successResponse(updated, 'Campaign rejected successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPendingLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loans = await prisma.loan.findMany({
        where: { status: 'REQUESTED' },
        include: {
          borrower: { select: { id: true, firstName: true, lastName: true, email: true, creditScore: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(successResponse(loans, 'Pending loans retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { userId } = req.params;
      const { reason } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: true,
          blockedReason: reason,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          action: 'BLOCK_USER',
          adminId: req.user.userId,
          entityType: 'user',
          entityId: userId,
          changes: JSON.stringify({ isBlocked: true, blockedReason: reason }),
          reason,
        },
      });

      res.status(200).json(successResponse(user, 'User blocked successfully'));
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { userId } = req.params;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isBlocked: false,
          blockedReason: null,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          action: 'UNBLOCK_USER',
          adminId: req.user.userId,
          entityType: 'user',
          entityId: userId,
          changes: JSON.stringify({ isBlocked: false, blockedReason: null }),
        },
      });

      res.status(200).json(successResponse(user, 'User unblocked successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = '50', offset = '0' } = req.query;

      const logs = await prisma.adminAuditLog.findMany({
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      const total = await prisma.adminAuditLog.count();

      res.status(200).json(
        successResponse({ logs, total }, 'Audit logs retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
