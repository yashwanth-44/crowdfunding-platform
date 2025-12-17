import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();
const loanController = new LoanController();

/**
 * @route   POST /api/loans
 * @desc    Create a loan request
 * @access  Private - BORROWER
 */
router.post('/', authMiddleware, requireRole('BORROWER'), (req, res, next) =>
  loanController.createLoanRequest(req as any, res, next)
);

/**
 * @route   GET /api/loans
 * @desc    Get all loans
 * @access  Public
 */
router.get('/', (req, res, next) => loanController.getLoans(req, res, next));

/**
 * @route   GET /api/loans/:id
 * @desc    Get loan by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => loanController.getLoan(req, res, next));

/**
 * @route   GET /api/loans/user/my-loans
 * @desc    Get user's loans
 * @access  Private
 */
router.get('/user/my-loans', authMiddleware, (req, res, next) =>
  loanController.getUserLoans(req as any, res, next)
);

/**
 * @route   POST /api/loans/:id/approve
 * @desc    Approve/reject loan
 * @access  Private - ADMIN
 */
router.post('/:id/approve', authMiddleware, requireRole('ADMIN'), (req, res, next) =>
  loanController.approveLoan(req as any, res, next)
);

/**
 * @route   POST /api/loans/:id/fund
 * @desc    Fund a loan
 * @access  Private - LENDER
 */
router.post('/:id/fund', authMiddleware, requireRole('LENDER'), (req, res, next) =>
  loanController.fundLoan(req as any, res, next)
);

/**
 * @route   GET /api/loans/:id/fundings
 * @desc    Get loan fundings
 * @access  Public
 */
router.get('/:id/fundings', (req, res, next) =>
  loanController.getLoanFundings(req, res, next)
);

/**
 * @route   GET /api/loans/:id/repayments
 * @desc    Get loan repayments schedule
 * @access  Public
 */
router.get('/:id/repayments', (req, res, next) =>
  loanController.getLoanRepayments(req, res, next)
);

export default router;
