import { Request, Response, NextFunction } from 'express';
import { LoanService } from '../services/loan.service';
import { loanValidators } from '../validators/index';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const loanService = new LoanService();

export class LoanController {
  async createLoanRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const validated = loanValidators.create.parse(req.body);
      const loan = await loanService.createLoanRequest(req.user.userId, validated);

      res.status(201).json(successResponse(loan, 'Loan request created successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async getLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const loan = await loanService.getLoanById(id);

      if (!loan) {
        return next(new Error('Loan not found'));
      }

      res.status(200).json(successResponse(loan, 'Loan retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page = '1', limit = '20' } = req.query;

      const { loans, total } = await loanService.getLoans(
        status as any,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(
        paginatedResponse(
          loans,
          total,
          parseInt(page as string),
          parseInt(limit as string),
          'Loans retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserLoans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { page = '1', limit = '20' } = req.query;

      const { loans, total } = await loanService.getLoansByBorrower(
        req.user.userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json(
        paginatedResponse(
          loans,
          total,
          parseInt(page as string),
          parseInt(limit as string),
          'User loans retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async approveLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const validated = loanValidators.approveLoan.parse(req.body);
      const loan = await loanService.approveLoan(id, req.user.userId, validated);

      res.status(200).json(successResponse(loan, 'Loan approved/rejected successfully'));
    } catch (error) {
      next(error);
    }
  }

  async fundLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');

      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return next(new Error('Invalid funding amount'));
      }

      const funding = await loanService.fundLoan(id, req.user.userId, amount);

      res.status(201).json(successResponse(funding, 'Loan funded successfully', 201));
    } catch (error) {
      next(error);
    }
  }

  async getLoanFundings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const fundings = await loanService.getLoanFundings(id);

      res.status(200).json(successResponse(fundings, 'Loan fundings retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getLoanRepayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repayments = await loanService.getLoanRepayments(id);

      res.status(200).json(successResponse(repayments, 'Loan repayments retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
