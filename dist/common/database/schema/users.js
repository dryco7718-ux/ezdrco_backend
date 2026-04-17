"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersTable = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull().unique(),
    email: (0, pg_core_1.text)('email'),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    role: (0, pg_core_1.text)('role').notNull().default('customer'),
    avatar: (0, pg_core_1.text)('avatar'),
    address: (0, pg_core_1.text)('address'),
    city: (0, pg_core_1.text)('city').default('Narnaul'),
    pincode: (0, pg_core_1.text)('pincode'),
    lat: (0, pg_core_1.decimal)('lat', { precision: 10, scale: 7 }),
    lng: (0, pg_core_1.decimal)('lng', { precision: 10, scale: 7 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    isVerified: (0, pg_core_1.boolean)('is_verified').default(false),
    phoneVerifiedAt: (0, pg_core_1.timestamp)('phone_verified_at', { withTimezone: true }),
    emailVerifiedAt: (0, pg_core_1.timestamp)('email_verified_at', { withTimezone: true }),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    loginCount: (0, pg_core_1.integer)('login_count').default(0),
    fcmToken: (0, pg_core_1.text)('fcm_token'),
    deviceInfo: (0, pg_core_1.jsonb)('device_info'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
});
exports.customersTable = exports.users;
//# sourceMappingURL=users.js.map