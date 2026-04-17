import { pgTable, text, uuid, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';

export const subscriptionsTable = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 8, scale: 2 }).notNull(),
  duration: integer('duration').notNull().default(30),
  itemsPerMonth: integer('items_per_month'),
  services: text('services').array(),
  freePickups: integer('free_pickups').default(0),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0'),
  businessId: uuid('business_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
