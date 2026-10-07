import { TransactionRepository, TransactionFilterParams } from './transaction.repository';
import { NotFoundError, AppError } from '../../utils/errors';
import { UpayPaymentAdapter } from '../payments/paymentProvider';
import prisma from '../../config/database';
import { parseUpaySms } from './upayParser';
import { mfsEngine } from './mfs/mfsEngine';
import { MFSProviderName } from './mfs/mfs.types';

export class TransactionService {
  private repo: TransactionRepository;
  private upayAdapter: UpayPaymentAdapter;

  constructor() {
    this.repo = new TransactionRepository();
    this.upayAdapter = new UpayPaymentAdapter();
  }

  async getTransactions(userId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filterParams: TransactionFilterParams = {
      userId,
      type: query.type,
      category: query.category,
      paymentMethod: query.paymentMethod,
      search: query.search,
      isRecurring: query.isRecurring,
      skip,
      take: limit,
    };

    if (query.startDate) {
      filterParams.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      filterParams.endDate = new Date(query.endDate);
    }

    const [transactions, total] = await this.repo.findMany(filterParams);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string, userId: string) {
    const trx = await this.repo.findById(id, userId);
    if (!trx) {
      throw new NotFoundError('Transaction not found or access denied');
    }
    return trx;
  }

  async createTransaction(userId: string, data: any) {
    let metadataStr = data.metadata ? JSON.stringify(data.metadata) : undefined;

    // If payment method is upay, simulate the upay digital payment execution and attach metadata
    if (data.paymentMethod === 'upay' && !metadataStr) {
      const upayResult = await this.upayAdapter.executePayment({
        walletNumber: '01712345678',
        amount: data.amount,
        type: data.type === 'TRANSFER' ? 'DPS_DEPOSIT' : 'MERCHANT_PAY',
        recipientOrMerchant: data.merchant || data.description,
      });
      metadataStr = JSON.stringify({
        upayTrxId: upayResult.transactionId,
        provider: upayResult.provider,
        fee: upayResult.fee,
        simulated: true,
      });
    }

    return this.repo.create({
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      merchant: data.merchant,
      paymentMethod: data.paymentMethod || 'upay',
      status: data.status || 'COMPLETED',
      isRecurring: Boolean(data.isRecurring),
      recurringFrequency: data.recurringFrequency,
      notes: data.notes,
      metadata: metadataStr,
    });
  }

  async updateTransaction(id: string, userId: string, data: any) {
    const existing = await this.repo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transaction not found or access denied');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    return this.repo.update(id, userId, updateData);
  }

