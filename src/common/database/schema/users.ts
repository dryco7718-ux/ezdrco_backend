import { pgTable, text, uuid, timestamp, boolean, decimal, jsonb, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('customer'),
  avatar: text('avatar'),
  address: text('address'),
  city: text('city').default('Narnaul'),
  pincode: text('pincode'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  loginCount: integer('login_count').default(0),
  fcmToken: text('fcm_token'),
  deviceInfo: jsonb('device_info'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Backward compatibility alias
export const customersTable = users;
export type Customer = User;
