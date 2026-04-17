import { pgTable, text, uuid, timestamp, integer, boolean, numeric } from 'drizzle-orm/pg-core';

export const ridersTable = pgTable('riders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  idProofUrl: text('id_proof_url'),
  licenseUrl: text('license_url'),
  photoUrl: text('photo_url'),
  businessId: uuid('business_id'),
  isBusinessSpecific: boolean('is_business_specific').default(false),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  isAvailable: boolean('is_available').default(true),
  currentLat: numeric('current_lat', { precision: 10, scale: 7 }),
  currentLng: numeric('current_lng', { precision: 10, scale: 7 }),
  locationUpdatedAt: timestamp('location_updated_at', { withTimezone: true }),
  totalDeliveries: integer('total_deliveries').default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('5'),
  ratingCount: integer('rating_count').default(0),
  vehicleType: text('vehicle_type').default('bike'),
  vehicleNumber: text('vehicle_number'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const riderAssignments = pgTable('rider_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  riderId: uuid('rider_id').notNull(),
  assignmentType: text('assignment_type').notNull(),
  status: text('status').default('assigned'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  pickupOtp: text('pickup_otp'),
  deliveryOtp: text('delivery_otp'),
  pickupLat: numeric('pickup_lat', { precision: 10, scale: 7 }),
  pickupLng: numeric('pickup_lng', { precision: 10, scale: 7 }),
  deliveryLat: numeric('delivery_lat', { precision: 10, scale: 7 }),
  deliveryLng: numeric('delivery_lng', { precision: 10, scale: 7 }),
  riderEarnings: numeric('rider_earnings', { precision: 8, scale: 2 }).default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Rider = typeof ridersTable.$inferSelect;
export type NewRider = typeof ridersTable.$inferInsert;
export type RiderAssignment = typeof riderAssignments.$inferSelect;
export type NewRiderAssignment = typeof riderAssignments.$inferInsert;
