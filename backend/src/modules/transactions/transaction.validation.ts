import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], {
    required_error: 'Transaction type is required',
  }),
  amount: z.number().positive('Amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  merchant: z.string().optional(),
  paymentMethod: z.enum(['upay', 'bKash', 'Nagad', 'Bank', 'Card', 'Cash']).default('upay'),
  status: z.enum(['COMPLETED', 'PENDING', 'CANCELLED']).default('COMPLETED'),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const queryTransactionsSchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  paymentMethod: z.string().optional(),
  isRecurring: z.string().optional().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});
