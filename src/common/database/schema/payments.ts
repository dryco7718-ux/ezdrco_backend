import { pgTable, text, serial, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  customerId: integer('customer_id').notNull(),
  businessId: integer('business_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method').notNull().default('cod'),
  status: text('status').notNull().default('pending'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
export type NewPayment = typeof paymentsTable.$inferInsert;
