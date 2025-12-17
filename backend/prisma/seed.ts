import { PrismaClient, UserRole, CampaignCategory } from '@prisma/client';
import { PasswordUtil } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.donation.deleteMany();
  await prisma.loanRepayment.deleteMany();
  await prisma.loanFunding.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.campaignUpdate.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@crowdfunding.com',
      password: await PasswordUtil.hash('Admin@123'),
      firstName: 'Admin',
      lastName: 'User',
      roles: [UserRole.ADMIN],
      emailVerified: true,
      kycVerified: true,
      isActive: true,
    },
  });

  const creator1 = await prisma.user.create({
    data: {
      email: 'creator@example.com',
      password: await PasswordUtil.hash('Creator@123'),
      firstName: 'John',
      lastName: 'Creator',
      roles: [UserRole.CAMPAIGN_CREATOR, UserRole.LENDER],
      emailVerified: true,
      kycVerified: true,
      isActive: true,
      creditScore: 750,
    },
  });

  const lender1 = await prisma.user.create({
    data: {
      email: 'lender@example.com',
      password: await PasswordUtil.hash('Lender@123'),
      firstName: 'Jane',
      lastName: 'Lender',
      roles: [UserRole.LENDER],
      emailVerified: true,
      kycVerified: true,
      isActive: true,
      creditScore: 800,
      walletBalance: 50000,
    },
  });

  const borrower1 = await prisma.user.create({
    data: {
      email: 'borrower@example.com',
      password: await PasswordUtil.hash('Borrower@123'),
      firstName: 'Mike',
      lastName: 'Borrower',
      roles: [UserRole.BORROWER],
      emailVerified: true,
      kycVerified: true,
      isActive: true,
      creditScore: 650,
    },
  });

  console.log('👥 Created sample users');

  // Create campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      title: 'Revolutionary AI Healthcare Platform',
      description: 'Help us build the next generation of AI-powered healthcare diagnostics. Our platform uses cutting-edge machine learning to provide accurate disease detection.',
      category: CampaignCategory.TECHNOLOGY,
      status: 'ACTIVE',
      goalAmount: 50000,
      raisedAmount: 15000,
      currentAmount: 15000,
      totalDonors: 42,
      progressPercentage: 30,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      creatorId: creator1.id,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: 'Clean Water Initiative for Rural Communities',
      description: 'Building sustainable water purification systems in underprivileged areas. Join us in bringing clean drinking water to 10,000+ people.',
      category: CampaignCategory.COMMUNITY,
      status: 'ACTIVE',
      goalAmount: 30000,
      raisedAmount: 22000,
      currentAmount: 22000,
      totalDonors: 156,
      progressPercentage: 73.33,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      creatorId: creator1.id,
    },
  });

  console.log('📺 Created sample campaigns');

  // Create donations
  await prisma.donation.create({
    data: {
      amount: 500,
      campaignId: campaign1.id,
      donorId: lender1.id,
      isAnonymous: false,
      message: 'Great initiative! Keep up the good work.',
    },
  });

  await prisma.donation.create({
    data: {
      amount: 1000,
      campaignId: campaign2.id,
      donorId: lender1.id,
      isAnonymous: false,
      message: 'This is crucial for our society.',
    },
  });

  console.log('💰 Created sample donations');

  // Create loans
  const loan1 = await prisma.loan.create({
    data: {
      title: 'Small Business Expansion Loan',
      description: 'Looking to expand my coffee shop business to a second location. Need funds for equipment and renovation.',
      requestedAmount: 25000,
      fundedAmount: 0,
      interestRate: 8.5,
      duration: 24,
      purpose: 'Business expansion',
      borrowerId: borrower1.id,
      status: 'FUNDED',
    },
  });

  console.log('📋 Created sample loans');

  // Create loan fundings
  await prisma.loanFunding.create({
    data: {
      amount: 15000,
      loanId: loan1.id,
      lenderId: lender1.id,
    },
  });

  console.log('🏦 Created sample loan fundings');

  // Create platform stats
  await prisma.platformStats.create({
    data: {
      totalFundsRaised: 37000,
      totalLoansActive: 1,
      totalUsers: 4,
      totalCampaigns: 2,
      defaultRate: 0,
    },
  });

  console.log('📊 Created platform stats');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
