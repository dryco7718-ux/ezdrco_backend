"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.reviewsTable = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orderId: (0, pg_core_1.uuid)('order_id').notNull(),
    customerId: (0, pg_core_1.uuid)('customer_id').notNull(),
    businessId: (0, pg_core_1.uuid)('business_id').notNull(),
    overallRating: (0, pg_core_1.integer)('overall_rating').notNull(),
    qualityRating: (0, pg_core_1.integer)('quality_rating'),
    deliveryRating: (0, pg_core_1.integer)('delivery_rating'),
    packagingRating: (0, pg_core_1.integer)('packaging_rating'),
    title: (0, pg_core_1.text)('title'),
    comment: (0, pg_core_1.text)('comment'),
    businessResponse: (0, pg_core_1.text)('business_response'),
    businessRespondedAt: (0, pg_core_1.timestamp)('business_responded_at', { withTimezone: true }),
    isVisible: (0, pg_core_1.boolean)('is_visible').default(true),
    isReported: (0, pg_core_1.boolean)('is_reported').default(false),
    reportReason: (0, pg_core_1.text)('report_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=reviews.js.map