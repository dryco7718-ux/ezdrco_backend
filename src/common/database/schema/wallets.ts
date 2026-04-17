import { pgTable, text, uuid, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  balance: numeric('balance', { precision: 10, scale: 2 }).default('0').notNull(),
  currency: text('currency').default('INR'),
  isActive: text('is_active').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull(),
  userId: uuid('user_id').notNull(),

  type: text('type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 10, scale: 2 }).notNull(),

  orderId: uuid('order_id'),
  paymentId: uuid('payment_id'),
  referralId: uuid('referral_id'),

  description: text('description'),
  metadata: jsonb('metadata'),

  status: text('status').default('completed'),
  referenceNumber: text('reference_number'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
