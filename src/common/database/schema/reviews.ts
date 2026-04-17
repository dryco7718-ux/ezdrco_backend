import { pgTable, text, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const reviewsTable = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  customerId: uuid('customer_id').notNull(),
  businessId: uuid('business_id').notNull(),
  overallRating: integer('overall_rating').notNull(),
  qualityRating: integer('quality_rating'),
  deliveryRating: integer('delivery_rating'),
  packagingRating: integer('packaging_rating'),
  title: text('title'),
  comment: text('comment'),
  businessResponse: text('business_response'),
  businessRespondedAt: timestamp('business_responded_at', { withTimezone: true }),
  isVisible: boolean('is_visible').default(true),
  isReported: boolean('is_reported').default(false),
  reportReason: text('report_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Review = typeof reviewsTable.$inferSelect;
export type NewReview = typeof reviewsTable.$inferInsert;
