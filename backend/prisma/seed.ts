import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for upay FinCoach...');

  // Clean existing records if any
  await prisma.aIMessage.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.forecastPoint.deleteMany({});
  await prisma.savingsGoal.deleteMany({});
  await prisma.budgetItem.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.financialProfile.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@upay.com',
      passwordHash,
      fullName: 'Tanvir Ahmed',
      phone: '+8801712345678',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      upayWalletNumber: '01712345678',
      upayConnected: true,
      profile: {
        create: {
          monthlyIncome: 65000.0,
          primaryIncomeSource: 'Senior Software Engineer',
          riskTolerance: 'MODERATE',
          savingsTargetPercent: 25.0,
          occupation: 'Tech Specialist & Consultant',
          primaryCurrency: 'BDT',
          financialHealthScore: 78.5,
          financialPersona: 'Disciplined Growth Builder',
          emergencyFundMonths: 4.0,
        },
      },
    },
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Create Standard Categories
  const categories = [
    { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#10B981' },
    { name: 'Freelance & Consulting', type: 'INCOME', icon: 'laptop', color: '#06B6D4' },
    { name: 'Investment Returns', type: 'INCOME', icon: 'trending-up', color: '#8B5CF6' },
    { name: 'Rent & Housing', type: 'EXPENSE', icon: 'home', color: '#F43F5E' },
    { name: 'Food & Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#F59E0B' },
    { name: 'Dining Out & Cafes', type: 'EXPENSE', icon: 'coffee', color: '#EC4899' },
    { name: 'Transportation & Fuel', type: 'EXPENSE', icon: 'car', color: '#3B82F6' },
    { name: 'Bills & Utilities', type: 'EXPENSE', icon: 'zap', color: '#EAB308' },
    { name: 'Internet & Mobile', type: 'EXPENSE', icon: 'wifi', color: '#6366F1' },
    { name: 'Healthcare & Pharmacy', type: 'EXPENSE', icon: 'heart', color: '#EF4444' },
    { name: 'Entertainment & Subs', type: 'EXPENSE', icon: 'tv', color: '#A855F7' },
    { name: 'Family & Transfers', type: 'EXPENSE', icon: 'users', color: '#14B8A6' },
    { name: 'Savings & DPS', type: 'TRANSFER', icon: 'shield-check', color: '#00C897' },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        ...cat,
        userId: demoUser.id,
        isSystem: true,
      },
    });
  }

  // 3. Seed Realistic Bangladesh Transactions across the last 4 months
  // We'll generate transactions for Month -3, Month -2, Month -1, and Current Month
  const now = new Date();
  const transactionsToCreate: any[] = [];

  for (let m = 3; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const baseDate = new Date(year, month, 1);

    // 1st of month: Monthly Salary
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'INCOME',
      amount: 65000.0,
      category: 'Salary',
      description: 'Monthly Corporate Salary - Upay Direct Deposit',
      date: new Date(year, month, 1, 9, 30),
      merchant: 'Brain Station 23 / Employer Ltd',
      paymentMethod: 'Bank',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
      metadata: JSON.stringify({ transferRef: `SAL-${year}${month + 1}-001`, channel: 'BEFTN' }),
    });

    // 15th of month: Freelance Consulting gig
    if (m !== 1) {
      transactionsToCreate.push({
        userId: demoUser.id,
        type: 'INCOME',
        amount: m === 0 ? 18000.0 : 22000.0,
        category: 'Freelance & Consulting',
        description: 'Fintech UI System Architecture Consultation',
        date: new Date(year, month, 16, 14, 0),
        merchant: 'Global Tech Client',
        paymentMethod: 'upay',
        status: 'COMPLETED',
        isRecurring: false,
        metadata: JSON.stringify({ upayTrxId: `UPAY${Date.now().toString().slice(-8)}`, fee: 0 }),
      });
    }

    // 5th of month: House Rent
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 22000.0,
      category: 'Rent & Housing',
      description: 'Apartment Monthly Rent - Dhanmondi 9/A',
      date: new Date(year, month, 5, 11, 0),
      merchant: 'House Owner (Dhanmondi Residence)',
      paymentMethod: 'Bank',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
    });

    // 8th of month: Internet & Broadband (Link3)
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 1500.0,
      category: 'Internet & Mobile',
      description: 'Fiber Broadband 80 Mbps Monthly Bill',
      date: new Date(year, month, 8, 16, 20),
      merchant: 'Link3 Technologies Ltd',
      paymentMethod: 'upay',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
      metadata: JSON.stringify({ upayTrxId: `UPAYBLL${m}883`, billNo: 'LNK-992384' }),
    });

    // 9th of month: Electricity (DESCO)
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 2850.0 + (m * 120),
      category: 'Bills & Utilities',
      description: 'Prepaid Electric Meter Recharge DESCO',
      date: new Date(year, month, 9, 10, 15),
      merchant: 'DESCO Electricity',
      paymentMethod: 'upay',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
      metadata: JSON.stringify({ meterNo: '0183920192', token: '8392-1928-4920-1928' }),
    });

    // 12th: Mobile FlexiPlan Recharge
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 850.0,
      category: 'Internet & Mobile',
      description: 'Grameenphone 40GB 4G Data & Voice Pack',
      date: new Date(year, month, 12, 18, 45),
      merchant: 'Grameenphone upay Recharge',
      paymentMethod: 'upay',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
    });

    // Groceries (Chaldal / Shwapno) across month
    transactionsToCreate.push(
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 4200.0,
        category: 'Food & Groceries',
        description: 'Monthly Pantry & Cooking Essentials',
        date: new Date(year, month, 4, 19, 0),
        merchant: 'Shwapno Superstore',
        paymentMethod: 'Card',
        status: 'COMPLETED',
      },
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 3800.0,
        category: 'Food & Groceries',
        description: 'Fresh Meat, Fish & Vegetables',
        date: new Date(year, month, 14, 11, 30),
        merchant: 'Chaldal Online Grocery',
        paymentMethod: 'upay',
        status: 'COMPLETED',
      },
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 3100.0,
        category: 'Food & Groceries',
        description: 'Dairy, Bakery & Fruits Refill',
        date: new Date(year, month, 24, 20, 10),
        merchant: 'Meena Bazar',
        paymentMethod: 'Card',
        status: 'COMPLETED',
      }
    );

    // Dining Out & Coffee
    transactionsToCreate.push(
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 1450.0,
        category: 'Dining Out & Cafes',
        description: 'Weekend Artisan Coffee & Breakfast',
        date: new Date(year, month, 7, 10, 0),
        merchant: 'North End Coffee Roasters',
        paymentMethod: 'upay',
        status: 'COMPLETED',
      },
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 2200.0,
        category: 'Dining Out & Cafes',
        description: 'Team Dinner & Burgers',
        date: new Date(year, month, 20, 21, 30),
        merchant: 'Takeout / Chillox Burgers',
        paymentMethod: 'upay',
        status: 'COMPLETED',
      }
    );

    // Transportation (Dhaka Metro Rail + Pathao)
    transactionsToCreate.push(
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 1500.0,
        category: 'Transportation & Fuel',
        description: 'MRT Rapid Pass Card Recharge',
        date: new Date(year, month, 2, 8, 45),
        merchant: 'Dhaka Mass Transit (MRT-6)',
        paymentMethod: 'Cash',
        status: 'COMPLETED',
      },
      {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 2400.0,
        category: 'Transportation & Fuel',
        description: 'Ride sharing & City Commute',
        date: new Date(year, month, 18, 17, 30),
        merchant: 'Pathao / Uber Rides',
        paymentMethod: 'upay',
        status: 'COMPLETED',
      }
    );

    // Subscriptions
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 1200.0,
      category: 'Entertainment & Subs',
      description: 'Netflix 4K Streaming & Spotify Premium',
      date: new Date(year, month, 21, 13, 0),
      merchant: 'Digital Entertainment Services',
      paymentMethod: 'Card',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
    });

    // Family remittances
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'EXPENSE',
      amount: 6000.0,
      category: 'Family & Transfers',
      description: 'Monthly Parents Support Allowance',
      date: new Date(year, month, 6, 12, 0),
      merchant: 'Parents (Sylhet Homeland)',
      paymentMethod: 'upay',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
      metadata: JSON.stringify({ sendMoneyNumber: '01819384910', note: 'Family allowance' }),
    });

    // Monthly Savings DPS
    transactionsToCreate.push({
      userId: demoUser.id,
      type: 'TRANSFER',
      amount: 10000.0,
      category: 'Savings & DPS',
      description: 'Automated upay Digital DPS Savings Deposit',
      date: new Date(year, month, 3, 10, 0),
      merchant: 'upay Savings Scheme (IDLC)',
      paymentMethod: 'upay',
      status: 'COMPLETED',
      isRecurring: true,
      recurringFrequency: 'MONTHLY',
    });
  }

  // Insert all transactions
  await prisma.transaction.createMany({
    data: transactionsToCreate,
  });

  console.log(`💳 Created ${transactionsToCreate.length} realistic historical transactions.`);

  // 4. Create Active Budget for Current Month
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budget = await prisma.budget.create({
    data: {
      userId: demoUser.id,
      month: currentMonthStr,
      totalLimit: 52000.0,
      notes: 'Standard disciplined monthly living budget with 25% target savings cushion.',
      items: {
        create: [
          { category: 'Rent & Housing', limitAmount: 22000.0 },
          { category: 'Food & Groceries', limitAmount: 13000.0 },
          { category: 'Transportation & Fuel', limitAmount: 5000.0 },
          { category: 'Dining Out & Cafes', limitAmount: 4000.0 },
          { category: 'Bills & Utilities', limitAmount: 5000.0 },
          { category: 'Entertainment & Subs', limitAmount: 3000.0 },
        ],
      },
    },
  });

  console.log(`📊 Created Monthly Budget for ${currentMonthStr}: ৳${budget.totalLimit}`);

  // 5. Create Savings Goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Emergency Safety Cushion',
        targetAmount: 150000.0,
        currentAmount: 85000.0,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1),
        category: 'Emergency',
        isCompleted: false,
        notes: 'Targeting 3-4 months of core living expenses.',
      },
      {
        userId: demoUser.id,
        name: 'M3 Pro Workstation Upgrade',
        targetAmount: 240000.0,
        currentAmount: 140000.0,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 4, 15),
        category: 'Tech & Career',
        isCompleted: false,
        notes: 'Upgrading primary remote engineering setup.',
      },
      {
        userId: demoUser.id,
        name: 'Sajek Valley & Cox’s Bazar Tour',
        targetAmount: 45000.0,
        currentAmount: 38000.0,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 2, 20),
        category: 'Travel',
        isCompleted: false,
        notes: 'Annual rejuvenation tour with family.',
      },
    ],
  });

  console.log(`🎯 Created 3 Savings Goals.`);

  // 6. Create Initial Financial Alerts
  await prisma.alert.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'CASH_FLOW_SHORTAGE',
        title: 'Upcoming Liquidity Verification',
        message: 'Upcoming recurring bills (DESCO Electricity + Link3 Internet = ৳4,350) scheduled in the next 7 days. Your projected cash balance remains secure with a ৳18,200 surplus.',
        severity: 'INFO',
        isRead: false,
        actionUrl: '/forecast',
      },
      {
        userId: demoUser.id,
        type: 'BUDGET_WARNING',
        title: 'Dining Out Utilization Notice',
        message: 'You have utilized 85% of your Dining Out & Cafes budget with 12 days remaining this month. Reducing dining orders by ৳1,200 will keep your monthly savings rate above 28%.',
        severity: 'WARNING',
        isRead: false,
        actionUrl: '/budgets',
      },
      {
        userId: demoUser.id,
        type: 'GOAL_MILESTONE',
        title: 'Emergency Cushion Milestone',
        message: 'Congratulations! Your Emergency Safety Cushion has officially crossed 56% of your ৳150,000 goal.',
        severity: 'INFO',
        isRead: true,
        actionUrl: '/goals',
      },
    ],
  });

  console.log(`🔔 Created Initial Alerts.`);

  // 7. Create Sample Initial AI Conversation
  const conversation = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      title: 'Monthly Cash Flow & Savings Strategy',
      messages: {
        create: [
          {
            role: 'user',
            content: 'How is my cash flow looking for next month, and can I safely increase my emergency savings?',
          },
          {
            role: 'assistant',
            content: `**Observed:**
Your average monthly income over the past 3 months is **৳82,333** (including consulting engagements) while baseline recurring living expenses total **৳51,450**. Your current savings rate is **37.5%**.

**Forecast:**
For the upcoming month, deterministic weighted forecasting anticipates net surplus cash flow of **~৳27,500** after satisfying fixed commitments (House Rent ৳22,000, Utilities ৳4,350, Family Allowance ৳6,000).

**Suggestion:**
You can comfortably allocate an extra **৳5,000** to your *Emergency Safety Cushion* via automated upay DPS without risking cash shortages for day-to-day liquidity. This will accelerate your goal completion by approximately 45 days.`,
            structuredContext: JSON.stringify({
              monthlyIncome: 82333,
              monthlyExpenses: 51450,
              savingsRate: 37.5,
              healthScore: 78.5,
            }),
          },
        ],
      },
    },
  });

  console.log(`🤖 Created Sample AI Conversation (ID: ${conversation.id})`);
  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
