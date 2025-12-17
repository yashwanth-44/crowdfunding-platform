import { Loan, LoanStatus, LoanFunding, LoanRepayment } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

export interface CreateLoanInput {
  title: string;
  description: string;
  requestedAmount: number;
  interestRate: number;
  duration: number; // in months
  purpose: string;
}

export interface ApproveLoanInput {
  approved: boolean;
  reason?: string;
}

export interface FundLoanInput {
  amount: number;
}

export class LoanService {
  async createLoanRequest(borrowerId: string, input: CreateLoanInput): Promise<Loan> {
    // Verify borrower exists
    const borrower = await prisma.user.findUnique({
      where: { id: borrowerId },
    });

    if (!borrower) {
      throw AppError.notFound('Borrower not found', 'USER_NOT_FOUND');
    }

    const loan = await prisma.loan.create({
      data: {
        title: input.title,
        description: input.description,
        requestedAmount: input.requestedAmount,
        interestRate: input.interestRate,
        duration: input.duration,
        purpose: input.purpose,
        borrowerId,
        status: 'REQUESTED',
      },
    });

    return loan;
  }

  async getLoanById(id: string): Promise<Loan | null> {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        borrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            creditScore: true,
          },
        },
        fundings: true,
        repayments: true,
      },
    });
  }

  async getLoans(
    status?: LoanStatus,
    page = 1,
    limit = 20
  ): Promise<{ loans: Loan[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          borrower: {
            select: { id: true, firstName: true, lastName: true },
          },
          fundings: true,
        },
      }),
      prisma.loan.count({ where }),
    ]);

    return { loans, total };
  }

  async getLoansByBorrower(borrowerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: { borrowerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          fundings: true,
          repayments: true,
        },
      }),
      prisma.loan.count({ where: { borrowerId } }),
    ]);

    return { loans, total };
  }

  async approveLoan(loanId: string, adminId: string, input: ApproveLoanInput): Promise<Loan> {
    const loan = await this.getLoanById(loanId);

    if (!loan) {
      throw AppError.notFound('Loan not found', 'LOAN_NOT_FOUND');
    }

    if (loan.status !== 'REQUESTED') {
      throw AppError.badRequest('Only requested loans can be approved', 'INVALID_STATUS');
    }

    const newStatus = input.approved ? 'FUNDED' : 'REJECTED';

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: newStatus as any,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    return updated;
  }

  async fundLoan(loanId: string, lenderId: string, amount: number, stripeTxId?: string): Promise<LoanFunding> {
    const loan = await this.getLoanById(loanId);

    if (!loan) {
      throw AppError.notFound('Loan not found', 'LOAN_NOT_FOUND');
    }

    if (loan.status !== 'FUNDED') {
      throw AppError.badRequest('Loan is not available for funding', 'INVALID_STATUS');
    }

    if (loan.fundedAmount + amount > loan.requestedAmount) {
      throw AppError.badRequest(
        'Funding amount exceeds loan requirement',
        'INVALID_AMOUNT'
      );
    }

    const funding = await prisma.$transaction(async (tx) => {
      const newFunding = await tx.loanFunding.create({
        data: {
          loanId,
          lenderId,
          amount,
          stripeTxId,
        },
      });

      // Update loan funded amount
      await tx.loan.update({
        where: { id: loanId },
        data: {
          fundedAmount: { increment: amount },
        },
      });

      // Check if fully funded
      const updatedLoan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      if (updatedLoan && updatedLoan.fundedAmount >= updatedLoan.requestedAmount) {
        // Generate EMI schedule
        await this.generateEMISchedule(loanId, updatedLoan.requestedAmount, updatedLoan.interestRate, updatedLoan.duration, tx);

        // Update status to ACTIVE
        await tx.loan.update({
          where: { id: loanId },
          data: {
            status: 'ACTIVE',
            startDate: new Date(),
          },
        });
      }

      return newFunding;
    });

    return funding;
  }

  async getLoanFundings(loanId: string): Promise<LoanFunding[]> {
    return prisma.loanFunding.findMany({
      where: { loanId },
      include: {
        lender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async recordRepayment(
    loanId: string,
    repaymentId: string,
    amount: number,
    stripeTxId?: string
  ): Promise<LoanRepayment> {
    const repayment = await prisma.loanRepayment.findUnique({
      where: { id: repaymentId },
    });

    if (!repayment) {
      throw AppError.notFound('Repayment not found', 'REPAYMENT_NOT_FOUND');
    }

    const updated = await prisma.loanRepayment.update({
      where: { id: repaymentId },
      data: {
        paidAmount: amount,
        status: 'PAID',
        paidAt: new Date(),
        stripeTxId,
      },
    });

    // Check if all repayments are done
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { repayments: true },
    });

    if (loan) {
      const allPaid = loan.repayments.every((r) => r.status === 'PAID');

      if (allPaid) {
        await prisma.loan.update({
          where: { id: loanId },
          data: {
            status: 'COMPLETED',
          },
        });
      }
    }

    return updated;
  }

  async getLoanRepayments(loanId: string): Promise<LoanRepayment[]> {
    return prisma.loanRepayment.findMany({
      where: { loanId },
      orderBy: { dueDate: 'asc' },
    });
  }

  private async generateEMISchedule(
    loanId: string,
    principal: number,
    annualRate: number,
    durationMonths: number,
    tx: any
  ): Promise<void> {
    const monthlyRate = annualRate / 100 / 12;
    const emiAmount = (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / (Math.pow(1 + monthlyRate, durationMonths) - 1);

    let remainingPrincipal = principal;
    const startDate = new Date();

    for (let month = 1; month <= durationMonths; month++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month);

      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = emiAmount - interestPayment;

      await tx.loanRepayment.create({
        data: {
          loanId,
          emiNumber: month,
          dueDate,
          principal: principalPayment,
          interest: interestPayment,
          totalAmount: emiAmount,
        },
      });

      remainingPrincipal -= principalPayment;
    }
  }
}
