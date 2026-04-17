import { pgTable, text, uuid, timestamp, numeric, integer, boolean, date } from 'drizzle-orm/pg-core';

export const couponsTable = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id'),
  code: text('code').notNull().unique(),
  title: text('title'),
  description: text('description'),
  discountType: text('discount_type').notNull().default('percentage'),
  discountValue: numeric('discount_value', { precision: 8, scale: 2 }).notNull(),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 8, scale: 2 }),
  minOrderValue: numeric('min_order_value', { precision: 8, scale: 2 }).default('0'),
  usageLimitPerUser: integer('usage_limit_per_user').default(1),
  totalUsageLimit: integer('total_usage_limit'),
  usedCount: integer('used_count').default(0),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Coupon = typeof couponsTable.$inferSelect;
export type NewCoupon = typeof couponsTable.$inferInsert;
