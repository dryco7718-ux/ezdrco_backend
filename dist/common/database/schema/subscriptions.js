"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.subscriptionsTable = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    price: (0, pg_core_1.numeric)('price', { precision: 8, scale: 2 }).notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull().default(30),
    itemsPerMonth: (0, pg_core_1.integer)('items_per_month'),
    services: (0, pg_core_1.text)('services').array(),
    freePickups: (0, pg_core_1.integer)('free_pickups').default(0),
    discountPercent: (0, pg_core_1.numeric)('discount_percent', { precision: 5, scale: 2 }).default('0'),
    businessId: (0, pg_core_1.uuid)('business_id'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=subscriptions.js.map