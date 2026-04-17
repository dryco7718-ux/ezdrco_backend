"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionSettingsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.commissionSettingsTable = (0, pg_core_1.pgTable)('admin_settings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    basicRate: (0, pg_core_1.numeric)('basic_plan_commission', { precision: 5, scale: 2 }).notNull().default('12'),
    proRate: (0, pg_core_1.numeric)('pro_plan_commission', { precision: 5, scale: 2 }).notNull().default('10'),
    premiumRate: (0, pg_core_1.numeric)('premium_plan_commission', { precision: 5, scale: 2 }).notNull().default('8'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=commission.js.map