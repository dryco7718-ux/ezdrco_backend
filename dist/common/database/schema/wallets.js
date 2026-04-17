"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransactions = exports.wallets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.wallets = (0, pg_core_1.pgTable)('wallets', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().unique(),
    balance: (0, pg_core_1.numeric)('balance', { precision: 10, scale: 2 }).default('0').notNull(),
    currency: (0, pg_core_1.text)('currency').default('INR'),
    isActive: (0, pg_core_1.text)('is_active').default('active'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.walletTransactions = (0, pg_core_1.pgTable)('wallet_transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    walletId: (0, pg_core_1.uuid)('wallet_id').notNull(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    amount: (0, pg_core_1.numeric)('amount', { precision: 10, scale: 2 }).notNull(),
    balanceAfter: (0, pg_core_1.numeric)('balance_after', { precision: 10, scale: 2 }).notNull(),
    orderId: (0, pg_core_1.uuid)('order_id'),
    paymentId: (0, pg_core_1.uuid)('payment_id'),
    referralId: (0, pg_core_1.uuid)('referral_id'),
    description: (0, pg_core_1.text)('description'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    status: (0, pg_core_1.text)('status').default('completed'),
    referenceNumber: (0, pg_core_1.text)('reference_number'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=wallets.js.map