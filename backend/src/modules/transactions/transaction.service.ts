import { TransactionRepository, TransactionFilterParams } from './transaction.repository';
import { NotFoundError, AppError } from '../../utils/errors';
import { UpayPaymentAdapter } from '../payments/paymentProvider';

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
}
