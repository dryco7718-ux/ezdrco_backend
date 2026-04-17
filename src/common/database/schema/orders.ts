import { pgTable, text, uuid, timestamp, numeric, boolean, jsonb, date } from 'drizzle-orm/pg-core';

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: uuid('customer_id').notNull(),
  businessId: uuid('business_id').notNull(),
  riderId: uuid('rider_id'),
  status: text('status').notNull().default('requested'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  pickupScheduledAt: timestamp('pickup_scheduled_at', { withTimezone: true }),
  pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
  reachedStoreAt: timestamp('reached_store_at', { withTimezone: true }),
  processingStartedAt: timestamp('processing_started_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  outForDeliveryAt: timestamp('out_for_delivery_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  pickupAddressId: uuid('pickup_address_id'),
  pickupDate: date('pickup_date'),
  pickupSlot: text('pickup_slot'),
  pickupOtp: text('pickup_otp'),
  deliveryAddressId: uuid('delivery_address_id'),
  deliveryDate: date('delivery_date'),
  deliverySlot: text('delivery_slot'),
  deliveryOtp: text('delivery_otp'),
  isExpress: boolean('is_express').default(false),
  isSubscriptionOrder: boolean('is_subscription_order').default(false),
  subscriptionId: uuid('subscription_id'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  couponCode: text('coupon_code'),
  couponDiscount: numeric('coupon_discount', { precision: 10, scale: 2 }).default('0'),
  deliveryCharge: numeric('delivery_charge', { precision: 8, scale: 2 }).default('0'),
  expressCharge: numeric('express_charge', { precision: 8, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  platformCommissionRate: numeric('platform_commission_rate', { precision: 5, scale: 2 }).default('12'),
  platformCommissionAmount: numeric('platform_commission_amount', { precision: 10, scale: 2 }).default('0'),
  businessEarnings: numeric('business_earnings', { precision: 10, scale: 2 }).default('0'),
  paymentMethod: text('payment_method').notNull().default('cod'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  customerNotes: text('customer_notes'),
  businessNotes: text('business_notes'),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  serviceId: uuid('service_id'),
  itemName: text('item_name').notNull(),
  itemCategory: text('item_category'),
  serviceType: text('service_type').notNull(),
  quantity: numeric('quantity', { precision: 8, scale: 2 }).notNull().default('1'),
  unit: text('unit').default('piece'),
  unitPrice: numeric('unit_price', { precision: 8, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  isExpress: boolean('is_express').default(false),
  expressMultiplier: numeric('express_multiplier', { precision: 3, scale: 1 }).default('1'),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  changedBy: uuid('changed_by'),
  changedByType: text('changed_by_type'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

export const orders = ordersTable;