  async deleteTransaction(id: string, userId: string) {
    const existing = await this.repo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Transaction not found or access denied');
    }
    return this.repo.delete(id, userId);
  }

  async syncUpayWallet(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundError('User not found');

    const walletNumber = user.upayWalletNumber || '01712345678';

    // Fetch existing transaction metadata to prevent duplicate ingestion
    const existing = await prisma.transaction.findMany({
      where: { userId, paymentMethod: 'upay' },
      select: { metadata: true },
    });

    const existingTrxIds = new Set<string>();
    existing.forEach((tx) => {
      if (tx.metadata) {
        try {
          const meta = JSON.parse(tx.metadata);
          if (meta.upayTrxId) existingTrxIds.add(meta.upayTrxId);
        } catch {}
      }
    });

    const now = new Date();
    // Curated dynamic MFS feed of realistic recent Bangladeshi transactions
    const candidateFeed = [
      {
        type: 'EXPENSE' as const,
        category: 'Food & Groceries',
        amount: 2450.0,
        merchant: 'Shwapno Superstore (Gulshan-2)',
        description: 'upay Merchant QR Payment - Shwapno',
        hoursAgo: 2,
        fee: 0,
        trxId: `UPAY${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}SHW91`,
      },
      {
        type: 'EXPENSE' as const,
        category: 'Utilities & Bills',
        amount: 3850.0,
        merchant: 'DESCO Electricity',
        description: 'upay Bill Pay - DESCO Pre-Paid Meter',
        hoursAgo: 14,
        fee: 0,
        trxId: `UPAY${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}DSC44`,
      },
      {
        type: 'EXPENSE' as const,
        category: 'Utilities & Bills',
        amount: 500.0,
        merchant: 'Grameenphone Postpaid',
        description: 'upay Mobile Recharge - 01712345678',
        hoursAgo: 28,
        fee: 0,
        trxId: `UPAY${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}GP772`,
      },
      {
        type: 'EXPENSE' as const,
        category: 'Shopping & Lifestyle',
        amount: 3200.0,
        merchant: 'Aarong Lifestyle',
        description: 'upay Merchant Pay - Aarong Uttara Outlet',
        hoursAgo: 48,
        fee: 0,
        trxId: `UPAY${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}ARG31`,
      },
      {
        type: 'TRANSFER' as const,
        category: 'Savings & Investments',
        amount: 5000.0,
        merchant: 'IDLC Digital DPS',
        description: 'Automated Monthly DPS Deposit via upay',
        hoursAgo: 72,
        fee: 0,
        trxId: `UPAY${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}DPS99`,
      },
    ];

    const newItems = candidateFeed.filter((item) => !existingTrxIds.has(item.trxId));

    const created: any[] = [];
    for (const item of newItems) {
      const itemDate = new Date(now.getTime() - item.hoursAgo * 60 * 60 * 1000);
      const metadata = JSON.stringify({
        upayTrxId: item.trxId,
        walletNumber,
        provider: 'upay (United Commercial Bank MFS)',
        fee: item.fee,
        simulated: true,
        syncedAt: now.toISOString(),
      });

      const tx = await this.repo.create({
        userId,
        type: item.type,
        amount: item.amount,
        category: item.category,
        description: item.description,
        date: itemDate,
        merchant: item.merchant,
        paymentMethod: 'upay',
        status: 'COMPLETED',
        isRecurring: item.category.includes('Utilities') || item.category.includes('Savings'),
        recurringFrequency: 'MONTHLY',
        metadata,
      });
      created.push(tx);
    }

    if (!user.upayConnected) {
      await prisma.user.update({
        where: { id: userId },
        data: { upayConnected: true, upayWalletNumber: walletNumber },
      });
    }

    return {
      syncedCount: created.length,
      walletNumber,
      provider: 'upay (United Commercial Bank MFS)',
      newTransactions: created,
      message:
        created.length > 0
          ? `Successfully auto-synced ${created.length} new transactions from upay wallet ${walletNumber}`
          : `Wallet ${walletNumber} is already up to date with no new transactions to import`,
    };
  }

  async parseAndIngestUpaySms(userId: string, smsText: string, autoSave = false) {
    const parsed = parseUpaySms(smsText);

    // Check if duplicate trxId already exists
    const existing = await prisma.transaction.findFirst({
      where: {
        userId,
        metadata: {
          contains: parsed.trxId,
        },
      },
    });

    if (existing) {
      return {
        alreadyExists: true,
        parsed,
        transaction: existing,
        message: `Transaction with TrxID ${parsed.trxId} is already logged in your ledger.`,
      };
    }

    if (!autoSave) {
      return {
        alreadyExists: false,
        parsed,
        message: 'SMS successfully parsed. Ready to ingest into ledger.',
      };
    }

    const metadata = JSON.stringify({
      upayTrxId: parsed.trxId,
      provider: 'upay (United Commercial Bank MFS)',
      fee: parsed.fee,
      balanceAfter: parsed.balanceAfter,
      source: 'SMS_PARSER',
      rawSms: parsed.rawSms,
      ingestedAt: new Date().toISOString(),
    });

    const tx = await this.repo.create({
      userId,
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      date: new Date(),
      merchant: parsed.merchant,
      paymentMethod: 'upay',
      status: 'COMPLETED',
      metadata,
    });

    return {
      alreadyExists: false,
      parsed,
      transaction: tx,
      message: `Successfully ingested ৳${parsed.amount.toLocaleString()} (${parsed.merchant}) into your ledger!`,
    };
  }

  async parseAndIngestMfsSms(
    userId: string,
    smsText: string,
    providerHint?: MFSProviderName,
    autoSave = false
  ) {
    const parsed = mfsEngine.parseSms(smsText, providerHint);

    // Check if duplicate trxId already exists
    const existing = await prisma.transaction.findFirst({
      where: {
        userId,
        metadata: {
          contains: parsed.trxId,
        },
      },
    });

    if (existing) {
      return {
        alreadyExists: true,
        parsed,
        transaction: existing,
        message: `Transaction with TrxID ${parsed.trxId} is already logged in your ledger.`,
      };
    }

    if (!autoSave) {
      return {
        alreadyExists: false,
        parsed,
        message: `${parsed.providerDisplayName} SMS parsed successfully (${Math.round(parsed.confidence * 100)}% confidence). Ready to ingest.`,
      };
    }

    const metadata = JSON.stringify({
      mfsTrxId: parsed.trxId,
      provider: parsed.providerDisplayName,
      fee: parsed.fee,
      balanceAfter: parsed.balanceAfter,
      source: 'MFS_SMS_PARSER',
      confidence: parsed.confidence,
      detectedLanguage: parsed.detectedLanguage,
      hadBanglaNumerals: parsed.hadBanglaNumerals,
      rawSms: parsed.rawSms,
      ingestedAt: new Date().toISOString(),
    });

    const tx = await this.repo.create({
      userId,
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      date: new Date(),
      merchant: parsed.counterparty,
      paymentMethod: parsed.paymentMethod,
      status: 'COMPLETED',
      metadata,
    });

    return {
      alreadyExists: false,
      parsed,
      transaction: tx,
      message: `Successfully ingested ৳${parsed.amount.toLocaleString()} (${parsed.counterparty}) from ${parsed.providerDisplayName}!`,
    };
  }
}

