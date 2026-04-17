"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAddresses = exports.addressesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.addressesTable = (0, pg_core_1.pgTable)('user_addresses', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    label: (0, pg_core_1.text)('label').notNull().default('home'),
    line1: (0, pg_core_1.text)('line1').notNull(),
    line2: (0, pg_core_1.text)('line2'),
    landmark: (0, pg_core_1.text)('landmark'),
    city: (0, pg_core_1.text)('city').notNull().default('Narnaul'),
    pincode: (0, pg_core_1.text)('pincode').notNull(),
    lat: (0, pg_core_1.numeric)('lat', { precision: 10, scale: 7 }),
    lng: (0, pg_core_1.numeric)('lng', { precision: 10, scale: 7 }),
    contactName: (0, pg_core_1.text)('contact_name'),
    contactPhone: (0, pg_core_1.text)('contact_phone'),
    isDefault: (0, pg_core_1.boolean)('is_default').default(false),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.userAddresses = exports.addressesTable;
//# sourceMappingURL=addresses.js.map