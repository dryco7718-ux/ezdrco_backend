"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.couponsTable = (0, pg_core_1.pgTable)('coupons', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    businessId: (0, pg_core_1.uuid)('business_id'),
    code: (0, pg_core_1.text)('code').notNull().unique(),
    title: (0, pg_core_1.text)('title'),
    description: (0, pg_core_1.text)('description'),
    discountType: (0, pg_core_1.text)('discount_type').notNull().default('percentage'),
    discountValue: (0, pg_core_1.numeric)('discount_value', { precision: 8, scale: 2 }).notNull(),
    maxDiscountAmount: (0, pg_core_1.numeric)('max_discount_amount', { precision: 8, scale: 2 }),
    minOrderValue: (0, pg_core_1.numeric)('min_order_value', { precision: 8, scale: 2 }).default('0'),
    usageLimitPerUser: (0, pg_core_1.integer)('usage_limit_per_user').default(1),
    totalUsageLimit: (0, pg_core_1.integer)('total_usage_limit'),
    usedCount: (0, pg_core_1.integer)('used_count').default(0),
    startDate: (0, pg_core_1.date)('start_date'),
    endDate: (0, pg_core_1.date)('end_date'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=coupons.js.map