// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  CAMPAIGN_CREATOR = 'CAMPAIGN_CREATOR',
  LENDER = 'LENDER',
  BORROWER = 'BORROWER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  roles: UserRole[];
  emailVerified: boolean;
  kycVerified: boolean;
  creditScore: number;
  walletBalance: number;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Campaign Types
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum CampaignCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  CREATIVE = 'CREATIVE',
  COMMUNITY = 'COMMUNITY',
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  ENVIRONMENT = 'ENVIRONMENT',
  BUSINESS = 'BUSINESS',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: CampaignCategory;
  status: CampaignStatus;
  goalAmount: number;
  raisedAmount: number;
  currentAmount: number;
  totalDonors: number;
  progressPercentage: number;
  thumbnailUrl?: string;
  imageUrls?: string[];
  startDate: string;
  endDate: string;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  goalAmount: number;
  totalRaised: number;
  totalDonors: number;
  progressPercentage: number;
  daysRemaining: number;
}

// Donation Types
export interface Donation {
  id: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  donorId: string;
  campaignId: string;
  createdAt: string;
}

// Loan Types
export enum LoanStatus {
  REQUESTED = 'REQUESTED',
  FUNDED = 'FUNDED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
  REJECTED = 'REJECTED',
}

export interface Loan {
  id: string;
  title: string;
  description: string;
  requestedAmount: number;
  fundedAmount: number;
  interestRate: number;
  duration: number;
  purpose: string;
  status: LoanStatus;
  borrowerId: string;
  borrower?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    creditScore: number;
  };
  approvedAt?: string;
  startDate?: string;
  expectedEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepayment {
  id: string;
  emiNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  paidAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message: string;
}

// Admin Types
export interface DashboardStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalLoans: number;
  activeLoans: number;
  defaultedLoans: number;
  defaultRate: number;
  totalFundsRaised: number;
  totalLoaned: number;
  totalTransactions: number;
}
