import { z } from 'zod';

export const authValidators = {
  signup: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    roles: z.array(z.enum(['CAMPAIGN_CREATOR', 'LENDER', 'BORROWER'])).min(1),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string(),
  }),

  refreshToken: z.object({
    refreshToken: z.string().nonempty('Refresh token is required'),
  }),

  updateProfile: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),

  changePassword: z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
};

export const campaignValidators = {
  create: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.enum([
      'TECHNOLOGY',
      'CREATIVE',
      'COMMUNITY',
      'EDUCATION',
      'HEALTHCARE',
      'ENVIRONMENT',
      'BUSINESS',
      'SOCIAL',
      'OTHER',
    ]),
    goalAmount: z.number().positive('Goal amount must be positive'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),

  update: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).optional(),
    goalAmount: z.number().positive().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

export const loanValidators = {
  create: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20),
    requestedAmount: z.number().positive('Amount must be positive'),
    interestRate: z.number().min(0).max(100, 'Interest rate must be between 0-100'),
    duration: z.number().int().min(1, 'Duration must be at least 1 month'),
    purpose: z.string().min(10),
  }),

  approveLoan: z.object({
    approved: z.boolean(),
    reason: z.string().optional(),
  }),
};

export const donationValidators = {
  create: z.object({
    amount: z.number().positive('Amount must be positive'),
    isAnonymous: z.boolean().default(false),
    message: z.string().max(500).optional(),
  }),
};

export const loanFundingValidators = {
  create: z.object({
    amount: z.number().positive('Amount must be positive'),
  }),
};

export type SignupRequest = z.infer<typeof authValidators.signup>;
export type LoginRequest = z.infer<typeof authValidators.login>;
export type CreateCampaignRequest = z.infer<typeof campaignValidators.create>;
export type CreateLoanRequest = z.infer<typeof loanValidators.create>;
