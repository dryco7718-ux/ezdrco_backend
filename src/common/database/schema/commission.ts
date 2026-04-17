import { pgTable, uuid, timestamp, numeric } from 'drizzle-orm/pg-core';

export const commissionSettingsTable = pgTable('admin_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  basicRate: numeric('basic_plan_commission', { precision: 5, scale: 2 }).notNull().default('12'),
  proRate: numeric('pro_plan_commission', { precision: 5, scale: 2 }).notNull().default('10'),
  premiumRate: numeric('premium_plan_commission', { precision: 5, scale: 2 }).notNull().default('8'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CommissionSettings = typeof commissionSettingsTable.$inferSelect;
export type NewCommissionSettings = typeof commissionSettingsTable.$inferInsert;
