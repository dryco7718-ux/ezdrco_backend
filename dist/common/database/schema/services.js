"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsTable = exports.services = exports.serviceCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.serviceCategories = (0, pg_core_1.pgTable)('service_categories', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    businessId: (0, pg_core_1.uuid)('business_id'),
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug'),
    description: (0, pg_core_1.text)('description'),
    icon: (0, pg_core_1.text)('icon'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    businessId: (0, pg_core_1.uuid)('business_id').notNull(),
    categoryId: (0, pg_core_1.uuid)('category_id'),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    icon: (0, pg_core_1.text)('icon'),
    priceWash: (0, pg_core_1.decimal)('price_wash', { precision: 8, scale: 2 }),
    priceDryClean: (0, pg_core_1.decimal)('price_dry_clean', { precision: 8, scale: 2 }),
    priceIron: (0, pg_core_1.decimal)('price_iron', { precision: 8, scale: 2 }),
    expressPriceWash: (0, pg_core_1.decimal)('express_price_wash', { precision: 8, scale: 2 }),
    expressPriceDryClean: (0, pg_core_1.decimal)('express_price_dry_clean', { precision: 8, scale: 2 }),
    expressPriceIron: (0, pg_core_1.decimal)('express_price_iron', { precision: 8, scale: 2 }),
    unit: (0, pg_core_1.text)('unit').default('piece'),
    estimatedHours: (0, pg_core_1.integer)('estimated_hours').default(24),
    expressHours: (0, pg_core_1.integer)('express_hours').default(4),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    isAvailable: (0, pg_core_1.boolean)('is_available').default(true),
    isExpressAvailable: (0, pg_core_1.boolean)('is_express_available').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.itemsTable = exports.services;
//# sourceMappingURL=services.js.map