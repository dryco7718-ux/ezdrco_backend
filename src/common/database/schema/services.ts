import { pgTable, text, uuid, timestamp, boolean, decimal, integer } from 'drizzle-orm/pg-core';

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id'),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull(),
  categoryId: uuid('category_id'),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  priceWash: decimal('price_wash', { precision: 8, scale: 2 }),
  priceDryClean: decimal('price_dry_clean', { precision: 8, scale: 2 }),
  priceIron: decimal('price_iron', { precision: 8, scale: 2 }),
  expressPriceWash: decimal('express_price_wash', { precision: 8, scale: 2 }),
  expressPriceDryClean: decimal('express_price_dry_clean', { precision: 8, scale: 2 }),
  expressPriceIron: decimal('express_price_iron', { precision: 8, scale: 2 }),
  unit: text('unit').default('piece'),
  estimatedHours: integer('estimated_hours').default(24),
  expressHours: integer('express_hours').default(4),
  sortOrder: integer('sort_order').default(0),
  isAvailable: boolean('is_available').default(true),
  isExpressAvailable: boolean('is_express_available').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;

export const itemsTable = services;
